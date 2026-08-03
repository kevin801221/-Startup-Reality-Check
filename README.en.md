<div align="center">

# Startup Reality Check

### An AI startup coach that does not just say nice things

Turn a vague startup idea into 10 key assumptions from the **MIT Disciplined Entrepreneurship Canvas**. Draft it with AI, get pushed by a Socratic coach, challenge it like an investor, and export a clearer business model before spending real time and money.

**Language**: [繁體中文](README.md) · English

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-8E75FF?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/tests-Vitest-success)](#testing)

[Quickstart](#quickstart) · [Why This Exists](#why-this-exists) · [How It Works](#how-it-works) · [The 10 Blocks](#the-10-blocks) · [Roadmap](#roadmap)

</div>

---

> **TL;DR**: Most founders do not lack ideas. They lack pressure. Startup Reality Check helps you draft your model like a co-founder, refine it like a coach, and stress-test it like a skeptical early-stage investor.

## Why This Exists

Early startup ideas often fail for three avoidable reasons:

- **The market is too broad**: "All small businesses" sounds big, but it is not a testable beachhead.
- **The answers are too shallow**: Product ideas are easy; channels, unit economics, sales cycles, and expansion paths are harder.
- **The assumptions are not challenged**: Weak assumptions often survive until the founder pays for the lesson with time and cash.

Startup Reality Check turns the MIT Disciplined Entrepreneurship canvas into an interactive web app. Each block ships with its own coaching knowledge: definitions, good examples, bad examples, Socratic questions, attack angles, and evidence requirements. The AI is not improvising inside a blank chat box; it is working inside a structured methodology.

## How It Works

Each block has three AI modes.

| Mode | Role | What it does |
|------|------|--------------|
| **Draft** | Fast co-founder | Turns your one-line business summary into a concrete, testable first draft. |
| **Coach** | Socratic guide | Asks one or two sharp follow-up questions at a time instead of answering for you. |
| **Devil's Advocate** | Skeptical investor | Attacks assumptions, asks for numbers, and points out the blind spots you may be avoiding. |

After the conversation, click **Synthesize from conversation**. The AI reads the full discussion and rewrites the block into a cleaner, more defensible answer. It does not simply copy the chat; it folds your context, revisions, and evidence into a stronger business-model statement.

```text
One-line startup idea
  -> Draft all 10 blocks
  -> Deepen each block with Coach mode
  -> Stress-test assumptions with Devil's Advocate mode
  -> Synthesize the conversation into formal content
  -> Export to Markdown
```

## Core Features

- **Draft all blocks**: Generate a first draft for all 10 canvas blocks from one business summary.
- **Per-block AI chat**: Switch each block between Draft, Coach, and Devil's Advocate modes.
- **Conversation synthesis**: Convert the full discussion into a saved, shareable answer.
- **Status lights**: See whether each block is empty, drafted, refined, or challenged.
- **Multiple canvases**: Save and compare different business ideas.
- **Markdown export**: Export the canvas to text that works well in Notion, Google Docs, or deck drafts.
- **Account isolation**: Supabase Auth + Postgres Row-Level Security keeps each user's canvases private.

## The 10 Blocks

The canvas follows Bill Aulet's **Disciplined Entrepreneurship** thinking and focuses on testable business assumptions.

| # | Block | Core question |
|---|-------|---------------|
| 1 | Purpose | Why does this business exist? What is the mission and vision? |
| 2 | Beachhead Market | Who is the first narrow group you can serve and win? |
| 3 | Value Proposition | What concrete, measurable value do you create for customers? |
| 4 | Competitive Edge | Why can you win? What capability compounds over time? |
| 5 | Channel | How does a customer go from unaware to actively using the product? |
| 6 | Unit Economics | How do you charge, and does each transaction actually make money? |
| 7 | Sales Process | Who decides, who uses, who pays, and how long does the sale take? |
| 8 | Sustainable Economics | Do LTV, CAC, and payback support long-term growth? |
| 9 | MVP and Roadmap | What is the riskiest assumption to test first, and what should you build? |
| 10 | Scale | After the beachhead, which adjacent market comes next? |

## Quickstart

```bash
# 1. Clone & install
git clone https://github.com/kevin801221/-Startup-Reality-Check.git startup-reality-check
cd startup-reality-check
pnpm install

# 2. Create local environment file
cp .env.local.example .env.local

# 3. Create database tables and RLS policies
pnpm db:migrate

# 4. Start the dev server
pnpm dev
```

Open:

```text
http://localhost:3000
```

`.env.local` requires:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

One-time Supabase setup:

- Enable the Email Auth provider.
- Add `http://localhost:3000/auth/confirm` to Authentication -> URL Configuration -> Redirect URLs.
- Use the Supabase shared pooler connection string for `DATABASE_URL`.

## Prefer No Server? Give The Whole Pipeline To Your Coding Agent

`plugin/` is an agent plugin (Cursor, Claude Code, Codex) that turns **one interview or meeting** into **shipped work**:

```text
transcript / meeting notes
  -> cited facts and open questions
  -> grill-style interview, one question at a time, until it converges
  -> spec with a screen inventory and acceptance criteria
  -> UI designed through Figma / Pencil MCP
  -> backend + frontend plan sliced vertically
  -> slice-by-slice implementation, tests on every slice
  -> preflight and deploy
```

Install (symlinks by default, so every project picks up updates from this repo):

```bash
scripts/install-skills.sh                # -> ~/.agents/skills (Cursor / Codex)
scripts/install-skills.sh claude         # -> ~/.claude/skills (Claude Code)
```

Then type `/idea-to-ship` in any project — or run a single stage with `/startup-reality-check`, `/spec-writer`, `/design-ui`, and so on. Progress lives in that project's `docs/pipeline/<slug>.md`, so switching agents or closing the window never loses the thread. `lib/canvas-framework.ts` remains the single source of truth for the 10 blocks; `pnpm skill:build` compiles it into the skill.

Full walkthrough of the eight stages is in [plugin/README.md](plugin/README.md); the design rationale and the `grill-me` comparison are in [docs/superpowers/specs/2026-08-03-reality-check-engine.md](docs/superpowers/specs/2026-08-03-reality-check-engine.md).

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 App Router + React 19 + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| AI | Vercel AI SDK v6 + `@ai-sdk/google` + Gemini 2.5 Flash |
| Auth | Supabase Auth with magic link and email/password |
| Database | Supabase Postgres + Row-Level Security |
| ORM | Drizzle ORM + drizzle-kit migrations |
| Testing | Vitest unit tests + prompt snapshots |

The AI provider is abstracted through the Vercel AI SDK, so moving to Vertex AI, Vercel AI Gateway, or another model mainly touches provider configuration rather than the whole application.

## Project Structure

```text
app/
  (auth)/login                 # login: magic link + email/password
  dashboard                    # canvas list, create, rename, delete
  canvas/[id]                  # 10-block overview and block panel
  api/
    chat                       # three-stage streaming AI chat
    canvas/[id]/draft-all      # draft every block
    canvas/[id]/synthesize     # synthesize conversation into formal content
    canvas/[id]/adopt          # adopt content and update status
    export/[id]                # export Markdown
lib/
  canvas-framework.ts          # 10-block methodology knowledge
  ai/                          # prompts, draft, chat, synthesis
  db/                          # Drizzle schema, queries, RLS migration
  supabase/                    # server/client/middleware clients
  export/markdown.ts           # canvas to Markdown
components/
  canvas-board.tsx
  canvas-grid.tsx
  block-panel.tsx
  block-chat.tsx
  block-card.tsx
```

Full product design doc: [docs/superpowers/specs/2026-06-13-canvas-coach-design.md](docs/superpowers/specs/2026-06-13-canvas-coach-design.md).

## Testing

```bash
pnpm test
pnpm lint
npx tsc --noEmit
```

Current test coverage focuses on:

- 10-block methodology data integrity.
- AI prompt assembly and snapshots.
- Drafting, synthesis, and Markdown export logic.
- Database schema, block status, and query helpers.

## Roadmap

Built:

- [x] 10-block startup canvas
- [x] Draft, Coach, and Devil's Advocate AI modes
- [x] One-click draft-all
- [x] Conversation-to-content synthesis
- [x] Supabase Auth + Postgres RLS
- [x] Markdown export
- [x] Vitest unit tests and prompt snapshots

Next:

- [ ] Read-only share links
- [ ] PDF export
- [ ] Completion score and per-block risk score
- [ ] Playwright E2E tests
- [ ] One-click Vercel deployment setup
- [ ] Multiplayer collaboration and version history
- [ ] Full i18n: Traditional Chinese, English, Japanese
