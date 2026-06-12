import express from "express";
import { rateLimit } from "express-rate-limit";
import validator from "validator";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

const FREE_LIMIT = 5;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const emailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests. Please wait a moment." },
});

function sanitizeInput(str, maxLen = 500) {
  if (typeof str !== "string") return "";
  return validator.escape(str.trim()).slice(0, maxLen);
}

async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code === "PGRST116") {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);
    const { data: newProfile, error: createError } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        plan: "free",
        usage_count: 0,
        usage_reset_at: nextReset.toISOString(),
      })
      .select()
      .single();
    if (createError) throw createError;
    return newProfile;
  }

  if (error) throw error;

  const resetDate = new Date(data.usage_reset_at);
  if (new Date() >= resetDate) {
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);
    nextReset.setDate(1);
    nextReset.setHours(0, 0, 0, 0);
    const { data: updated } = await supabase
      .from("user_profiles")
      .update({ usage_count: 0, usage_reset_at: nextReset.toISOString() })
      .eq("id", userId)
      .select()
      .single();
    return updated || data;
  }

  return data;
}

async function callGroq(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

router.post("/generate", requireAuth, emailLimiter, async (req, res) => {
  try {
    const { prospectName, jobTitle, company, industry, linkedinUrl, offer } = req.body;

    if (!offer || typeof offer !== "string") {
      return res.status(400).json({ error: "Offer/service description is required" });
    }
    if (!prospectName && !linkedinUrl) {
      return res.status(400).json({ error: "Prospect name or LinkedIn URL is required" });
    }

    const cleanProspectName = sanitizeInput(prospectName || "the prospect", 100);
    const cleanJobTitle = sanitizeInput(jobTitle || "", 100);
    const cleanCompany = sanitizeInput(company || "", 100);
    const cleanIndustry = sanitizeInput(industry || "", 100);
    const cleanOffer = sanitizeInput(offer, 1000);

    const profile = await getUserProfile(req.user.id);

    if (profile.plan === "free" && profile.usage_count >= FREE_LIMIT) {
      return res.status(403).json({
        error: "Free tier limit reached",
        code: "LIMIT_REACHED",
        limit: FREE_LIMIT,
        usage: profile.usage_count,
      });
    }

    const prompt = `You are a cold email copywriter. Generate exactly 3 cold email variations for this prospect.

Prospect:
- Name: ${cleanProspectName}
- Job Title: ${cleanJobTitle}
- Company: ${cleanCompany}
- Industry: ${cleanIndustry}

My offer: ${cleanOffer}

Rules:
- Each email must be 100-180 words
- No generic openers like "Hope this finds you well"
- Personalize to their role and company
- Focus on value, not features
- End with a soft clear CTA

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "emails": [
    { "tone": "friendly", "subject": "...", "body": "..." },
    { "tone": "professional", "subject": "...", "body": "..." },
    { "tone": "direct", "subject": "...", "body": "..." }
  ]
}`;

    const rawText = await callGroq(prompt);

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    if (!parsed.emails || parsed.emails.length !== 3) {
      throw new Error("Invalid AI response structure");
    }

    await supabase
      .from("user_profiles")
      .update({ usage_count: profile.usage_count + 1 })
      .eq("id", req.user.id);

    return res.json({
      emails: parsed.emails,
      usage: {
        count: profile.usage_count + 1,
        limit: profile.plan === "free" ? FREE_LIMIT : null,
        plan: profile.plan,
        resetAt: profile.usage_reset_at,
      },
    });
  } catch (err) {
    console.error("Email generation error:", err);
    return res.status(500).json({ error: "Failed to generate emails. Please try again." });
  }
});

export default router;