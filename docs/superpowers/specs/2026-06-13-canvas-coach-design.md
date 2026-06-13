# Canvas Coach — 紀律創業畫布 AI 教練（設計規格）

- 日期：2026-06-13
- 狀態：草案（待使用者 review）
- 作者：kevin

## 1. 問題與目標

創業者（含本人）在思考自己的商業模型時，常見三個痛點：

1. **想不全面** — 只想到產品與客戶，漏掉通路、單位經濟、規模化等環節。
2. **想得太淺** — 「客戶是科技創辦人」這種範圍過大、無法驗證的描述。
3. **沒人挑戰** — 自己的假設沒有被戳破，盲點一路帶到燒錢才發現。

**目標**：用 MIT 紀律創業畫布（Disciplined Entrepreneurship Canvas）的 10 格框架，搭配 AI 三段式陪跑（起草 → 教練追問 → 魔鬼代言人挑戰），讓使用者把「自己的商業模型」想得**全面、具體、且禁得起挑戰**。

**非目標**：不做募資簡報生成、不做財務模型試算、不做團隊專案管理。專注在「想清楚商業模型」這一件事。

## 2. 使用者與使用情境

- **主要使用者**：早期創業者 / 有點子想驗證的人（先含本人）。
- **核心情境**：我有一個事業點子 → 想用結構化框架快速生出第一版商業模型 → 逐格深化 → 被 AI 挑戰後補強 → 匯出成可分享的文件。
- **次要情境**：同時比較多個事業點子（多畫布）。

## 3. 產品概念

一個 Next.js Web App。登入後管理多個「事業畫布」，每個畫布是 MIT 紀律創業畫布的 10 格。畫布採「**總覽 + 點格深入**」結構：首頁看到 10 格全貌與每格狀態，點任一格進入側邊 panel，在那裡編輯內容並與 AI 進行三階段對話。

**與通用 ChatGPT 的差異點**：每一格都內建該格的專屬「教練知識」（定義、好壞範例、蘇格拉底式問題庫、魔鬼代言人攻擊角度與所需證據），讓 AI 的引導與挑戰是「紀律創業方法論」級別，而非泛泛而談。

## 4. 範圍

### MVP（做）
- 登入（Supabase Auth，Email magic link 或 Google 二選一，先 Email magic link）
- 事業畫布 CRUD（建立 / 列表 / 重新命名 / 刪除）
- 10 格畫布總覽（grid + 每格狀態燈）
- 點格側邊 panel：內容編輯 + 三階段 AI 對話（draft / coach / devil 切換）
- 「採納」：把對話結論寫回該格正式內容
- 對話歷史持久化（回到該格看得到先前討論）
- 「對話快速起草」：首次用一句事業總述，AI 一次生出 10 格初稿
- 匯出 Markdown

### 非 MVP（之後）
- 分享連結（read-only）、多人協作、版本歷史
- PDF 美化匯出
- 多語介面（先繁體中文）
- 進度評分 / 完成度儀表板

## 5. 系統架構

| 層 | 選擇 | 說明 |
|----|------|------|
| 框架 | Next.js（App Router）+ TypeScript | Vercel 原生 |
| 樣式/元件 | Tailwind CSS + shadcn/ui | 快速做出乾淨可互動 UI |
| AI | Vercel AI SDK v6 + `@ai-sdk/google`（Gemini API） | 三段式皆用 `google("gemini-2.5-flash")` 串流；日後要加深魔鬼代言人推理可單獨升 `gemini-2.5-pro` |
| 認證 | Supabase Auth（`@supabase/ssr`） | Email magic link |
| 資料庫 | Supabase Postgres + RLS | 每人只看得到自己的畫布 |
| ORM | Drizzle ORM | type-safe，serverless 友善 |
| 部署 | Vercel | `vercel env` 管環境變數，Supabase 走 marketplace 整合 |
| 測試 | Vitest + Playwright | 單元 / 整合 / E2E |
| 套件管理 | pnpm | 純 TS 專案，無 Python，故不使用 uv |

> AI 走 Google AI Studio 的 Gemini API（`@ai-sdk/google` provider）。保留 Vercel AI SDK 抽象層，日後要改走 Vercel AI Gateway（`google/gemini-2.5-flash` 字串）或 Vertex AI，只需動 model 那一行。

## 6. 資料模型

```
canvases
  id           uuid pk
  user_id      uuid  -> auth.users
  title        text
  one_liner    text            -- 事業一句話總述（起草用）
  created_at   timestamptz
  updated_at   timestamptz

blocks
  id           uuid pk
  canvas_id    uuid -> canvases
  block_no     int             -- 1..10
  content      text            -- 該格正式內容
  status       text            -- empty | draft | refined | challenged
  updated_at   timestamptz
  unique (canvas_id, block_no)

messages
  id           uuid pk
  canvas_id    uuid -> canvases
  block_no     int             -- 屬於哪一格
  stage        text            -- draft | coach | devil
  role         text            -- user | assistant
  content      text
  created_at   timestamptz
```

- 建立 canvas 時，預先插入 10 筆 blocks（status=empty）。
- RLS：所有表以 `user_id`（canvases）/ 經 canvas 連動（blocks、messages）限制只能存取自己的資料。
- 寫入一律經 server（route handler / server action）+ service role 或 RLS-aware client，前端不直接寫 DB。

## 7. 工具的靈魂：`lib/canvas-framework.ts`

把 10 格的方法論知識結構化。型別：

```ts
type BlockSpec = {
  no: number
  key: string            // 'beachhead'
  title: string          // 你的客戶是誰
  subtitle: string       // 灘頭堡市場
  question: string       // 你最早要服務、且能贏的那一小群人是誰？
  definition: string     // 這一格在問什麼、為什麼重要（給 AI 與使用者看）
  goodExample: string
  badExample: string
  coachQuestions: string[]   // 蘇格拉底式追問庫
  devilAngles: string[]      // 魔鬼代言人攻擊角度
  evidenceNeeded: string[]   // 需要的數字 / 證據
}

export const CANVAS: BlockSpec[] = [ /* 10 格 */ ]
```

10 格（依圖／Disciplined Entrepreneurship）：

| no | key | title / subtitle |
|----|-----|------------------|
| 1 | purpose | 你存在的理由 / 願景・使命 |
| 2 | beachhead | 你的客戶是誰 / 灘頭堡市場 |
| 3 | value | 你能為客戶做什麼 / 價值主張・使用案例 |
| 4 | edge | 為什麼選你 / 競爭優勢・核心能力 |
| 5 | channel | 客戶如何取得你的產品 / 通路 |
| 6 | economics | 產品如何盈利 / 單位經濟 |
| 7 | sales | 你如何銷售 / 銷售流程 |
| 8 | sustain | 維持經濟 / LTV÷CAC |
| 9 | build | 設計與建立 / 產品路線圖・MVP |
| 10 | scale | 如何擴展 / 規模化 |

**範例（②灘頭堡 beachhead）：**
```ts
{
  no: 2, key: 'beachhead', title: '你的客戶是誰', subtitle: '灘頭堡市場',
  question: '你最早要服務、而且最有機會贏的那一小群具體的人是誰？',
  definition: '灘頭堡市場是你集中火力先攻下的最小可行市場：成員彼此相似、會口耳相傳、且夠小到你能成為第一名。',
  goodExample: '在台北、有 5–20 人團隊、做 B2B SaaS、已用 Notion 但苦於合約審閱的早期新創法務窗口。',
  badExample: '所有需要法律服務的中小企業。（太大、不相似、無法驗證）',
  coachQuestions: [
    '這群人彼此會不會交流、會不會互相推薦？',
    '你能不能講出三個具體、真實存在的人或公司？',
    '為什麼是「他們」而不是隔壁那群更難或更易的客戶？',
    '這個市場小到你能在 12 個月內成為第一名嗎？',
  ],
  devilAngles: [
    '你怎麼知道他們「現在」就痛到願意付錢，而不是「以後再說」？',
    '這個市場大到能養活公司、又小到你能贏嗎？給我數字。',
    '你描述的是一個市場，還是一個你想像出來的人？拿出你跟幾個真人聊過的證據。',
  ],
  evidenceNeeded: ['潛在客戶數量（TAM 之內的灘頭堡規模）', '已訪談人數', '願付意願訊號'],
}
```

其餘 9 格依相同結構填寫（內容工程，於實作階段完成，內容來源：Disciplined Entrepreneurship 24 步驟 + 圖中範例）。

## 8. 三階段 AI 流程

單一串流端點 `app/api/chat/route.ts`（`streamText`）。請求帶 `{ canvasId, blockNo, stage }`，server 依此組 system prompt 並載入該格 `messages` 歷史。

- **draft（起草）**：輸入 = `one_liner` + 該格 `question`。輸出 = 該格初稿（3–5 句、具體、可被質疑）。寫入 `block.content`，status=draft。
  - 另有「**整份起草**」：一句總述 → 依序為 10 格各生初稿（伺服器端逐格呼叫或單次結構化輸出）。
- **coach（教練）**：多輪。AI 一次問 1–2 個 `coachQuestions` 風格的追問，引用 `goodExample` 對照，**不直接給答案**，蘇格拉底式逼出具體與深度。
- **devil（魔鬼代言人）**：多輪。AI 切換成 skeptical investor，用 `devilAngles` 攻擊假設、依 `evidenceNeeded` 要數字證據、戳盲點。語氣犀利但有建設性。

**System prompt 骨架（依 stage 切換人格，共用該格 BlockSpec）：**
```
你正在協助使用者完成「紀律創業畫布」的第 {no} 格：{title}（{subtitle}）。
這一格在問：{question}
定義：{definition}
好範例：{goodExample}
壞範例：{badExample}

[draft]  根據使用者的事業總述，產出這一格的初稿，3–5 句，具體可驗證。
[coach]  你是蘇格拉底式教練。一次只問 1–2 個追問，幫他想得更具體更深，不要替他回答。
[devil]  你是挑剔的早期投資人。攻擊他的假設，要求數字與證據（{evidenceNeeded}），戳破盲點。犀利但有建設性。
```

**採納**：對話 panel 提供「採納為正式內容」按鈕，把當前 AI 產出（或使用者編輯後版本）寫入 `block.content`，coach 後 status=refined、devil 後 status=challenged。

## 9. UI / UX

**畫布總覽（`/canvas/[id]`）**
```
我的事業：法律 AI 助手                 [匯出 Markdown] [...]
+--------+--------+--------+--------+--------+
| ①存在  | ②客戶  | ③價值  | ④優勢  | ⑤通路  |
|  理由  | 灘頭堡 |        |        |        |
|  ●已挑戰| ●已深化| ◐草稿  | ○空    | ○空    |
+--------+--------+--------+--------+--------+
| ⑥盈利  | ⑦銷售  | ⑧維持  | ⑨建立  | ⑩擴展  |
|  ○空   | ○空   | ○空    | ○空    | ○空    |
+--------+--------+--------+--------+--------+
```
- 狀態燈：○空 → ◐草稿 → ●已深化 → ★已挑戰。
- 點任一格 → 右側滑出 block panel。

**Block panel（點格深入）**
```
② 你的客戶是誰（灘頭堡市場）                    [x]
這一格在問：你最早要服務、又最能贏的那一小群人是誰？
----------------------------------------------------
正式內容：[ 可編輯文字區 ]            [採納對話結論]
----------------------------------------------------
( 起草 | 教練 | 魔鬼代言人 )   <- 三階段切換
[ 對話串流區，含歷史 ]
[ 輸入框________________________ ] [送出]
```

## 10. 檔案 / 模組結構

```
app/
  (auth)/login/page.tsx
  dashboard/page.tsx              # 事業列表
  canvas/[id]/page.tsx            # 畫布總覽 + 點格 panel
  api/
    chat/route.ts                 # 三階段串流 (streamText)
    canvas/route.ts               # 畫布 CRUD
    canvas/[id]/draft-all/route.ts# 整份起草
    export/[id]/route.ts          # 匯出 Markdown
lib/
  canvas-framework.ts             # 10 格教練知識（靈魂）
  ai/prompts.ts                   # 依 (blockNo, stage) 組 system prompt
  db/schema.ts                    # Drizzle schema
  db/queries.ts                   # 資料存取
  supabase/{client,server}.ts     # @supabase/ssr
  export/markdown.ts              # 畫布 -> Markdown
components/
  canvas-grid.tsx
  block-card.tsx
  block-panel.tsx
  block-chat.tsx                  # useChat 三階段
  adopt-button.tsx
```

## 11. 錯誤處理與邊界

- AI 串流失敗：前端顯示重試；保留使用者已輸入訊息不遺失。
- 速率/額度：Gemini API 429（免費額度有上限）→ 友善提示稍後再試。
- 未登入存取畫布：middleware 導向 /login。
- 跨使用者存取：RLS 擋下；API 層再驗 `user_id` 一次（深度防禦）。
- 空 `one_liner` 就按整份起草：擋下並提示先填一句事業總述。
- 採納空內容：禁用按鈕。

## 12. 測試策略

- **單元（Vitest）**：`canvas-framework` 完整性（10 格、欄位齊全）、`ai/prompts` 依 stage 組裝的 snapshot、`export/markdown`、採納後 status 轉移。
- **整合**：`api/chat`（mock AI SDK provider）、`api/canvas` CRUD（mock Supabase）、RLS 隔離。
- **E2E（Playwright）**：登入（測試帳號）→ 建畫布 → 整份起草（mock AI）→ 點格 → 教練/魔鬼對話（mock AI）→ 採納 → 匯出 Markdown。
- **AI 品質**：system prompt 組裝走 snapshot；對話品質用少量 LLM-as-judge eval（非 MVP gate）。

## 13. 環境變數與部署

```
# AI（Google AI Studio — Gemini API）
GOOGLE_GENERATIVE_AI_API_KEY=...  # @ai-sdk/google 預設讀此變數；於 aistudio.google.com 取得

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...     # 僅 server 使用
DATABASE_URL=...                  # Supabase Postgres（pooler）給 Drizzle
```

- 本地：`pnpm dev`；DB migration 用 `drizzle-kit`。
- 部署：Vercel；Supabase 經 Vercel marketplace 連結；env 用 `vercel env`。

## 14. 開放問題 / 未來

- 登入 provider 先 Email magic link，是否要加 Google？（可後加）
- 「整份起草」用 10 次串流或單次結構化輸出？（實作時量測延遲決定）
- 是否要每格完成度評分與總覽儀表板？（非 MVP）

## 15. 里程碑（供 writing-plans 參考）

1. 專案骨架：Next.js + Tailwind + shadcn/ui + Drizzle + Supabase 連線 + Auth。
2. 資料層：schema、migration、RLS、canvas CRUD、建立時插 10 格。
3. `canvas-framework.ts` 全 10 格內容。
4. 畫布總覽 + block panel UI。
5. 三階段 AI 對話（chat route + prompts + useChat）+ 採納。
6. 整份起草。
7. 匯出 Markdown。
8. 測試（單元 / 整合 / E2E）。
9. 部署 Vercel + 環境設定。
