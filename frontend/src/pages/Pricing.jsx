import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";
import { createCheckout } from "../lib/api";

const freeFeatures = [
  "5 email generations / month",
  "3 tone variations per generation",
  "One-click copy",
  "Character count display",
];

const proFeatures = [
  "Unlimited email generations",
  "3 tone variations per generation",
  "One-click copy",
  "Character count display",
  "Priority AI processing",
  "Transaction receipt on-chain",
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const cancelled = searchParams.get("payment") === "cancelled";

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/auth?mode=signup");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { checkout_url } = await createCheckout();
      window.location.href = checkout_url;
    } catch (err) {
      setError("Failed to create checkout session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-4">Pricing</p>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-4">
            Simple, fair pricing
          </h1>
          <p className="text-slate-400 font-body">Pay in crypto. Cancel anytime. No surprises.</p>
        </div>

        {cancelled && (
          <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-400 font-body text-center">
            Payment was cancelled. Your plan hasn't changed.
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-body text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="card p-8">
            <div className="mb-6">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">Free Forever</p>
              <div className="flex items-end gap-1">
                <span className="font-display font-extrabold text-5xl text-white">$0</span>
                <span className="text-slate-500 font-body pb-1">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-400 font-body">
                  <svg className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {user ? (
              <Link to="/dashboard" className="btn-ghost w-full text-center block">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/auth?mode=signup" className="btn-ghost w-full text-center block">
                Get started free
              </Link>
            )}
          </div>

          {/* Pro */}
          <div className="relative card p-8 border-arctic-500/30 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-arctic-500/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-arctic-500/5 to-transparent" />

            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-mono text-arctic-400 uppercase tracking-widest mb-2">Pro</p>
                  <div className="flex items-end gap-1">
                    <span className="font-display font-extrabold text-5xl text-white">$19</span>
                    <span className="text-slate-500 font-body pb-1">/month</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-500 mb-1">Pay with</div>
                  <div className="flex gap-1.5">
                    {["USDT", "USDC", "BTC"].map((coin) => (
                      <span key={coin} className="text-xs font-mono bg-obsidian-800 border border-obsidian-600 text-slate-400 px-2 py-0.5 rounded">
                        {coin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300 font-body">
                    <svg className="w-4 h-4 text-arctic-400 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting to checkout...
                  </>
                ) : (
                  "Upgrade to Pro →"
                )}
              </button>

              <p className="text-xs text-slate-600 font-body text-center mt-3">
                Secure crypto payment via NexaPay · USDT · USDC · BTC
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-display font-bold text-xl text-white mb-6 text-center">Common questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: "Why crypto payments?",
                a: "Crypto payments are instant, borderless, and don't require a bank account. Perfect for a global tool.",
              },
              {
                q: "What happens after my 5 free emails?",
                a: "You'll be prompted to upgrade. Free emails reset on the 1st of each month.",
              },
              {
                q: "Is my data private?",
                a: "Yes. Your prospect data and offer descriptions are never stored or used to train AI models.",
              },
              {
                q: "Can I get a refund?",
                a: "Due to the nature of crypto transactions, we don't offer refunds. But you can try 5 emails for free first.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="card p-5">
                <p className="font-display font-semibold text-white text-sm mb-1.5">{q}</p>
                <p className="text-sm text-slate-500 font-body leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
