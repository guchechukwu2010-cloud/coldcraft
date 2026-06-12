import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: "⚡",
    title: "3 Tones, Instantly",
    desc: "Friendly, Professional, and Direct — tailored to your prospect, ready to send.",
  },
  {
    icon: "🎯",
    title: "Hyper-Personalized",
    desc: "Feed in a LinkedIn URL or prospect details. Get emails that don't sound like templates.",
  },
  {
    icon: "📋",
    title: "One-Click Copy",
    desc: "No fuss. Click, copy, paste into your outreach tool. Done.",
  },
  {
    icon: "🔒",
    title: "Secure & Private",
    desc: "Your data never trains the AI. API keys stay server-side. Always.",
  },
];

const testimonials = [
  { name: "Aisha O.", role: "Freelance Consultant", text: "Went from 2% reply rate to 11% in one month. ColdCraft's direct tone variant is just different." },
  { name: "Marcus T.", role: "SaaS Founder", text: "I was spending 30 mins per email. Now it's 2 minutes. And they're better emails." },
  { name: "Priya K.", role: "Agency Owner", text: "The personalization feels human. Clients have asked if I wrote the outreach myself. I say yes." },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-arctic-500/30 bg-arctic-500/5 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-jade-400 animate-pulse" />
          <span className="text-xs font-mono text-arctic-400 tracking-widest uppercase">AI-Powered Cold Outreach</span>
        </div>

        <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05] mb-6">
          Cold emails that{" "}
          <span className="relative">
            <span className="bg-gradient-to-r from-arctic-400 to-ember-400 bg-clip-text text-transparent">
              actually get replies
            </span>
            <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-arctic-500/0 via-arctic-500/50 to-arctic-500/0" />
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 font-body font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste a LinkedIn profile or enter prospect details. Get 3 personalized email variations — friendly, professional, and direct — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth?mode=signup" className="btn-primary text-base px-8 py-4 animate-glow-pulse">
            Generate your first email free →
          </Link>
          <Link to="/pricing" className="btn-ghost text-base px-8 py-4">
            See pricing
          </Link>
        </div>

        <p className="text-xs text-slate-600 mt-4 font-body">
          5 free emails/month · No credit card needed · Crypto payments accepted
        </p>

        {/* Demo preview card */}
        <div className="mt-16 card p-6 text-left max-w-2xl mx-auto glow-border relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-arctic-500/50 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-jade-400/80" />
            <span className="ml-2 text-xs text-slate-500 font-mono">generated email · direct tone</span>
          </div>
          <p className="text-xs font-mono text-slate-500 mb-1">Subject:</p>
          <p className="font-display font-semibold text-white mb-3 text-sm">Quick question about your outbound pipeline</p>
          <div className="text-sm text-slate-400 font-body leading-relaxed space-y-2">
            <p>Hi Marcus,</p>
            <p>I noticed Acme SaaS just doubled the sales team — usually that means outbound volume becomes the bottleneck before quality does.</p>
            <p>We help teams like yours generate personalized cold emails at scale, so reps spend time on replies, not writing.</p>
            <p>Worth a 15-min call this week to see if there's a fit?</p>
          </div>
          <div className="mt-4 pt-4 border-t border-obsidian-700 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-600">142 characters</span>
            <button className="text-xs text-arctic-400 hover:text-arctic-300 font-display font-medium flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M1 8V2a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2"/></svg>
              Copy
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <p className="text-center text-xs font-mono text-slate-600 uppercase tracking-widest mb-12">Why ColdCraft</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:border-obsidian-600 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <p className="text-sm text-slate-400 font-body leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <p className="text-sm font-display font-semibold text-white">{t.name}</p>
                <p className="text-xs text-slate-600">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-arctic-500/5 to-ember-400/5" />
          <div className="relative">
            <h2 className="font-display font-extrabold text-4xl text-white mb-4">
              Start writing better cold emails
            </h2>
            <p className="text-slate-400 font-body mb-8">5 free emails every month. No credit card required.</p>
            <Link to="/auth?mode=signup" className="btn-primary text-base px-10 py-4">
              Get started free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-obsidian-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display font-bold text-white">
            Cold<span className="text-arctic-400">Craft</span>
          </span>
          <p className="text-xs text-slate-600 font-body">© 2025 ColdCraft. Built with Claude AI.</p>
          <div className="flex gap-4 text-xs text-slate-600">
            <Link to="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
