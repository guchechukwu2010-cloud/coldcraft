import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    setSuccess("");
  }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password);
        setSuccess("Account created! Check your email to confirm your account, then log in.");
        setMode("login");
      } else {
        await signIn(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-arctic-500 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M2 12L6 4L9 9L11 7L14 12H2Z" fill="white" />
          </svg>
        </div>
        <span className="font-display font-bold text-xl text-white">
          Cold<span className="text-arctic-400">Craft</span>
        </span>
      </Link>

      <div className="w-full max-w-md">
        <div className="card p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-arctic-500/40 to-transparent" />

          <h1 className="font-display font-bold text-2xl text-white mb-1">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-500 font-body mb-8">
            {mode === "signup"
              ? "Start with 5 free email generations per month."
              : "Sign in to continue to ColdCraft."}
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-body">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-jade-400/10 border border-jade-400/20 text-sm text-jade-400 font-body">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={mode === "signup" ? "Min 8 characters" : "Your password"}
                required
                minLength={mode === "signup" ? 8 : 1}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "signup" ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                mode === "signup" ? "Create account →" : "Sign in →"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-obsidian-700 text-center">
            <p className="text-sm text-slate-500 font-body">
              {mode === "signup" ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => setMode(mode === "signup" ? "login" : "signup")}
                className="text-arctic-400 hover:text-arctic-300 font-medium transition-colors"
              >
                {mode === "signup" ? "Sign in" : "Sign up free"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
