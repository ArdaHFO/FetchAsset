# FetchAsset — GitHub Copilot Instructions

## Project Context
FetchAsset is an AI-powered B2B SaaS for client asset onboarding. Agencies create magic-link portals; clients upload files; Llama 3.3 audits and organizes everything.

## Design System Rules (CRITICAL — Never Violate)
- **NO straight lines.** Every element must use irregular border-radius values via inline `style={{ borderRadius: '...' }}`.
- **Hard offset shadows ONLY.** Use `box-shadow: 4px 4px 0px 0px #2d2d2d`. Never add blur.
- **Fonts:** `font-heading` (Kalam) for headings, `font-body` (Patrick Hand) for all body text.
- **Colors:** Use only `text-ink`, `bg-paper`, `bg-muted`, `text-accent`, `text-blue`, `bg-postit`.
- **Buttons:** Always use `<WobblyButton>`. Never use plain HTML `<button>`.
- **Cards:** Always use `<WobblyCard>`. Never use generic `<div className="rounded-...">`.
- **Inputs:** Always use `<WobblyInput>`. Never use plain `<input className="rounded-...">`.

## Wobbly Radius Presets (memorize these)
```
btn: 255px 15px 225px 15px / 15px 225px 15px 255px
sm:  245px 18px 200px 20px / 22px 210px 14px 240px
md:  220px 30px 240px 20px / 25px 230px 20px 215px
lg:  180px 45px 200px 35px / 40px 190px 30px 170px
```

## Architecture
- `src/app/` — Next.js App Router pages and layouts
- `src/components/ui/` — Design system primitives (wobbly-button, wobbly-card, wobbly-input)
- `src/components/` — Feature components (dashboard, portal, forms)
- `src/lib/` — Utilities (utils.ts, supabase client, AI helpers)
- `src/app/api/` — API routes (AI endpoints, webhooks)

## Import Pattern
```typescript
import { WobblyButton, WobblyCard, WobblyInput } from '@/components/ui'
import { cn, wobblyRadius } from '@/lib/utils'
```

## Tech Stack Versions
- Next.js: 14.x (App Router)
- Tailwind CSS: 3.x (NOT v4 — uses classic tailwind.config.ts)
- React: 18.x
- TypeScript: 5.x

## Build Status
- STEP 1 (Design System): COMPLETE
- STEP 2 (Database): PENDING
- STEP 3 (Agency Dashboard): PENDING
- STEP 4 (Client Portal): PENDING
- STEP 5 (Core AI): PENDING
- STEP 6 (Advanced AI + RAG): PENDING
- STEP 7 (Commercial): PENDING
