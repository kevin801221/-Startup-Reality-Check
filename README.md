# Canvas Coach — 紀律創業畫布 AI 教練

用 MIT 紀律創業畫布（Disciplined Entrepreneurship Canvas）的 10 格框架，搭配 AI 三段式陪跑
（**起草 → 教練追問 → 魔鬼代言人挑戰**），幫你把「自己的商業模型」想得全面、具體、且禁得起挑戰。

## 技術棧

- Next.js（App Router）+ TypeScript
- Tailwind CSS + shadcn/ui
- Vercel AI SDK v6 + AI Gateway（Claude）
- Supabase（Postgres + Auth + RLS）
- Drizzle ORM
- 部署：Vercel

## 設計文件

見 [`docs/superpowers/specs/2026-06-13-canvas-coach-design.md`](docs/superpowers/specs/2026-06-13-canvas-coach-design.md)。

## 開發

```bash
pnpm install
pnpm dev
```

> 環境變數設定見設計文件第 13 節。
