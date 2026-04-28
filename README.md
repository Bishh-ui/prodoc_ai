# Prodoc AI — Intelligent Clinical Copilot

Next-generation autonomous healthcare intelligence platform with real-time AI clinical assistance, predictive risk modeling, and workflow automation.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **LLM**: Groq (Llama 3.3 70B)
- **Charts**: Recharts
- **Deployment**: Vercel

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/Bishh-ui/prodoc_ai.git
cd prodoc_ai/prodoc-ai
npm install
```

### 2. Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the schema from `supabase/schema.sql`
3. Copy your project URL and keys from Settings → API

### 3. LLM Setup (Groq)

1. Go to [console.groq.com](https://console.groq.com)
2. Create a free API key

### 4. Environment Variables

Create `.env.local`:

```bash
# Groq LLM
GROQ_API_KEY=your_groq_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

- **AI Clinical Copilot** — Real-time LLM-powered clinical assistant with patient context injection
- **Risk Prediction Engine** — Automated patient risk scoring and trend analysis
- **Workflow Automation** — AI-generated tasks for follow-ups, lab orders, and referrals
- **Analytics Dashboard** — Real-time cohort analytics with interactive charts
- **Chat History** — Persistent conversation history per patient in PostgreSQL

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── copilot/      # Groq LLM integration
│   │   ├── patients/     # Patient CRUD
│   │   └── tasks/        # Workflow task management
│   └── page.tsx          # Main dashboard
├── components/
│   ├── doctor/           # Patient cards, copilot chat
│   ├── dashboard/        # Analytics, workflow panels
│   └── ui/               # Reusable UI components
└── lib/
    ├── supabase.ts       # Supabase client
    ├── db.ts             # Database query helpers
    └── data.ts           # TypeScript types
```

## Adding Patients

All patient data lives in the `patients` table in Supabase. To add a new patient, insert a row via the Supabase dashboard or use the SQL editor:

```sql
insert into patients (id, name, age, condition, risk_level, risk_score, ...)
values ('P007', 'Patient Name', 45, 'Condition', 'medium', 55, ...);
```

The dashboard auto-refreshes on page load.

## Deployment

Push to GitHub → Vercel auto-deploys. Add environment variables in Vercel project settings.

## License

MIT
