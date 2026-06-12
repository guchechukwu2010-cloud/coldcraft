import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

router.get("/profile", requireAuth, async (req, res) => {
  try {
    let { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", req.user.id)
      .single();

    if (error && error.code === "PGRST116") {
      // Auto-create profile
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      nextReset.setHours(0, 0, 0, 0);

      const { data: newProfile } = await supabase
        .from("user_profiles")
        .insert({
          id: req.user.id,
          plan: "free",
          usage_count: 0,
          usage_reset_at: nextReset.toISOString(),
        })
        .select()
        .single();

      profile = newProfile;
    } else if (error) {
      throw error;
    }

    return res.json({
      plan: profile.plan,
      usageCount: profile.usage_count,
      usageLimit: profile.plan === "free" ? 5 : null,
      resetAt: profile.usage_reset_at,
      planActivatedAt: profile.plan_activated_at,
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
