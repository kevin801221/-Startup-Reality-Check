<div align="center">

# 🧭 Canvas Coach

### Your AI co-founder that refuses to let you bullshit yourself.

**Stop writing business plans nobody challenges.** Canvas Coach walks you through the **MIT Disciplined Entrepreneurship** 10-step canvas with a three-stage AI partner that drafts with you, coaches you like Socrates, and then **tears your assumptions apart like a skeptical investor** — until your business model actually holds up.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-8E75FF?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/tests-passing-success)](#-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#-license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)

[**Quickstart**](#-quickstart) · [**How it works**](#-how-it-works) · [**The 10 blocks**](#-the-10-blocks) · [**Roadmap**](#%EF%B8%8F-roadmap) · [繁體中文](#-繁體中文)

</div>

---

> **TL;DR** — Most founders think their idea is great because nobody has ever pushed back on it. Canvas Coach is the pushback. It's a focused web app: pick a block of your business model, talk to an AI that knows the methodology cold, and let it drag you from *"my customer is all SMBs"* to *"5–20 person B2B SaaS legal teams in Taipei already paying for a worse tool."*

<!-- 👉 Drop a GIF or screenshot here for instant credibility. Suggested: a 10-second screen recording of the devil's-advocate stage roasting a vague answer.
![Canvas Coach demo](docs/demo.gif)
-->

## ✨ Why Canvas Coach

Three things kill early ideas, and generic chatbots make all three worse:

- **You think too broadly.** "Founders" isn't a market. Canvas Coach forces a beachhead.
- **You think too shallowly.** A Socratic coach keeps asking *"how do you know?"* instead of handing you a confident, wrong answer.
- **Nobody challenges you.** A built-in devil's advocate attacks your assumptions *before* you burn cash discovering them.

Unlike a blank ChatGPT prompt, **every one of the 10 blocks ships with its own coaching brain** — definition, good/bad examples, a Socratic question bank, devil's-advocate attack angles, and the exact evidence you'd need to back it up. The AI isn't improvising; it's running a methodology.

## 🧠 How it works

Every block is worked in three switchable stages — one tab, three personalities:

| Stage | Persona | What it does |
|-------|---------|--------------|
| 📝 **Draft** | The fast first-drafter | Turns your one-liner into a concrete, *falsifiable* first attempt. |
| 🎓 **Coach** | A Socratic mentor | Asks 1–2 sharp follow-ups at a time. Never answers for you — makes *you* go deeper. |
| 😈 **Devil** | A skeptical seed investor | Attacks your assumptions, demands numbers, and exposes the blind spots you're avoiding. |

Then comes the part that makes it real: hit **"Synthesize from conversation"** and the model reads your *entire* discussion for that block and rewrites it into a sharpened, evidence-backed answer — *not* a copy of the chat, an actual upgraded answer. Review, tweak, save. The block's status light goes ○ → ◐ → ● → ★ as it matures.

```
   one-liner ──▶ 📝 Draft ──▶ 🎓 Coach (go deeper) ──▶ 😈 Devil (get challenged)
                                        │
                                        ▼
                          ✨ Synthesize ──▶ polished, defensible block
```

⚡ **One-click "Draft all"**: give it a single sentence about your business and watch all 10 blocks fill with first drafts in one shot. Then deepen the ones that matter.

## 🗺️ The 10 blocks

Based on Bill Aulet's *Disciplined Entrepreneurship* (MIT). Each block carries its own built-in coaching knowledge.

| # | Block | Focus |
|---|-------|-------|
| 1 | Purpose | Vision & mission — your north star |
| 2 | Beachhead | Your *one* winnable starting market |
| 3 | Value | Quantified value proposition + use case |
| 4 | Edge | Defensible core that compounds over time |
| 5 | Channel | The real path from "never heard of you" to "using you" |
| 6 | Economics | Unit economics & pricing |
| 7 | Sales | Decision-making unit & sales cycle |
| 8 | Sustain | LTV ÷ CAC & payback |
| 9 | Build | MVP & the riskiest assumption to test first |
| 10 | Scale | Disciplined expansion to adjacent markets |

## 🚀 Quickstart

```bash
# 1. Clone & install (pnpm)
git clone https://github.com/kevin801221/canvas-coach.git
cd canvas-coach
pnpm install

# 2. Configure environment
cp .env.local.example .env.local
#   then fill in:
#   - GOOGLE_GENERATIVE_AI_API_KEY   (https://aistudio.google.com/apikey)
#   - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
#   - SUPABASE_SERVICE_ROLE_KEY
#   - DATABASE_URL                   (Supabase → Connect → Shared Pooler)

# 3. Push the schema + Row-Level Security policies
pnpm db:migrate          # or: pnpm db:push

# 4. Run
pnpm dev                 # http://localhost:3000
```

**Supabase setup (one time):** enable the **Email** auth provider, and add `http://localhost:3000/auth/confirm` to **Authentication → URL Configuration → Redirect URLs**. Magic-link *and* email/password login are both supported out of the box.

## 🧱 Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 16** (App Router, RSC) + TypeScript |
| UI | **Tailwind CSS v4** + **shadcn/ui** |
| AI | **Vercel AI SDK v6** + `@ai-sdk/google` → **Gemini 2.5 Flash** (streaming) |
| Auth | **Supabase Auth** (`@supabase/ssr`) — magic link + password |
| Database | **Supabase Postgres** with **Row-Level Security** |
| ORM | **Drizzle ORM** + drizzle-kit migrations |
| Testing | **Vitest** (unit + snapshot) |

Designed so the AI provider is **one line to swap** — move to Vertex AI or the Vercel AI Gateway without touching your app code.

## 🔒 Security by design

- **Row-Level Security on every table** — users can only ever touch their own canvases, enforced in Postgres itself.
- **Defense in depth** — server queries re-check ownership by `user_id`, not just RLS.
- Secrets stay server-side; the browser only ever sees the publishable key.

## 🧪 Testing

```bash
pnpm test        # Vitest: framework integrity, stage prompts (snapshots), AI wrappers, helpers
pnpm lint        # ESLint
npx tsc --noEmit # Type-check
```

The methodology engine (10-block knowledge, stage prompt assembly, status transitions, markdown export) is **100% unit-tested and decoupled from the UI**.

## 🛣️ Roadmap

Built and working today: ✅ 3-stage AI chat · ✅ conversation-to-content synthesis · ✅ one-click draft-all · ✅ 10-block canvas with status lights · ✅ auth + persistence + RLS · ✅ Markdown export.

Next up:

- [ ] ✏️ Edit the one-liner from the canvas page
- [ ] 🚀 One-click Vercel deploy + `vercel.json`
- [ ] 🎭 Playwright end-to-end tests
- [ ] 🔗 Read-only share links for your canvas
- [ ] 📄 Polished PDF export
- [ ] 📊 Completeness dashboard & per-block scoring
- [ ] 🌍 i18n (English UI; the coach currently speaks Traditional Chinese)
- [ ] 🤝 Real-time multiplayer canvases
- [ ] ✉️ Custom SMTP recipe (Resend) for reliable magic-link delivery

> Want one of these? [Open an issue](https://github.com/kevin801221/canvas-coach/issues) or send a PR — see [Contributing](#-contributing).

## 🏗️ Architecture

```
app/
  (auth)/login         # magic link + password
  dashboard            # your canvases (create / rename / delete)
  canvas/[id]          # 10-block overview + block panel
  api/
    chat               # 3-stage streaming (Gemini)
    canvas/[id]/draft-all   # one-click draft all blocks
    canvas/[id]/synthesize  # conversation → polished block content
    canvas/[id]/adopt       # save block + advance status
    export/[id]             # canvas → Markdown
lib/
  canvas-framework.ts  # the soul: 10 blocks of coaching knowledge
  ai/                  # stage prompts, streaming, synthesis, drafting
  db/                  # Drizzle schema (+RLS), queries
  supabase/            # ssr clients + auth middleware
```

Full design doc: [`docs/superpowers/specs/2026-06-13-canvas-coach-design.md`](docs/superpowers/specs/2026-06-13-canvas-coach-design.md).

## 🤝 Contributing

PRs and issues welcome. The methodology layer is pure and well-tested, so it's a friendly codebase to extend.

1. Fork & branch
2. `pnpm install && pnpm test`
3. Keep `pnpm lint` and `npx tsc --noEmit` green
4. Open a PR

## 📜 License

MIT — do whatever, just don't blame us when the devil's advocate hurts your feelings.

---

<div align="center">

### ⭐ If this helped you kill a bad idea early (or sharpen a good one), star the repo.

That's the whole business model.

</div>

---

## 🇹🇼 繁體中文

> **一句話**：大多數創業者覺得自己的點子很棒，只是因為從來沒人戳破它。Canvas Coach 就是那個戳破你的人。

用 **MIT 紀律創業畫布（Disciplined Entrepreneurship）** 的 10 格框架，搭配 AI 三段式陪跑：

- 📝 **起草** — 把你的一句話總述變成具體、可被驗證的初稿
- 🎓 **教練** — 蘇格拉底式追問，一次問 1–2 個，逼你想得更深，但不替你回答
- 😈 **魔鬼代言人** — 用挑剔投資人的角度攻擊你的假設、要數字、戳盲點

關鍵差異：**每一格都內建該格的方法論知識**（定義、好壞範例、追問題庫、攻擊角度、所需證據），所以 AI 不是亂講，是在跑方法論。討論完按「**用對話整理**」，模型會讀完整段對話，產出**修正後的答案**（不是複製對話），你確認後存檔，格子狀態燈 ○→◐→●→★ 隨之成熟。還有「**一鍵起草**」：一句話總述，10 格初稿一次生成。

**快速開始**

```bash
pnpm install
cp .env.local.example .env.local   # 填入 Gemini / Supabase 金鑰
pnpm db:migrate                    # 建表 + RLS
pnpm dev                           # http://localhost:3000
```

設定細節（環境變數、Supabase Auth）見 [Quickstart](#-quickstart) 與設計文件。覺得有用的話，**幫專案點顆 ⭐**。
