# M&A Platform

Live tool. Cloudflare Workers, Supabase, Brevo. Demo route at `/demo` requires no login.

---

## What you have

- `package.json`, `wrangler.jsonc`, `next.config.ts`, `open-next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.local.example`, `.gitignore`
- `supabase/migrations/01_init.sql` - paste into Supabase SQL Editor
- `src/` - the entire app

---

## Step-by-step

### 1. Open in Codespaces

1. Create a private GitHub repo named `ma-platform`
2. On the repo page, click green **Code** button → **Codespaces** tab → **Create codespace on main**
3. Drag this whole folder's contents into the Codespace file explorer (or use `git push` after extracting locally)

### 2. Install

In the Codespace terminal:

```
npm install -g pnpm
pnpm install
```

### 3. Set up Supabase

1. Go to https://supabase.com, create a new project
2. Once provisioned, go to **SQL Editor** → New query
3. Open `supabase/migrations/01_init.sql` from this repo, copy the entire contents, paste into SQL Editor, click **Run**
4. Go to **Settings** → **API**. Copy three values: Project URL, `anon` key, `service_role` key
5. Go to **Authentication** → **URL Configuration**. Set Site URL to whatever your Codespaces forwards port 3000 to (it will look like `https://something-3000.app.github.dev`). You'll update this to your real domain after deploy.

### 4. Set up Brevo

1. Go to https://app.brevo.com/settings/keys/api, create an API key
2. In **Senders & IP** section, add and verify a sender email (your domain or a temporary one)

### 5. Set up Cloudflare R2

1. In Cloudflare dashboard, go to **R2 Object Storage** → **Create bucket**
2. Name it `ma-platform-uploads`. Region: Automatic.
3. The R2 binding in `wrangler.jsonc` already references this name.

### 6. Configure environment

In the Codespace terminal:

```
cp .env.local.example .env.local
```

Open `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` - from Supabase Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - from Supabase Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` - from Supabase Settings → API
- `BREVO_API_KEY` - from Brevo
- `BREVO_SENDER_EMAIL` - the verified sender address
- `BREVO_SENDER_NAME` - whatever you want (e.g., "M&A Platform")
- `NEXT_PUBLIC_SITE_URL` - your Codespaces forwarded URL for now

### 7. Run locally

```
pnpm dev
```

Open the forwarded URL. You should see the landing page.

- `/demo` - works immediately, no login
- `/signup` - create an account, you'll get a Brevo welcome email
- `/login` - sign in
- After signup/login, you'll be prompted to create a workspace

### 8. Deploy to Cloudflare

In the Codespace terminal:

```
npx wrangler login
```

Follow the link to authorize. Then:

```
pnpm deploy
```

This builds and deploys. You'll get a `*.workers.dev` URL.

### 9. Set production env vars

In Cloudflare dashboard → **Workers & Pages** → `ma-platform` → **Settings** → **Variables and Secrets**, add the same 7 variables from your `.env.local`. Mark `SUPABASE_SERVICE_ROLE_KEY` and `BREVO_API_KEY` as encrypted.

### 10. Update Supabase URL config

Back in Supabase → Authentication → URL Configuration, update Site URL to your Cloudflare `*.workers.dev` URL (or your custom domain when you set one up).

### 11. Custom domain (optional)

In Cloudflare → Workers → `ma-platform` → Settings → Triggers → Custom Domains. Add your domain. Update Supabase Site URL again.

---

## What works right now

- `/` - landing page
- `/demo` - full NeuralEdge AI Group demo, no login, all 10 pages, presentation mode
- `/signup` - creates Supabase account, sends Brevo welcome email
- `/login` - email/password
- `/companies/new` - create workspace
- `/companies/[id]/dashboard, /financials, /analytics, /signals, /valuation, /checklists, /reports, /uploads, /integrations, /admin` - all routes render with the design system
- `/companies/[id]/uploads` - actually uploads to R2 and creates DB rows

## What's stubbed (uses demo data)

- Dashboard, financials, analytics, signals, valuation, checklists, reports, integrations, admin all show NeuralEdge demo numbers regardless of which workspace you're in. They render real layouts. They wait for real data to flow in from the parsing pipeline.

## What ships next, in order

1. CSV/XLSX parsing pipeline so uploads turn into real financials data
2. QuickBooks Online OAuth integration
3. Normalization engine, raw GL → standard chart of accounts
4. Signals engine, real anomaly detection
5. Valuation engine driven by real EBITDA
6. Report generation, Browser Run for PDF
7. Xero, Sage, NetSuite integrations
8. Real custom domain + marketing site polish

---

## File map

```
src/
├── middleware.ts                          # Session refresh + route guards
├── app/
│   ├── layout.tsx, globals.css, page.tsx  # Root + landing
│   ├── login/, signup/                    # Auth flows + server actions
│   ├── demo/page.tsx                      # /demo, no auth, full UI
│   ├── api/
│   │   ├── upload/route.ts                # POST file → R2 + uploads table
│   │   └── brevo-subscribe/route.ts       # Newsletter signup
│   ├── actions.ts                         # createCompany, signOut
│   └── companies/
│       ├── new/page.tsx                   # First workspace onboarding
│       └── [companyId]/
│           ├── layout.tsx                 # Wraps with sidebar + shell
│           └── {dashboard,financials,...}/page.tsx
├── components/
│   ├── ui/                                # Button, Input, Label, Card
│   ├── layout/                            # Sidebar, AppShell, PageHeader, EmptyState
│   └── pages/                             # All 10 page components, shared by demo + live
└── lib/
    ├── supabase/                          # server, client, middleware
    ├── queries/                           # getCompany, getUploads, getCurrentUser
    ├── brevo.ts                           # sendEmail, upsertContact, sendWelcomeEmail
    ├── demo/data.ts                       # NeuralEdge dataset
    ├── types.ts, utils.ts
supabase/migrations/01_init.sql
```

---

## Troubleshooting

- **Signup says "Email rate limit exceeded"** → Supabase free tier limits to 3 emails per hour. Wait or upgrade.
- **Brevo welcome email not arriving** → check Brevo dashboard → Logs. Most common cause: sender email not verified.
- **Upload returns "R2 binding missing"** → in dev, R2 binding only works through `pnpm preview`, not `pnpm dev`. Use `pnpm preview` to test uploads locally, or just deploy and test against Cloudflare.
- **Login loops** → middleware matcher might be including a static asset. Inspect Network tab for redirect chain.
