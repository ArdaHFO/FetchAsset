# FetchAsset — AI-Powered Client Asset Onboarding

> Stop chasing clients for files. FetchAsset creates frictionless, magic-link portals powered by Llama 3.3 AI.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14 (App Router), React 18   |
| Styling     | Tailwind CSS v3, custom design system |
| UI Primitives | Hand-drawn components (no Shadcn defaults) |
| Backend     | Supabase (PostgreSQL + RLS + Storage + Vector) |
| AI Engine   | Llama 3.3 70B via Groq/Fireworks.ai |
| Auth/Email  | Supabase Magic Links + Resend       |
| Payments    | Stripe Checkout + Billing Portal    |
| Deployment  | Vercel                              |

## Design System

The FetchAsset UI uses a strict **Hand-Drawn** design system:

- **No straight lines** — every container uses irregular `border-radius` values
- **Hard offset shadows** — `4px 4px 0px #2d2d2d` (no blur, ever)
- **Fonts** — `Kalam` (headings) + `Patrick Hand` (body)
- **Paper texture** — dot-grid `radial-gradient` background on body
- **Colors** — Paper `#fdfbf7`, Ink `#2d2d2d`, Accent `#ff4d4d`, Blue `#2d5da1`, Post-it `#fff9c4`

### UI Primitives

| Component     | File                                     | Description                        |
|---------------|------------------------------------------|------------------------------------|
| `WobblyButton` | `src/components/ui/wobbly-button.tsx`   | 5 variants, press-flat active state |
| `WobblyCard`   | `src/components/ui/wobbly-card.tsx`     | Tape/tack decorations, flavors     |
| `WobblyInput`  | `src/components/ui/wobbly-input.tsx`    | Input, Textarea, Label, Select, FormField |

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Design tokens, paper texture, utility classes
│   ├── layout.tsx           # Root layout with Google Fonts (Kalam + Patrick Hand)
│   └── page.tsx             # Landing page + design system showcase
├── components/
│   └── ui/
│       ├── index.ts         # Barrel exports
│       ├── wobbly-button.tsx
│       ├── wobbly-card.tsx
│       └── wobbly-input.tsx
└── lib/
    └── utils.ts             # cn() + wobblyRadius() helpers
```

## Build Steps (Roadmap)

- [x] **STEP 1** — Initialize & Design System
- [ ] **STEP 2** — Database & Auth (Supabase migrations, RLS, Magic Links)
- [ ] **STEP 3** — Agency Dashboard (wizard, kanban, asset library)
- [ ] **STEP 4** — Client Portal (magic link view, checklist, file upload)
- [ ] **STEP 5** — Core AI (Llama 3.3 request generator, audit, brain-to-brief)
- [ ] **STEP 6** — Advanced AI & RAG (Supabase Vector, semantic search)
- [ ] **STEP 7** — Commercial features (Stripe, white-labeling, reminders)

## Development

```bash
npm run dev     # Start dev server at http://localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

## Environment Variables

Create `.env.local` (will be required from Step 2 onwards):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GROQ_API_KEY=

# Email
RESEND_API_KEY=

# Payments
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```
