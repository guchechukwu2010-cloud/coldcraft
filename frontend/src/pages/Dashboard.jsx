import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { generateEmails, getUserProfile, getPaymentStatus } from "../lib/api";

const TONE_CONFIG = {
  friendly: { label: "Friendly", color: "text-jade-400", bg: "bg-jade-400/10", border: "border-jade-400/20" },
  professional: { label: "Professional", color: "text-arctic-400", bg: "bg-arctic-500/10", border: "border-arctic-500/20" },
  direct: { label: "Direct", color: "text-ember-400", bg: "bg-ember-400/10", border: "border-ember-400/20" },
};

function EmailCard({ email, index }) {
  const [copied, setCopied] = useState(false);
  const config = TONE_CONFIG[email.tone] || TONE_CONFIG.professional;
  const fullText = `Subject: ${email.subject}\n\n${email.body}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`card p-5 border ${config.border} hover:shadow-lg transition-all duration-200 animate-fade-up`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-mono font-medium uppercase tracking-widest px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
          {config.label}
        </span>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs font-display font-medium transition-all duration-200 px-3 py-1.5 rounded-lg ${
            copied
              ? "text-jade-400 bg-jade-400/10"
              : "text-slate-400 hover:text-white hover:bg-obsidian-700"
          }`}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6L4 9L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1 8V2a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2"/></svg>
              Copy
            </>
          )}
        </button>
      </div>

      <div className="mb-3">
        <p className="text-xs font-mono text-slate-600 mb-1">Subject line</p>
        <p className="text-sm font-display font-semibold text-white leading-snug">{email.subject}</p>
      </div>

      <div>
        <p className="text-xs font-mono text-slate-600 mb-1">Body</p>
        <p className="text-sm text-slate-300 font-body leading-relaxed whitespace-pre-line">{email.body}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-obsidian-700">
        <span className="text-xs font-mono text-slate-600">{email.body.length} chars</span>
      </div>
    </div>
  );
}

function UsageBar({ count, limit, plan, resetAt }) {
  const pct = limit ? Math.min((count / limit) * 100, 100) : 0;
  const resetDate = resetAt ? new Date(resetAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${plan === "pro" ? "bg-ember-400" : "bg-slate-500"}`} />
        <div>
          <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{plan === "pro" ? "Pro Plan" : "Free Tier"}</p>
          <p className="text-sm font-display font-semibold text-white">
            {plan === "pro" ? "Unlimited generations" : `${count} / ${limit} emails used`}
          </p>
        </div>
      </div>

      {plan === "free" && (
        <div className="flex-1">
          <div className="h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-arctic-500 to-arctic-400 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 font-body mt-1">Resets {resetDate}</p>
        </div>
      )}

      {plan === "free" && (
        <Link to="/pricing" className="btn-ghost text-xs py-2 px-4 whitespace-nowrap">
          Upgrade to Pro →
        </Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    prospectName: "",
    jobTitle: "",
    company: "",
    industry: "",
    linkedinUrl: "",
    offer: "",
  });
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(searchParams.get("payment") === "success");

  const loadProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (paymentSuccess) {
      // Poll for plan update
      const timer = setTimeout(loadProfile, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, loadProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEmails([]);
    setLoading(true);

    try {
      const result = await generateEmails(form);
      setEmails(result.emails);
      setProfile((prev) => prev ? { ...prev, usageCount: result.usage.count } : prev);
    } catch (err) {
      if (err.code === "LIMIT_REACHED") {
        setError("You've reached your free tier limit. Upgrade to Pro for unlimited emails.");
      } else {
        setError(err.error || "Failed to generate emails. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Payment success banner */}
        {paymentSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-jade-400/10 border border-jade-400/20 flex items-center gap-3">
            <span className="text-jade-400 text-xl">🎉</span>
            <div>
              <p className="font-display font-semibold text-white text-sm">Payment successful!</p>
              <p className="text-xs text-jade-400/80 font-body">Your Pro plan is now active. Enjoy unlimited email generation.</p>
            </div>
            <button onClick={() => setPaymentSuccess(false)} className="ml-auto text-slate-500 hover:text-white">×</button>
          </div>
        )}

        {/* Usage bar */}
        {profile && (
          <div className="mb-6">
            <UsageBar
              count={profile.usageCount}
              limit={profile.usageLimit}
              plan={profile.plan}
              resetAt={profile.resetAt}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* Input form */}
          <div className="card p-6 h-fit">
            <h2 className="font-display font-bold text-white text-lg mb-1">Prospect Details</h2>
            <p className="text-xs text-slate-500 font-body mb-6">Fill in what you know. The more context, the better the email.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">LinkedIn URL <span className="text-slate-600 normal-case font-normal">(optional)</span></label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={updateForm("linkedinUrl")}
                  className="input-field"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-obsidian-700" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-obsidian-900 text-xs text-slate-600 font-mono">or enter manually</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input
                    value={form.prospectName}
                    onChange={updateForm("prospectName")}
                    className="input-field"
                    placeholder="Sarah Chen"
                  />
                </div>
                <div>
                  <label className="label">Job Title</label>
                  <input
                    value={form.jobTitle}
                    onChange={updateForm("jobTitle")}
                    className="input-field"
                    placeholder="VP of Sales"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Company</label>
                  <input
                    value={form.company}
                    onChange={updateForm("company")}
                    className="input-field"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <input
                    value={form.industry}
                    onChange={updateForm("industry")}
                    className="input-field"
                    placeholder="SaaS / FinTech"
                  />
                </div>
              </div>

              <div>
                <label className="label">Your Offer / Service <span className="text-red-400">*</span></label>
                <textarea
                  value={form.offer}
                  onChange={updateForm("offer")}
                  className="input-field resize-none"
                  rows={4}
                  placeholder="We help B2B SaaS companies generate pipeline through automated LinkedIn outreach. We typically save 10 hours/week per SDR..."
                  required
                />
                <p className="text-xs text-slate-600 mt-1">{form.offer.length}/1000</p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-body">
                  {error}
                  {error.includes("limit") && (
                    <Link to="/pricing" className="ml-2 text-arctic-400 underline">Upgrade →</Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.offer}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Crafting emails...
                  </>
                ) : (
                  "Generate 3 email variations →"
                )}
              </button>
            </form>
          </div>

          {/* Email output */}
          <div className="space-y-4">
            {loading && (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="card p-5 h-48">
                    <div className="shimmer h-full rounded-lg" />
                  </div>
                ))}
              </div>
            )}

            {!loading && emails.length === 0 && (
              <div className="card p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 rounded-xl bg-obsidian-800 flex items-center justify-center mb-4 text-2xl">✉️</div>
                <p className="font-display font-semibold text-white mb-2">Ready to write</p>
                <p className="text-sm text-slate-500 font-body">Fill in your prospect details and offer, then click Generate.</p>
              </div>
            )}

            {!loading && emails.map((email, i) => (
              <EmailCard key={email.tone} email={email} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
