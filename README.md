<div align="center">

# 創業真心話｜Startup Reality Check

### 不會只說好聽話的 AI 創業教練

把一句模糊的商業點子，拆成 **MIT 紀律創業畫布** 的 10 個關鍵假設；再用 AI 起草、追問、挑戰，逼它變成一份可驗證、可討論、可匯出的商業模型。

**語言**：繁體中文 · [English](README.en.md)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-8E75FF?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/tests-Vitest-success)](#測試)

[快速開始](#快速開始) · [為什麼做](#為什麼做) · [怎麼運作](#怎麼運作) · [10 格創業畫布](#10-格創業畫布) · [Roadmap](#roadmap)

</div>

---

> **一句話**：大多數創業者不是沒有想法，而是太少被追問。創業真心話會像共同創辦人一樣陪你起草，像教練一樣逼你講清楚，最後像挑剔投資人一樣攻擊你的假設，讓商業模型在真正花錢前先經過壓力測試。

## 為什麼做

早期創業最常死在三件事：

- **市場講太大**：目標客戶寫成「所有中小企業」或「所有創辦人」，聽起來很大，但無法驗證。
- **答案講太淺**：只知道產品想做什麼，卻說不清楚通路、單位經濟、銷售流程、擴張順序。
- **沒人潑冷水**：自己的假設一路沒被挑戰，最後才用時間和現金流買教訓。

創業真心話把 MIT Disciplined Entrepreneurship 的 10 格畫布做成可互動 Web App。每一格都有自己的方法論知識：定義、好範例、壞範例、追問題庫、攻擊角度和需要的證據。AI 不是開一個空白聊天框亂聊，而是在固定框架裡幫你把點子打磨到更具體。

## 怎麼運作

每一格都有三種 AI 模式，可以依照你現在的狀態切換。

| 模式 | 角色 | 它會做什麼 |
|------|------|------------|
| **起草** | 快速共同創辦人 | 根據你的一句話商業總述，產出具體、可被驗證的初稿。 |
| **教練** | 蘇格拉底式引導者 | 一次只問 1 到 2 個關鍵問題，不替你回答，逼你把答案講深。 |
| **魔鬼代言人** | 挑剔早期投資人 | 攻擊假設、要求數字與證據，指出你刻意迴避的盲點。 |

討論完後，按下 **用對話整理**，AI 會讀完整段對話，重新整理成該格的正式內容。這不是單純複製聊天紀錄，而是把你補充過的脈絡、被挑戰後的修正和可驗證假設整理成一版更成熟的答案。

```text
一句話商業點子
  -> 一鍵起草 10 格
  -> 逐格進入「教練」追問
  -> 切到「魔鬼代言人」壓力測試
  -> 用對話整理成正式內容
  -> 匯出 Markdown
```

## 核心功能

- **一鍵起草**：輸入一句商業總述，直接產出 10 格創業畫布初稿。
- **逐格 AI 對話**：每格都能在起草、教練、魔鬼代言人三種模式間切換。
- **對話整理成內容**：把整段討論濃縮成可保存、可分享的正式答案。
- **狀態燈**：從空白、草稿、已深化到已挑戰，快速看出哪些格子還很脆弱。
- **多畫布管理**：同時保存多個事業點子，適合比較不同方向。
- **Markdown 匯出**：把畫布輸出成可貼到 Notion、Google Docs 或投影片草稿的文字文件。
- **帳號與資料隔離**：Supabase Auth + Postgres Row-Level Security，每位使用者只能存取自己的畫布。

## 10 格創業畫布

這套畫布參考 Bill Aulet 的 **Disciplined Entrepreneurship** 思路，先幫你聚焦可以驗證的商業假設。

| # | 格子 | 要回答的問題 |
|---|------|--------------|
| 1 | 存在理由 | 你為什麼要做這件事？願景與使命是什麼？ |
| 2 | 灘頭堡市場 | 你最早要服務，而且最有機會贏的那一小群人是誰？ |
| 3 | 價值主張 | 你能替客戶創造什麼具體、可量化的價值？ |
| 4 | 競爭優勢 | 為什麼是你能贏？什麼能力會隨時間累積？ |
| 5 | 通路 | 客戶如何從不知道你，到開始使用你的產品？ |
| 6 | 單位經濟 | 你如何收費？每一筆生意是否真的能賺錢？ |
| 7 | 銷售流程 | 誰決策、誰使用、誰付錢？成交週期多長？ |
| 8 | 維持經濟 | LTV、CAC、回本期是否能支撐長期成長？ |
| 9 | MVP 與產品路線 | 第一個該驗證的最大風險是什麼？要先做什麼？ |
| 10 | 規模化 | 灘頭堡打下後，下一個相鄰市場是誰？ |

## 快速開始

```bash
# 1. Clone & install
git clone https://github.com/kevin801221/-Startup-Reality-Check.git startup-reality-check
cd startup-reality-check
pnpm install

# 2. 建立環境變數
cp .env.local.example .env.local

# 3. 建立資料表與 RLS policy
pnpm db:migrate

# 4. 啟動開發伺服器
pnpm dev
```

啟動後打開：

```text
http://localhost:3000
```

`.env.local` 需要填入：

```bash
GOOGLE_GENERATIVE_AI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

Supabase 一次性設定：

- 啟用 Email Auth provider。
- 在 Authentication -> URL Configuration -> Redirect URLs 加入 `http://localhost:3000/auth/confirm`。
- `DATABASE_URL` 建議使用 Supabase shared pooler 連線字串。

## 不想架站？當成 agent skill 用

10 格方法論可以編譯成一份可攜的 agent skill，讓你在**任何一個新專案的第一天**（還沒有資料庫、還沒有帳號）就跑同一套三階段壓力測試：

```bash
pnpm skill:build

# Cursor 與 Claude Code 都會讀 ~/.agents/skills，放這裡就所有專案通用
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills/startup-reality-check" ~/.agents/skills/startup-reality-check
```

之後在任何專案裡輸入 `/startup-reality-check`，agent 會帶著 10 格的追問題庫與攻擊角度訪談你，把結論寫成該專案的 `reality-check.md`。知識的單一事實來源仍是 `lib/canvas-framework.ts`，改一次 app 與 skill 同步更新。詳見 [skills/README.md](skills/README.md)。

想把這套引擎擴到創業以外的框架（技術設計 review、PRD、上線前檢查），設計提案見 [docs/superpowers/specs/2026-08-03-reality-check-engine.md](docs/superpowers/specs/2026-08-03-reality-check-engine.md)，裡面也有與 `grill-me` 的比較。

## 技術架構

| 層級 | 技術 |
|------|------|
| Framework | Next.js 16 App Router + React 19 + TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| AI | Vercel AI SDK v6 + `@ai-sdk/google` + Gemini 2.5 Flash |
| Auth | Supabase Auth，支援 magic link 與 email/password |
| Database | Supabase Postgres + Row-Level Security |
| ORM | Drizzle ORM + drizzle-kit migrations |
| Testing | Vitest unit tests + prompt snapshots |

AI provider 透過 Vercel AI SDK 抽象，未來要改 Vertex AI、Vercel AI Gateway 或其他模型時，主要會集中在 model provider 設定，不需要重寫整個應用。

## 專案結構

```text
app/
  (auth)/login                 # 登入頁：magic link + email/password
  dashboard                    # 畫布列表、建立、重新命名、刪除
  canvas/[id]                  # 10 格總覽與格子面板
  api/
    chat                       # 三階段 AI 串流對話
    canvas/[id]/draft-all      # 一鍵起草全部格子
    canvas/[id]/synthesize     # 用對話整理成正式內容
    canvas/[id]/adopt          # 採納內容並更新狀態
    export/[id]                # 匯出 Markdown
lib/
  canvas-framework.ts          # 10 格方法論知識
  ai/                          # prompts、draft、chat、synthesis
  db/                          # Drizzle schema、queries、RLS migration
  supabase/                    # server/client/middleware clients
  export/markdown.ts           # 畫布轉 Markdown
components/
  canvas-board.tsx
  canvas-grid.tsx
  block-panel.tsx
  block-chat.tsx
  block-card.tsx
```

完整產品設計文件見：[docs/superpowers/specs/2026-06-13-canvas-coach-design.md](docs/superpowers/specs/2026-06-13-canvas-coach-design.md)。

## 測試

```bash
pnpm test
pnpm lint
npx tsc --noEmit
```

目前測試覆蓋重點：

- 10 格方法論資料完整性。
- AI prompt 組裝與 snapshot。
- 起草、對話整理與 markdown 匯出邏輯。
- 資料庫 schema、block 狀態與 query helper。

## Roadmap

已完成：

- [x] 10 格創業畫布
- [x] 起草、教練、魔鬼代言人三階段 AI 對話
- [x] 一鍵起草全部格子
- [x] 用完整對話整理成正式內容
- [x] Supabase Auth + Postgres RLS
- [x] Markdown 匯出
- [x] Vitest 單元測試與 prompt snapshot

接下來可做：

- [ ] Read-only 分享連結
- [ ] PDF 匯出
- [ ] 完成度評分與每格風險分數
- [ ] Playwright E2E 測試
- [ ] Vercel 一鍵部署設定
- [ ] 多人協作與版本歷史
- [ ] 完整 i18n：繁中、英文、日文
