# Canvas Coach — 基礎建設與 AI 垂直切片 Implementation Plan（Plan 1／4）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 Next.js 專案骨架立起來，並把「紀律創業畫布」三段式 Gemini 對話端到端跑通——由真實的 10 格方法論知識（`canvas-framework`）與依 stage 切換的 system prompt 驅動。

**Architecture:** 純函式層（`lib/canvas-framework.ts` 的 10 格知識、`lib/ai/prompts.ts` 的 system prompt 組裝）100% 單元測試覆蓋，與框架解耦。`lib/ai/chat.ts` 是薄包裝，用 `streamText` + `google('gemini-2.5-flash')` 串流，並接受注入的 model 以利測試。`app/api/chat/route.ts` 只是把 HTTP 請求轉給 `streamChat` 的外殼。本計畫**不含** DB / Auth（留給 Plan 2）——請求自帶 `blockNo`、`stage`、`messages`。

**Tech Stack:** Next.js 15（App Router）+ TypeScript、Tailwind CSS、Vitest、`ai`（Vercel AI SDK v6）、`@ai-sdk/google`（Gemini）。套件管理一律用 **pnpm**。

---

## 檔案結構（本計畫會建立 / 修改）

| 檔案 | 責任 |
|------|------|
| `package.json` / `tsconfig.json` / `next.config.ts` / `tailwind` 設定 | Next.js 骨架（create-next-app 產生） |
| `vitest.config.ts` | 測試設定（node 環境、`@/*` alias） |
| `lib/canvas-framework.ts` | **靈魂**：`BlockSpec` 型別 + 全 10 格教練知識 |
| `lib/canvas-framework.test.ts` | 框架完整性測試（10 格、欄位齊全、key 唯一） |
| `lib/ai/prompts.ts` | `buildSystemPrompt(blockNo, stage)` 依格＋階段組 system prompt |
| `lib/ai/prompts.test.ts` | prompt 組裝單元測試 + 三段 snapshot |
| `lib/ai/chat.ts` | `streamChat({ blockNo, stage, messages, model? })` 薄包裝 |
| `lib/ai/chat.test.ts` | 用 mock model 驗證 system prompt 有正確傳入、串流可消費 |
| `app/api/chat/route.ts` | POST 端點：轉 `streamChat` 並回 UI message 串流 |
| `app/page.tsx` | 暫時的最小驗證頁（手動戳 Gemini 串流，Plan 3 會換成真畫布） |
| `.env.local.example` | 記錄 `GOOGLE_GENERATIVE_AI_API_KEY` |

---

## Task 1: 專案骨架與測試工具

**Files:**
- Create: 由 `create-next-app` 產生（`package.json`、`tsconfig.json`、`next.config.ts`、`app/layout.tsx`、`app/page.tsx`、`app/globals.css`、`postcss`/`tailwind` 設定等）
- Create: `vitest.config.ts`
- Create: `.env.local.example`
- Modify: `package.json`（加 test script）、`README.md`（保留專案原介紹）、`.gitignore`（併入既有忽略項）

- [ ] **Step 1: 把會與 create-next-app 衝突的檔案暫移開**

`create-next-app` 會拒絕覆蓋既有的 `README.md` 與 `.gitignore`。先移開，稍後再併回。

Run:
```bash
mv README.md README.project.md
mv .gitignore gitignore.project.bak
```

- [ ] **Step 2: 在專案根目錄 scaffold Next.js（非互動）**

Run:
```bash
pnpm create next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```
Expected: 在現有目錄就地產生 Next.js 專案；`docs/`、`canvas-coach.pen`、`.git/` 不受影響（它們不在 create-next-app 的衝突清單內）。安裝完成後出現 `app/`、`package.json`、`node_modules/`。

- [ ] **Step 3: 還原專案 README，併回 .gitignore 既有忽略項**

`create-next-app` 產生了它自己的 README 與 `.gitignore`。用我們原本的 README，並確保 `.gitignore` 仍忽略 drizzle 與測試產物。

Run:
```bash
mv README.project.md README.md
printf '\n# drizzle\n/drizzle\n\n# testing\n/coverage\n/playwright-report\n/test-results\n' >> .gitignore
rm -f gitignore.project.bak
```
Expected: `README.md` 是專案原介紹；`.gitignore` 同時含 Next.js 預設與我們的額外項。

- [ ] **Step 4: 安裝 AI SDK 與測試相依套件**

Run:
```bash
pnpm add ai @ai-sdk/google
pnpm add -D vitest
```
Expected: `package.json` 出現 `ai`、`@ai-sdk/google`（dependencies）與 `vitest`（devDependencies）。

- [ ] **Step 5: 建立 `vitest.config.ts`**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
})
```

- [ ] **Step 6: 在 `package.json` 加 test script**

Modify `package.json` 的 `"scripts"`，加入：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: 建立 `.env.local.example`**

Create `.env.local.example`:
```bash
# Google AI Studio — Gemini API（@ai-sdk/google 預設讀此變數）
# 於 https://aistudio.google.com/apikey 取得
GOOGLE_GENERATIVE_AI_API_KEY=
```

- [ ] **Step 8: 放一個冒煙測試確認 Vitest 會跑**

Create `lib/smoke.test.ts`:
```ts
import { expect, test } from 'vitest'

test('vitest 能執行', () => {
  expect(1 + 1).toBe(2)
})
```

- [ ] **Step 9: 跑測試確認綠燈**

Run: `pnpm test`
Expected: PASS，`lib/smoke.test.ts` 1 passed。

- [ ] **Step 10: 移除冒煙測試並 commit 骨架**

Run:
```bash
rm lib/smoke.test.ts
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest + AI SDK"
```

---

## Task 2: `canvas-framework.ts`（工具的靈魂，全 10 格）

**Files:**
- Create: `lib/canvas-framework.ts`
- Test: `lib/canvas-framework.test.ts`

- [ ] **Step 1: 先寫失敗的完整性測試**

Create `lib/canvas-framework.test.ts`:
```ts
import { describe, expect, test } from 'vitest'
import { CANVAS, type BlockSpec } from '@/lib/canvas-framework'

describe('canvas-framework', () => {
  test('剛好 10 格，no 從 1 到 10 連續', () => {
    expect(CANVAS).toHaveLength(10)
    expect(CANVAS.map((b) => b.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  test('key 全部唯一', () => {
    const keys = CANVAS.map((b) => b.key)
    expect(new Set(keys).size).toBe(10)
  })

  test('每一格的文字欄位都非空、陣列欄位至少 3 筆', () => {
    const textFields: (keyof BlockSpec)[] = [
      'key', 'title', 'subtitle', 'question', 'definition', 'goodExample', 'badExample',
    ]
    const arrayFields: (keyof BlockSpec)[] = ['coachQuestions', 'devilAngles', 'evidenceNeeded']
    for (const block of CANVAS) {
      for (const f of textFields) {
        expect(typeof block[f], `第 ${block.no} 格的 ${String(f)}`).toBe('string')
        expect((block[f] as string).length, `第 ${block.no} 格的 ${String(f)}`).toBeGreaterThan(0)
      }
      for (const f of arrayFields) {
        expect(Array.isArray(block[f]), `第 ${block.no} 格的 ${String(f)}`).toBe(true)
        expect((block[f] as string[]).length, `第 ${block.no} 格的 ${String(f)}`).toBeGreaterThanOrEqual(3)
        for (const item of block[f] as string[]) {
          expect(item.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test lib/canvas-framework.test.ts`
Expected: FAIL，`Cannot find module '@/lib/canvas-framework'`。

- [ ] **Step 3: 實作 `lib/canvas-framework.ts`（型別 + 全 10 格）**

Create `lib/canvas-framework.ts`:
```ts
export type Stage = 'draft' | 'coach' | 'devil'
export type BlockStatus = 'empty' | 'draft' | 'refined' | 'challenged'

export type BlockSpec = {
  no: number
  key: string
  title: string
  subtitle: string
  question: string
  definition: string
  goodExample: string
  badExample: string
  coachQuestions: string[]
  devilAngles: string[]
  evidenceNeeded: string[]
}

export const CANVAS: BlockSpec[] = [
  {
    no: 1,
    key: 'purpose',
    title: '你存在的理由',
    subtitle: '願景・使命',
    question: '你為什麼要做這件事？三年後世界因為你而有什麼具體不同？',
    definition:
      '創業的北極星——你想造成的改變與存在意義。它指引後續每一格的取捨，避免淪為「為做而做」。',
    goodExample:
      '讓中小律所的資深律師不再被合約初審綁住，把專業時間還給真正需要判斷的案子。',
    badExample: '成為法律科技領域的領導者。（空泛、無法指引取捨、人人可說）',
    coachQuestions: [
      '如果這件事成功，誰的生活會具體變好、變得怎樣？',
      '拿掉「賺錢」這個答案，你還會想做它嗎？為什麼？',
      '這個理由能幫你在兩個機會之間做取捨嗎？舉一個例子。',
    ],
    devilAngles: [
      '這個願景換成任何一家同業講，成不成立？如果成立，它就不是你的。',
      '你說的使命，和你打算做的產品真的一致嗎？還是事後包裝？',
      '三年後你要怎麼「驗證」自己真的造成了那個改變？指標是什麼？',
    ],
    evidenceNeeded: [
      '你想服務對象的真實處境（訪談 / 觀察）',
      '你個人與此使命的連結',
      '可衡量的長期改變指標',
    ],
  },
  {
    no: 2,
    key: 'beachhead',
    title: '你的客戶是誰',
    subtitle: '灘頭堡市場',
    question: '你最早要服務、而且最有機會贏的那一小群具體的人是誰？',
    definition:
      '灘頭堡市場是你集中火力先攻下的最小可行市場：成員彼此相似、會口耳相傳、且夠小到你能成為第一名。',
    goodExample:
      '在台北、有 5–20 人團隊、做 B2B SaaS、已用 Notion 但苦於合約審閱的早期新創法務窗口。',
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
    evidenceNeeded: [
      '潛在客戶數量（TAM 之內的灘頭堡規模）',
      '已訪談人數',
      '願付意願訊號',
    ],
  },
  {
    no: 3,
    key: 'value',
    title: '你能為客戶做什麼',
    subtitle: '價值主張・使用案例',
    question: '在客戶的真實流程裡，你具體幫他把什麼變好了？好多少？',
    definition:
      '價值主張是「客戶用了你之後，相對於現狀的可量化改善」，最好綁在一個完整的端到端使用案例上。',
    goodExample:
      '資深律師審一份 30 頁服務合約，從 60 分鐘降到 15 分鐘，且漏看關鍵條款的機率下降。',
    badExample: '我們用 AI 讓合約審閱更聰明、更有效率。（沒有對照基準、沒有數字、無法驗證）',
    coachQuestions: [
      '客戶現在沒有你是怎麼做這件事的？花多少時間 / 錢 / 力氣？',
      '你帶來的改善能不能用一個數字表達（時間、金錢、風險）？',
      '把它寫成一個從頭到尾的使用情境：客戶從哪開始、到哪結束？',
    ],
    devilAngles: [
      '你說的「更好」，是客戶真的在乎的那個維度嗎？還是你以為他在乎？',
      '改善 4 倍聽起來很美，但客戶換掉現狀的成本（學習、風險）會不會更高？',
      '這個價值，現成工具（甚至 Excel / ChatGPT）給不給得了八成？那你的二成憑什麼收費？',
    ],
    evidenceNeeded: [
      '客戶現狀的量化基準',
      '你帶來的改善幅度（數字）',
      '至少一個完整端到端使用案例',
    ],
  },
  {
    no: 4,
    key: 'edge',
    title: '為什麼選你',
    subtitle: '競爭優勢・核心能力',
    question: '對手很難複製、而且會隨時間越拉越大的那個優勢是什麼？',
    definition:
      '核心競爭力（Core）是你獨有、難被抄走、且隨規模 / 時間自我強化的能力，不是功能清單。',
    goodExample:
      '累積了 5 萬份台灣在地合約的條款風險標註資料，越多律所使用、模型在地化越準，後進者難追。',
    badExample: '我們的團隊很厲害、產品 UI 很好用。（可被挖角 / 抄襲，不隨時間變強）',
    coachQuestions: [
      '如果一家大公司明天決定做一樣的東西，什麼會擋住他們？',
      '你的優勢會隨著用戶 / 時間變強，還是會被追平？',
      '這是「核心能力」還是只是「現在做得比較好的功能」？',
    ],
    devilAngles: [
      '你講的優勢，巨頭只要砸錢 / 併購就能補上，為什麼不會？',
      '「資料優勢」很多人講——你的資料真的有獨佔性與飛輪，還是公開可得？',
      '如果這個優勢被抄走，你還剩什麼？',
    ],
    evidenceNeeded: [
      '優勢的可防禦性來源（資料 / 網路效應 / 法規 / 品牌）',
      '隨規模自我強化的機制',
      '對手複製所需的時間與成本',
    ],
  },
  {
    no: 5,
    key: 'channel',
    title: '客戶如何取得你的產品',
    subtitle: '通路',
    question: '客戶從「沒聽過你」到「開始用你」，中間實際走過哪些步驟？',
    definition:
      '通路是把產品送到客戶手上的完整路徑（觸及 → 評估 → 購買 → 部署），每一步都可能流失客戶。',
    goodExample:
      '透過律師公會線上講座觸及 → 提供免費合約健檢 → 試用 14 天 → 事務所統一採購。',
    badExample: '靠口碑跟社群行銷。（沒有可執行步驟、無法估算成本與轉換）',
    coachQuestions: [
      '把客戶從不認識你到付費，畫成一條有編號的步驟線，每步是什麼？',
      '哪一步最容易流失客戶？你打算怎麼接住？',
      '這條通路的單一獲客成本你估多少？怎麼算的？',
    ],
    devilAngles: [
      '你假設客戶會自己跑完這條路，憑什麼？哪一步你其實沒驗證過？',
      '你的通路成本會不會比客戶終身價值還高？算給我看。',
      'B2B 的採購決策不是一個人，這條路上「誰」會擋下來？',
    ],
    evidenceNeeded: [
      '完整通路步驟圖',
      '各步驟轉換率假設',
      '預估單一獲客成本（CAC）',
    ],
  },
  {
    no: 6,
    key: 'economics',
    title: '產品如何盈利',
    subtitle: '單位經濟・定價',
    question: '你賣一個單位，實際賺多少、成本多少、客戶憑什麼用這個方式付錢？',
    definition:
      '單位經濟＋定價：拆解單一交易 / 客戶的收入與變動成本，並選擇貼合客戶價值感的收費模式。',
    goodExample:
      '每席每月 2,000 元訂閱，邊際成本（AI 推論＋儲存）約 300 元，毛利率 85%，依省下的工時定價。',
    badExample: '之後再想商業模式，先衝用戶。（迴避單位經濟，等於不知道規模化會不會賺）',
    coachQuestions: [
      '一個客戶帶來的收入與你的變動成本，各是多少？',
      '你的收費方式，跟客戶感受到的價值是綁在一起的嗎（用量？席次？成效？）？',
      '規模放大 10 倍，毛利率會變好還是變差？為什麼？',
    ],
    devilAngles: [
      '你的毛利有沒有把 AI 推論、客服、退費這些真實成本算進去？',
      '客戶會接受這個定價，還是你一漲價他就跑去用免費替代品？',
      '「先衝用戶再變現」——萬一這些用戶根本不願付費呢？',
    ],
    evidenceNeeded: [
      '單客收入與變動成本拆解',
      '毛利率',
      '定價與客戶價值的對應依據',
    ],
  },
  {
    no: 7,
    key: 'sales',
    title: '你如何銷售',
    subtitle: '銷售流程',
    question: '一筆生意從接觸到成交，誰參與決策、要多久、卡在哪？',
    definition:
      '銷售流程是把通路裡的潛客真正轉成付費的可重複劇本，要辨識決策單位（DMU）與銷售週期。',
    goodExample:
      '窗口（資深律師）發起 → 合夥人核可預算 → IT 過資安 → 平均 6 週成交；由內容＋免費健檢推動。',
    badExample: '東西夠好，客戶自然會買。（忽略 B2B 多人決策與銷售週期）',
    coachQuestions: [
      '這筆錢實際由誰拍板？誰會反對？誰只是使用者？',
      '從第一次接觸到收到錢，平均要多久？中間最常卡在哪一關？',
      '這個銷售動作可以被一個新業務照著做、且重複成功嗎？',
    ],
    devilAngles: [
      '你假設「東西好就會賣」，但企業採購會這樣嗎？把真正的關卡列出來。',
      '銷售週期 6 週，你的現金撐得到成交嗎？算一下。',
      '你跑通過幾筆「真的有人付錢」的完整流程？還是都停在試用？',
    ],
    evidenceNeeded: [
      '決策單位 DMU 角色清單',
      '平均銷售週期',
      '可重複的銷售劇本 / 已成交案例',
    ],
  },
  {
    no: 8,
    key: 'sustain',
    title: '維持經濟',
    subtitle: 'LTV ÷ CAC',
    question: '一個客戶一生帶來的價值，是你獲取他成本的幾倍？',
    definition:
      '維持的經濟性看 LTV ÷ CAC 與回收期：留存夠久、CAC 夠低，生意才長期成立。',
    goodExample:
      '客戶平均續訂 3 年，LTV 約 7.2 萬，CAC 約 1.5 萬，LTV/CAC ≈ 4.8，CAC 9 個月回收。',
    badExample: '我們的市場很大，所以一定划算。（用 TAM 迴避留存與回收的真實計算）',
    coachQuestions: [
      '客戶平均會用你多久？你怎麼知道（而不是希望）？',
      'LTV 除以 CAC 大於 3 嗎？回收期幾個月？',
      '哪一個槓桿最能改善這個比值：留存、客單、還是獲客成本？',
    ],
    devilAngles: [
      '你的 LTV 假設客戶留很久——但你連產品都還沒上線，這數字哪來的？',
      'churn 高一點點，這個模型還成立嗎？做個敏感度測試。',
      'CAC 在你規模化、打更難的客群後一定會上升，到時 LTV/CAC 還健康嗎？',
    ],
    evidenceNeeded: [
      '客戶留存 / 續約假設與依據',
      'LTV 與 CAC 計算',
      'CAC 回收期',
    ],
  },
  {
    no: 9,
    key: 'build',
    title: '設計與建立',
    subtitle: '產品路線圖・MVP',
    question: '為了驗證最關鍵的假設，你「最少」要先做出什麼？',
    definition:
      'MVP 與路線圖：用最小的東西驗證最大的風險假設，而不是一次做完所有功能。',
    goodExample:
      '先做「單份合約上傳 → 風險條款標註」一條流程，找 5 家律所試用，驗證他們真的會每天用。',
    badExample: '先把平台做完整：合約管理、簽署、計費、儀表板全上。（一次驗太多、燒錢又慢）',
    coachQuestions: [
      '你最怕被推翻的那個假設是什麼？哪個最小產品能驗證它？',
      '為了學到這件事，有沒有什麼功能其實可以先不做？',
      '怎樣算「驗證成功」？你會看哪個行為指標？',
    ],
    devilAngles: [
      '你的 MVP 是在驗證「他們會不會用」，還是只是把你想做的功能做小一號？',
      '這個 MVP 真的「最小」嗎？哪幾個功能是你捨不得砍但其實不必要的？',
      '如果試用者用了幾天就不用了，你的計畫有沒有準備好面對這個結果？',
    ],
    evidenceNeeded: [
      '最關鍵的待驗證假設',
      'MVP 範圍與排除項',
      '驗證成功的行為指標',
    ],
  },
  {
    no: 10,
    key: 'scale',
    title: '如何擴展',
    subtitle: '規模化',
    question: '打下灘頭堡之後，下一個相鄰市場是誰？憑什麼能複製過去？',
    definition:
      '規模化是從灘頭堡向相鄰市場有紀律地擴張，靠的是可複製的核心與既有立足點，而非盲目擴張。',
    goodExample:
      '站穩中小律所合約審閱後，沿用同套引擎擴到「企業法務部門」與「會計師事務所盡職調查」。',
    badExample: '成功後就拓展到所有需要文件審閱的產業。（沒有相鄰性、沒有順序、沒有複製邏輯）',
    coachQuestions: [
      '你的第二個市場為什麼是「它」？它和灘頭堡哪裡相似到能複製？',
      '擴張時，你的核心能力哪部分能直接搬過去，哪部分要重做？',
      '擴張的順序是什麼？為什麼是這個順序？',
    ],
    devilAngles: [
      '「之後拓展到所有人」——這是策略還是逃避聚焦？給我下一步的具體市場。',
      '你在灘頭堡贏的原因，換到下一個市場還成立嗎？還是要從零再來？',
      '你會不會為了追規模太早離開灘頭堡，結果兩邊都站不穩？',
    ],
    evidenceNeeded: [
      '相鄰市場清單與順序',
      '可複製的核心 vs 需重建的部分',
      '擴張的觸發條件（何時才擴）',
    ],
  },
]

export function getBlock(no: number): BlockSpec {
  const block = CANVAS.find((b) => b.no === no)
  if (!block) throw new Error(`找不到第 ${no} 格（有效範圍 1–10）`)
  return block
}
```

- [ ] **Step 4: 跑測試確認綠燈**

Run: `pnpm test lib/canvas-framework.test.ts`
Expected: PASS，3 passed。

- [ ] **Step 5: Commit**

Run:
```bash
git add lib/canvas-framework.ts lib/canvas-framework.test.ts
git commit -m "feat: add canvas-framework with all 10 disciplined-entrepreneurship blocks"
```

---

## Task 3: `lib/ai/prompts.ts` — 依（格、階段）組 system prompt

**Files:**
- Create: `lib/ai/prompts.ts`
- Test: `lib/ai/prompts.test.ts`

- [ ] **Step 1: 先寫失敗的測試**

Create `lib/ai/prompts.test.ts`:
```ts
import { describe, expect, test } from 'vitest'
import { buildSystemPrompt } from '@/lib/ai/prompts'

describe('buildSystemPrompt', () => {
  test('共用區塊帶入該格的 title、question、definition、好壞範例', () => {
    const p = buildSystemPrompt(2, 'coach')
    expect(p).toContain('你的客戶是誰')
    expect(p).toContain('灘頭堡市場')
    expect(p).toContain('你最早要服務、而且最有機會贏的那一小群具體的人是誰？')
    expect(p).toContain('所有需要法律服務的中小企業') // badExample
  })

  test('draft 階段帶入起草指示', () => {
    const p = buildSystemPrompt(1, 'draft')
    expect(p).toContain('初稿')
    expect(p).not.toContain('蘇格拉底')
  })

  test('coach 階段帶入蘇格拉底式追問指示', () => {
    const p = buildSystemPrompt(1, 'coach')
    expect(p).toContain('蘇格拉底')
  })

  test('devil 階段帶入魔鬼代言人指示與該格所需證據', () => {
    const p = buildSystemPrompt(2, 'devil')
    expect(p).toContain('投資人')
    expect(p).toContain('已訪談人數') // evidenceNeeded
  })

  test('無效格號丟錯', () => {
    expect(() => buildSystemPrompt(99, 'coach')).toThrow()
  })

  test('三個階段的輸出各自穩定（snapshot）', () => {
    expect(buildSystemPrompt(2, 'draft')).toMatchSnapshot()
    expect(buildSystemPrompt(2, 'coach')).toMatchSnapshot()
    expect(buildSystemPrompt(2, 'devil')).toMatchSnapshot()
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test lib/ai/prompts.test.ts`
Expected: FAIL，`Cannot find module '@/lib/ai/prompts'`。

- [ ] **Step 3: 實作 `lib/ai/prompts.ts`**

Create `lib/ai/prompts.ts`:
```ts
import { getBlock, type Stage } from '@/lib/canvas-framework'

const STAGE_INSTRUCTION: Record<Stage, (evidence: string[]) => string> = {
  draft: () =>
    '【任務：起草】根據使用者的事業總述與這一格的問題，產出這一格的初稿。3–5 句、具體、可被質疑。只輸出初稿內容本身，不要客套或前言。',
  coach: () =>
    '【任務：教練】你是蘇格拉底式教練。一次只問 1–2 個追問，幫使用者把答案想得更具體、更有深度。不要替他回答，用對照好範例的方式點出落差，引導他自己補上證據。',
  devil: (evidence) =>
    `【任務：魔鬼代言人】你是挑剔的早期投資人。攻擊使用者的假設、戳破盲點，並要求以下這類數字與證據：${evidence.join('、')}。語氣犀利但有建設性，目的是讓商業模型禁得起挑戰，而不是打擊他。`,
}

export function buildSystemPrompt(blockNo: number, stage: Stage): string {
  const b = getBlock(blockNo)
  return [
    `你正在協助使用者完成「紀律創業畫布」（MIT Disciplined Entrepreneurship）的第 ${b.no} 格：${b.title}（${b.subtitle}）。`,
    `這一格在問：${b.question}`,
    `定義：${b.definition}`,
    `好範例：${b.goodExample}`,
    `壞範例：${b.badExample}`,
    '',
    STAGE_INSTRUCTION[stage](b.evidenceNeeded),
    '',
    '請全程使用繁體中文。',
  ].join('\n')
}
```

- [ ] **Step 4: 跑測試確認綠燈（首次會建立 snapshot）**

Run: `pnpm test lib/ai/prompts.test.ts`
Expected: PASS；終端顯示 `3 snapshots written`，其餘斷言 passed。

- [ ] **Step 5: Commit**

Run:
```bash
git add lib/ai/prompts.ts lib/ai/prompts.test.ts lib/ai/__snapshots__
git commit -m "feat: build stage-aware system prompts from canvas-framework"
```

---

## Task 4: `lib/ai/chat.ts` — Gemini 串流薄包裝（可注入 model）

**Files:**
- Create: `lib/ai/chat.ts`
- Test: `lib/ai/chat.test.ts`

- [ ] **Step 1: 先寫失敗的測試（用 mock model，不打真 API）**

Create `lib/ai/chat.test.ts`:
```ts
import { describe, expect, test } from 'vitest'
import { MockLanguageModelV2 } from 'ai/test'
import { simulateReadableStream } from 'ai'
import { streamChat } from '@/lib/ai/chat'

function mockModel(capture: { prompt?: unknown }) {
  return new MockLanguageModelV2({
    doStream: async (options) => {
      capture.prompt = options.prompt
      return {
        stream: simulateReadableStream({
          chunks: [
            { type: 'text-start', id: '0' },
            { type: 'text-delta', id: '0', delta: '已收到，' },
            { type: 'text-delta', id: '0', delta: '這是回應。' },
            { type: 'text-end', id: '0' },
            {
              type: 'finish',
              finishReason: 'stop',
              usage: { inputTokens: 5, outputTokens: 5, totalTokens: 10 },
            },
          ],
        }),
      }
    },
  })
}

describe('streamChat', () => {
  test('把對應格＋階段的 system prompt 傳給 model，並可消費串流文字', async () => {
    const capture: { prompt?: unknown } = {}
    const result = streamChat({
      blockNo: 2,
      stage: 'devil',
      messages: [{ role: 'user', content: '我的客戶是所有中小企業。' }],
      model: mockModel(capture),
    })

    const text = await result.text
    expect(text).toBe('已收到，這是回應。')

    // model 收到的 prompt 第一則應是含該格知識的 system 訊息
    const prompt = capture.prompt as Array<{ role: string; content: unknown }>
    const system = prompt.find((m) => m.role === 'system')
    expect(JSON.stringify(system)).toContain('灘頭堡市場')
    expect(JSON.stringify(system)).toContain('投資人')
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test lib/ai/chat.test.ts`
Expected: FAIL，`Cannot find module '@/lib/ai/chat'`。

- [ ] **Step 3: 實作 `lib/ai/chat.ts`**

Create `lib/ai/chat.ts`:
```ts
import { google } from '@ai-sdk/google'
import { streamText, type LanguageModel, type ModelMessage } from 'ai'
import { buildSystemPrompt } from '@/lib/ai/prompts'
import type { Stage } from '@/lib/canvas-framework'

export type StreamChatOptions = {
  blockNo: number
  stage: Stage
  messages: ModelMessage[]
  /** 預設用 Gemini 2.5 Flash；測試可注入 mock model。 */
  model?: LanguageModel
}

export function streamChat({ blockNo, stage, messages, model }: StreamChatOptions) {
  return streamText({
    model: model ?? google('gemini-2.5-flash'),
    system: buildSystemPrompt(blockNo, stage),
    messages,
  })
}
```

- [ ] **Step 4: 跑測試確認綠燈**

Run: `pnpm test lib/ai/chat.test.ts`
Expected: PASS，1 passed。

> 註：若安裝的 AI SDK 版本對 `simulateReadableStream` 的 chunk 形狀有差異而報錯，依該版本 `ai/test` 文件調整 chunk（核心斷言 `capture.prompt` 含 system 文字不變）。

- [ ] **Step 5: Commit**

Run:
```bash
git add lib/ai/chat.ts lib/ai/chat.test.ts
git commit -m "feat: add streamChat wrapper over gemini-2.5-flash with injectable model"
```

---

## Task 5: `app/api/chat/route.ts` — HTTP 串流端點 + 手動驗證頁

**Files:**
- Create: `app/api/chat/route.ts`
- Modify: `app/page.tsx`（換成最小驗證頁）

- [ ] **Step 1: 實作 route handler**

Create `app/api/chat/route.ts`:
```ts
import { convertToModelMessages, type UIMessage } from 'ai'
import { streamChat } from '@/lib/ai/chat'
import type { Stage } from '@/lib/canvas-framework'

export const maxDuration = 30

export async function POST(req: Request) {
  const { blockNo, stage, messages } = (await req.json()) as {
    blockNo: number
    stage: Stage
    messages: UIMessage[]
  }

  const result = streamChat({
    blockNo,
    stage,
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
```

- [ ] **Step 2: 換掉預設首頁，放一個最小三段式對話驗證頁**

Replace `app/page.tsx` 全部內容為：
```tsx
'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { CANVAS, type Stage } from '@/lib/canvas-framework'

export default function Home() {
  const [blockNo, setBlockNo] = useState(2)
  const [stage, setStage] = useState<Stage>('coach')
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const block = CANVAS.find((b) => b.no === blockNo)!

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui', padding: 16 }}>
      <h1>Canvas Coach — 串流驗證頁</h1>
      <p style={{ color: '#666' }}>（Plan 3 會換成真正的畫布 UI，這頁只為了戳通 Gemini）</p>

      <div style={{ display: 'flex', gap: 12, margin: '12px 0' }}>
        <select value={blockNo} onChange={(e) => setBlockNo(Number(e.target.value))}>
          {CANVAS.map((b) => (
            <option key={b.no} value={b.no}>
              {b.no}. {b.title}（{b.subtitle}）
            </option>
          ))}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
          <option value="draft">起草</option>
          <option value="coach">教練</option>
          <option value="devil">魔鬼代言人</option>
        </select>
      </div>

      <p style={{ background: '#f3f1eb', padding: 12, borderRadius: 8 }}>
        這一格在問：{block.question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <b>{m.role === 'user' ? '你' : 'AI'}：</b>
            {m.parts.map((p, i) => (p.type === 'text' ? <span key={i}>{p.text}</span> : null))}
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!input.trim()) return
          sendMessage({ text: input }, { body: { blockNo, stage } })
          setInput('')
        }}
        style={{ display: 'flex', gap: 8 }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="輸入你的想法，回答教練或挑你的魔鬼代言人…"
          style={{ flex: 1, padding: 10 }}
        />
        <button disabled={status === 'streaming'}>送出</button>
      </form>
    </main>
  )
}
```

- [ ] **Step 3: 安裝前端 hook 套件（若尚未隨 ai 帶入）**

Run: `pnpm add @ai-sdk/react`
Expected: `package.json` 出現 `@ai-sdk/react`。

- [ ] **Step 4: 設定本地金鑰並手動驗證串流**

Run:
```bash
cp .env.local.example .env.local
# 編輯 .env.local，把 GOOGLE_GENERATIVE_AI_API_KEY 填入 aistudio.google.com 取得的金鑰
pnpm dev
```
然後在瀏覽器開 `http://localhost:3000`：
1. 選第 2 格、階段「魔鬼代言人」。
2. 輸入「我的客戶是所有中小企業。」送出。
Expected: 看到 AI 以挑剔投資人的口吻、用「灘頭堡」角度逐字串流質疑（要你縮小客群、拿出訪談數字）。切到「教練」會改成蘇格拉底式追問；切到「起草」會生出初稿。

- [ ] **Step 5: 跑完整測試套件確認全綠**

Run: `pnpm test`
Expected: PASS，三個測試檔（canvas-framework / prompts / chat）全部 passed。

- [ ] **Step 6: Commit**

Run:
```bash
git add app/api/chat/route.ts app/page.tsx package.json pnpm-lock.yaml
git commit -m "feat: wire /api/chat streaming endpoint with minimal verification page"
```

---

## 完成定義（Plan 1）

- `pnpm test` 全綠：框架完整性、三段 prompt 組裝（含 snapshot）、streamChat 把正確 system prompt 餵給 model。
- `pnpm dev` 下，首頁能對任一格、任一階段與 `gemini-2.5-flash` 進行即時串流對話，且回應明顯反映該格的方法論知識與該階段人格。
- 沒有任何 DB / Auth（如預期），所有狀態在前端記憶體；持久化由 Plan 2 接手。

## 交接到 Plan 2 的介面

- `streamChat(opts)`、`buildSystemPrompt(blockNo, stage)`、`getBlock(no)`、`CANVAS`、型別 `BlockSpec / Stage / BlockStatus` 均可直接被 Plan 2 重用。
- `app/api/chat/route.ts` 之後會在 Plan 2 加上「載入該格歷史訊息、寫回 messages 表」；目前的薄外殼刻意不碰 DB，方便無痛擴充。
