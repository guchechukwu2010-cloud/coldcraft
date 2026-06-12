# ColdCraft — AI Cold Email Personalization SaaS

An AI-powered cold email personalization tool built with React, Node.js, Claude API, Supabase, and NexaPay crypto payments.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Tailwind CSS → Vercel |
| Backend | Node.js + Express → Railway / Render |
| AI | Claude API (claude-sonnet-4-20250514) |
| Database + Auth | Supabase |
| Payments | NexaPay (USDT / USDC / BTC) |

---

## Project Structure

```
coldcraft/
├── frontend/          # React app (deploy to Vercel)
│   ├── src/
│   │   ├── pages/     # Landing, Auth, Dashboard, Pricing
│   │   ├── components/ # Navbar
│   │   ├── hooks/     # useAuth
│   │   └── lib/       # supabase.js, api.js
│   └── vercel.json
├── backend/           # Express API (deploy to Railway)
│   └── src/
│       ├── routes/    # email.js, auth.js, payment.js, user.js
│       ├── middleware/ # auth.js
│       └── lib/       # supabase.js
└── supabase-schema.sql
```

---

## Setup Instructions

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase-schema.sql`
3. Get your project URL and keys from Project Settings → API:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key) → for frontend
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key) → for backend only, keep secret

### 2. Anthropic API Key

Get your API key from [console.anthropic.com](https://console.anthropic.com)

### 3. NexaPay

1. Sign up at [nexapay.io](https://nexapay.io) (or whichever crypto gateway you use)
2. Get your `NEXAPAY_API_KEY`, `NEXAPAY_MERCHANT_ID`, and `NEXAPAY_WEBHOOK_SECRET`
3. Set the webhook endpoint in your NexaPay dashboard to:
   `https://your-backend-url.railway.app/api/payment/webhook`

### 4. Backend Deployment (Railway)

```bash
cd backend
cp .env.example .env
# Fill in all values in .env
npm install
npm start
```

**Railway deployment:**
1. Push to GitHub
2. Connect repo to Railway
3. Set environment variables in Railway dashboard:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXAPAY_API_KEY`
   - `NEXAPAY_WEBHOOK_SECRET`
   - `NEXAPAY_MERCHANT_ID`
   - `FRONTEND_URL` (your Vercel URL)
   - `BACKEND_URL` (your Railway URL)
   - `NODE_ENV=production`

### 5. Frontend Deployment (Vercel)

```bash
cd frontend
cp .env.example .env.local
# Fill in values
npm install
npm run dev
```

**Vercel deployment:**
1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (leave empty — vercel.json handles the proxy)
4. Update `vercel.json` → replace the backend URL in the rewrite rule

---

## Security Features

- ✅ NexaPay webhook signature verified via HMAC-SHA256 + timing-safe comparison
- ✅ All API keys server-side only (never exposed to frontend)
- ✅ Free tier rate limiting enforced server-side (not just frontend)
- ✅ All user inputs sanitized with `validator` library before reaching Claude API
- ✅ Supabase Row Level Security enabled
- ✅ JWT auth verified on every protected route
- ✅ Global + per-endpoint rate limiting with `express-rate-limit`
- ✅ Helmet.js security headers
- ✅ Raw body preserved for webhook signature verification

---

## Free vs Pro

| Feature | Free | Pro |
|---|---|---|
| Generations/month | 5 | Unlimited |
| Tone variations | 3 | 3 |
| One-click copy | ✅ | ✅ |
| Payment method | — | USDT / USDC / BTC |
| Price | $0 | $19/month |

---

## NexaPay Webhook Events

The backend handles the `payment.completed` event:
1. Verifies HMAC signature
2. Upgrades user plan to `pro` in Supabase
3. Stores transaction hash for reference

Expected webhook payload:
```json
{
  "type": "payment.completed",
  "session_id": "...",
  "transaction_hash": "0x...",
  "amount": 19.00,
  "currency": "USD",
  "coin": "USDT",
  "metadata": {
    "user_id": "uuid-here",
    "plan": "pro"
  }
}
```

> **Note:** Adjust the webhook payload parsing in `backend/src/routes/payment.js` to match NexaPay's actual payload structure from their docs.

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:3001`
Vite proxies `/api/*` to the backend automatically.
