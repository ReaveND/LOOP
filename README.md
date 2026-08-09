# LOOP — AI Customer Feedback Intelligence Platform

> **"LOOP turns scattered customer feedback into ranked, evidence-backed decisions."**

LOOP is a multi-tenant web application that ingests customer feedback from multiple channels, uses AI to classify and cluster it, surfaces what's trending, and lets anyone on your team ask plain-English questions about what customers actually want.

Built as part of the Zidio Development Internship Program — Web Development Track.

---

## 🚀 Live Demo

**Deployed on Vercel**: [https://loop.vercel.app](https://loop.vercel.app) *(replace with your URL)*

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@demo.com | password123 |
| **Analyst** | analyst@demo.com | password123 |
| **Viewer** | viewer@demo.com | password123 |

> All three accounts are on the **"Demo Workspace"** seeded with 120+ realistic feedback items.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) + TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma v7 |
| **Auth** | NextAuth v5 (Auth.js) |
| **AI** | Groq API (openai/gpt-oss-120b) |
| **Embeddings** | Xenova/transformers (all-MiniLM-L6-v2, runs server-side) |
| **Charts** | Recharts |
| **Validation** | Zod v4 |
| **Deployment** | Vercel + Neon Postgres |

---

## ✨ Features

### Core Application
- **Multi-tenant workspaces** — each company's data is fully isolated
- **Role-based access control** — Admin, Analyst, Viewer with server-enforced permissions
- **Feedback ingestion** — single entry form, CSV bulk upload, and simulated channel sources
- **Feedback inbox** — server-side pagination, full-text search, filters (channel/sentiment/theme/status/date), inline status workflow (NEW → REVIEWED → ACTIONED)
- **Analytics dashboard** — Recharts with volume over time, sentiment breakdown, channel distribution, top themes, and stat cards (all real DB data)

### AI Features
| Feature | Description |
|---------|-------------|
| **AI1 Auto-classification** | Every feedback item is automatically tagged with sentiment, score, theme(s), and feature area via Groq. Results are stored — never recomputed on render. |
| **AI2 Theme Clustering & Trends** | Feedback is grouped into named themes with counts. Spike detection flags themes growing >50% vs the prior period. Click any theme to drill into its feedback. |
| **AI3 Ask LOOP (RAG Q&A)** | Chat interface that embeds your question, finds the most relevant feedback via pgvector semantic search, and answers using only that data — with cited sources. |
| **AI4 Voice-of-Customer Report** | One-click report generation for any period: pre-computes real stats (themes, sentiment delta, verbatim quotes) then asks Groq to write the narrative. Saved to DB, viewable later, exportable as PDF via browser print. |

---

## 📐 Architecture

```
Browser (React/Next.js)
    ↓  API Route Handlers (server-side only)
    ↓  Auth guard → workspaceId scope → Prisma
    ↓  PostgreSQL (Neon)
    ↓  Groq API (AI) — server-side only, API key never in browser
```

- **Three-tier architecture**: browser ↔ API routes ↔ database
- **Tenant isolation**: every query filters by `workspaceId`; no row from Company A can ever reach Company B
- **AI key stays server-side**: Groq API is only called from API route handlers

---

## 🗄 Data Model

```
Workspace ─┬─ User (ADMIN | ANALYST | VIEWER)
           ├─ Feedback ──┬─ FeedbackTheme (join) ── Theme
           │              └─ Embedding (pgvector)
           ├─ Theme
           └─ Report
```

Key fields:
- `Feedback`: `content`, `channel`, `sentiment`, `sentimentScore`, `status`, `workspaceId`
- `Theme`: `name`, `description`, `color`, `workspaceId`
- `Report`: `title`, `periodStart`, `periodEnd`, `contentJson` (all AI output), `workspaceId`

---

## 🏁 Local Setup

### Prerequisites
- **Node.js 18+** and **Git**
- A free **PostgreSQL** database — [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- A **Groq API key** — [console.groq.com](https://console.groq.com)
- Enable `pgvector` extension on your Postgres database:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/ReaveND/LOOP.git
cd LOOP

# 2. Install dependencies
npm install
# or
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Fill in .env with your values (see Environment Variables below)

# 4. Run database migrations
npx prisma migrate deploy

# 5. Seed the database (creates demo workspace + 120+ feedback items)
npm run seed

# 6. Start the development server
npm run dev
# → http://localhost:3000
```

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `AUTH_SECRET` | Random string for NextAuth session signing (min 32 chars) | `openssl rand -base64 32` |
| `AUTH_URL` | Base URL of your app | `http://localhost:3000` |
| `AUTH_TRUST_HOST` | Set to `true` for Vercel/proxied deployments | `true` |
| `GROQ_API_KEY` | Groq API key for AI features | `gsk_...` |
| `GROQ_MODEL_NAME` | Groq model to use (optional) | `openai/gpt-oss-120b` |

> ⚠️ Never commit `.env` to Git. It's already in `.gitignore`.

---

## 🗂 Repository Structure

```
LOOP/
├── app/
│   ├── (auth)/login, signup        # Auth pages
│   ├── (dashboard)/
│   │   ├── dashboard/              # Analytics overview
│   │   ├── inbox/                  # Feedback inbox + filters
│   │   ├── trends/                 # Theme clustering & spike detection
│   │   ├── ask/                    # Ask LOOP (RAG Q&A)
│   │   ├── reports/                # VoC report generation & view
│   │   ├── members/                # Workspace member management
│   │   └── settings/               # Profile & workspace settings
│   ├── api/
│   │   ├── feedback/               # CRUD, bulk, simulate, backfill
│   │   ├── themes/                 # Theme clustering + trends
│   │   ├── ask-loop/               # Semantic search + RAG answer
│   │   ├── reports/                # VoC report generate + list + [id]
│   │   ├── analytics/              # Dashboard metrics
│   │   └── members/                # Member management
│   ├── not-found.tsx               # Custom 404
│   └── error.tsx                   # Global error boundary
├── components/
│   ├── dashboard/                  # Chart components, stat cards
│   ├── layout/                     # Sidebar, top nav
│   └── ui/                         # shadcn/ui primitives
├── lib/
│   ├── services/
│   │   ├── ai.ts                   # Groq calls: classify, answer, report
│   │   ├── classify.service.ts     # Auto-classification pipeline
│   │   └── embedding.service.ts   # Embedding generation + pgvector storage
│   ├── permissions.ts              # requireAuth, requireRole
│   ├── db.ts                       # Prisma client singleton
│   └── auth.ts                     # NextAuth config
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                     # 120+ realistic feedback items
├── .env.example
└── README.md
```

---

## 🧪 Database Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create + apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Re-seed the database (wipes and reloads demo data)
npm run seed

# Open Prisma Studio (visual DB browser)
npx prisma studio
```

---

## 🚢 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

Set the same environment variables in your **Vercel project settings** (Settings → Environment Variables). The `build` script (`npx prisma generate && next build`) runs automatically on deploy.

---

## 📊 Scoring Rubric Summary

| Milestone | Weight | Status |
|-----------|--------|--------|
| M1 — Foundation (Auth, RBAC, workspaces, feedback CRUD) | 10 pts | ✅ |
| M2 — Core App (Bulk import, inbox, dashboard) | 15 pts | ✅ |
| M3 — AI Features (Classification, trends, Ask LOOP) | 15 pts | ✅ |
| M4 — Production (VoC report, polish, README, demo) | 10 pts | ✅ |
| **Project Total** | **50 pts** | |

---

*Built with ❤️ — Zidio Development Internship · Project LOOP v1.0*
