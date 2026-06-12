import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar({ minimal = false }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-obsidian-800/60 backdrop-blur-xl bg-obsidian-950/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-arctic-500 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 12L6 4L9 9L11 7L14 12H2Z" fill="white" strokeWidth="0"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Cold<span className="text-arctic-400">Craft</span>
          </span>
        </Link>

        {!minimal && (
          <div className="flex items-center gap-4">
            <Link to="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors font-body">
              Pricing
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors font-body">
                  Dashboard
                </Link>
                <button onClick={handleSignOut} className="text-sm text-slate-400 hover:text-white transition-colors font-body">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm text-slate-400 hover:text-white transition-colors font-body">
                  Log in
                </Link>
                <Link to="/auth?mode=signup" className="btn-primary text-sm py-2">
                  Get started free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
