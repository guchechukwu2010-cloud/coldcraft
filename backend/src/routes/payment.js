import express from "express";
import crypto from "crypto";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

const NEXAPAY_API_KEY = process.env.NEXAPAY_API_KEY;
const NEXAPAY_WEBHOOK_SECRET = process.env.NEXAPAY_WEBHOOK_SECRET;
const NEXAPAY_MERCHANT_ID = process.env.NEXAPAY_MERCHANT_ID;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Create checkout session with NexaPay
router.post("/create-checkout", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;

    // NexaPay checkout creation
    // Docs: https://docs.nexapay.io (replace with actual NexaPay API endpoint)
    const response = await fetch("https://api.nexapay.io/v1/checkout/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NEXAPAY_API_KEY}`,
      },
      body: JSON.stringify({
        merchant_id: NEXAPAY_MERCHANT_ID,
        amount: 19.0,
        currency: "USD",
        accepted_coins: ["USDT", "USDC", "BTC"],
        order_id: `coldcraft_${userId}_${Date.now()}`,
        customer_email: userEmail,
        metadata: { user_id: userId, plan: "pro" },
        success_url: `${FRONTEND_URL}/dashboard?payment=success`,
        cancel_url: `${FRONTEND_URL}/pricing?payment=cancelled`,
        webhook_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/payment/webhook`,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("NexaPay checkout error:", errData);
      // For development/demo purposes, return a mock checkout URL
      if (process.env.NODE_ENV === "development") {
        return res.json({
          checkout_url: `${FRONTEND_URL}/dashboard?payment=demo`,
          session_id: `demo_session_${Date.now()}`,
        });
      }
      throw new Error("Failed to create payment session");
    }

    const data = await response.json();

    // Store pending transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      session_id: data.session_id || data.id,
      amount: 19.0,
      currency: "USD",
      status: "pending",
    });

    return res.json({ checkout_url: data.checkout_url, session_id: data.session_id || data.id });
  } catch (err) {
    console.error("Payment checkout error:", err);
    return res.status(500).json({ error: "Failed to create payment session" });
  }
});

// NexaPay webhook — receives raw body for signature verification
router.post("/webhook", async (req, res) => {
  const signature = req.headers["x-nexapay-signature"] || req.headers["nexapay-signature"];

  if (!signature) {
    console.warn("Webhook received without signature");
    return res.status(400).json({ error: "Missing signature" });
  }

  // Verify HMAC signature
  try {
    const rawBody = req.body; // raw buffer
    const expectedSig = crypto
      .createHmac("sha256", NEXAPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSig, "hex");

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      console.warn("Webhook signature mismatch");
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch (err) {
    console.error("Signature verification error:", err);
    return res.status(401).json({ error: "Signature verification failed" });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  // Handle payment completion
  if (event.type === "payment.completed" || event.status === "completed") {
    const userId = event.metadata?.user_id;
    const txHash = event.transaction_hash || event.tx_hash;
    const sessionId = event.session_id || event.order_id;

    if (!userId) {
      console.error("Webhook missing user_id in metadata");
      return res.status(400).json({ error: "Missing user_id" });
    }

    try {
      // Upgrade user to pro
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          plan: "pro",
          plan_activated_at: new Date().toISOString(),
          plan_expires_at: null, // Lifetime/monthly — adjust per your billing model
        })
        .eq("id", userId);

      if (profileError) throw profileError;

      // Store transaction record
      await supabase.from("transactions").upsert({
        user_id: userId,
        session_id: sessionId,
        tx_hash: txHash,
        amount: event.amount || 19.0,
        currency: event.currency || "USD",
        coin: event.coin || event.crypto_currency,
        status: "completed",
        completed_at: new Date().toISOString(),
      });

      console.log(`✅ Upgraded user ${userId} to Pro. TX: ${txHash}`);
      return res.json({ received: true });
    } catch (err) {
      console.error("Failed to upgrade user:", err);
      return res.status(500).json({ error: "Failed to process payment" });
    }
  }

  // Acknowledge other event types
  return res.json({ received: true });
});

// Get payment status (poll from frontend after redirect)
router.get("/status", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("plan, plan_activated_at")
    .eq("id", req.user.id)
    .single();

  const { data: latestTx } = await supabase
    .from("transactions")
    .select("tx_hash, status, completed_at, coin")
    .eq("user_id", req.user.id)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  return res.json({
    plan: profile?.plan || "free",
    activatedAt: profile?.plan_activated_at,
    latestTransaction: latestTx || null,
  });
});

export default router;
