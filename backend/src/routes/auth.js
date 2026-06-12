import express from "express";
import { supabase } from "../lib/supabase.js";

const router = express.Router();

// These are thin wrappers — actual auth is handled by Supabase client SDK on frontend.
// Backend routes here are for server-side auth operations if needed.

// Verify token and return user info
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: "Invalid token" });
  return res.json({ user });
});

export default router;
