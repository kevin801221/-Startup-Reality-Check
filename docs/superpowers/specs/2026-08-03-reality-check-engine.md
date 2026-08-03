# 從一個 App 到「每個新專案第一天都能用」

- 日期：2026-08-03
- 狀態：Layer 1 與 Layer 3 的 plugin 面已實作，Layer 2（框架註冊表）為設計提案
- 作者：kevin

## 1. 問題

現在的 canvas-coach 是一個**完整但封閉**的產品：要用它得先 clone repo、填五個環境變數、跑 Supabase migration、登入、建立畫布。這對「我要認真做一個事業」是合理的成本；但對「我今天有個點子想先被戳三十分鐘」就太重了，而後者才是每個新專案第一天真正會發生的事。

真正值得被重複使用的資產不是這個 web app，而是兩樣東西：

1. **框架知識**：`lib/canvas-framework.ts` 裡 10 格的定義、好／壞範例、追問題庫、攻擊角度、所需證據。這是人工整理出來的，換模型不會失效。
2. **訪談協議**：起草 → 教練 → 魔鬼代言人的階段推進，加上 ○◐●★ 的狀態階梯與證據門檻。

App 只是這兩樣東西的其中一個**輸出面**。要讓所有未來專案第一天就能用，做法是把資產跟輸出面分開，然後多開幾個輸出面。

## 2. 現況的耦合點

擴展前先看清楚哪裡黏住了：

| 位置 | 耦合 |
|------|------|
| `lib/canvas-framework.ts` | `CANVAS` 是模組層級的單一常數，`getBlock(no)` 從它直接查，等於全 app 只認得一種框架 |
| `lib/ai/prompts.ts` | 「紀律創業畫布」「請全程使用繁體中文」寫死在字串裡；`STAGE_INSTRUCTION` 固定三階段 |
| `lib/db/schema.ts` | `blocks.blockNo` 是 int，`unique(canvasId, blockNo)`，沒有 framework 維度 |
| `lib/db/blocks.ts` | `buildInitialBlocks()` 依 `CANVAS` 展開 10 筆；`statusAfterStage()` 把 stage → status 寫死 |
| `lib/export/markdown.ts`、`components/canvas-grid.tsx`、`lib/ai/draft.ts` | 直接 `import { CANVAS }`，繞過任何選擇框架的機會 |

好消息是：這些全部只依賴**資料形狀**（`BlockSpec`），沒有依賴「10」這個數字的邏輯，也沒有把方法論散進 UI。所以擴展是加一層 indirection，不是重寫。

## 3. 三層擴展

### Layer 1：可攜 skill pack（本次已實作）

把框架知識編譯成一個 agent skill，複製或 symlink 到 `~/.agents/skills/` 就在所有專案生效，不需要 app、不需要資料庫、不需要登入。

- `lib/skill/build.ts`：純函式，把 `BlockSpec[]` 渲染成 `SKILL.md`（訪談協議）＋ `references/canvas.md`（10 格知識）＋ `templates/reality-check.md`（工作檔案範本）。
- `scripts/build-skill.ts` + `pnpm skill:build`：產出 `skills/startup-reality-check/`。
- `lib/skill/build.test.ts`：除了檢查渲染內容，還會比對 commit 進 repo 的產物是否與原始碼同步，避免知識在兩邊 drift。

單一事實來源仍然是 `lib/canvas-framework.ts`：改一次，app 與 skill 同時更新。訪談成果寫進使用者專案的 `reality-check.md`，跟著那個 repo 進 git，所以「持久化」由檔案系統負責，不需要 Postgres。

安裝與使用見 [`plugin/README.md`](../../../plugin/README.md)。

### Layer 1.5：把單一 skill 變成一條 pipeline（已實作）

單獨一個「商業壓測」skill 解決的是「這件事值不值得做」，但使用者第一天真正要的是**從訪談到上線那一整串**。所以 `plugin/` 現在是一個完整的 agent plugin：`idea-to-ship` 當協調者，底下八個階段各自一個 skill（事實整理、商業壓測、追問收斂、寫規格、介面設計、前後端規劃、切片實作、上線）。

三個關鍵設計：

1. **狀態在檔案，不在對話。** `docs/pipeline/<slug>.md` 記模式、當前階段、阻塞問題、決定紀錄與交接筆記。任何 agent 讀完它就能接手，這是「所有 coding agent 都能用」的真正條件——不是格式相容，而是狀態可交接。
2. **grill-me 的姿態 + 固定覆蓋清單。** `grill-to-converge` 用 grill-me 的訪談法（一次一題、附建議答案、能查就查），但收尾前必須掃過 `references/coverage.md` 的十個維度（權限、資料模型、狀態轉換、失敗處理、既有系統、錢與法遵、通知副作用、介面狀態、可觀測性、範圍與驗收），補掉「模型今天沒想到就不會問」的漏洞。
3. **自動化到硬停點為止。** `mode: auto` 讓整條流程不逐階段確認，但在四種情況必須停：只有人能做的決定、花錢或不可逆的動作、缺憑證或環境、事實不足只能靠猜。能自動化的是流程，不是責任；為了「跑完」而編造答案會讓錯誤一路傳到 production。

設計工具走 MCP：`design-ui` 依序偵測 Figma MCP、Pencil（`.pen`）MCP、專案既有設計系統，最後才退回「用既有元件寫可跑的 UI 骨架當設計稿」。各通道的踩雷點集中在 `design-ui/references/mcp-tools.md`，避免每次重新踩（Pencil 只能用 hex、不可直接寫 `.pen` JSON、桌面 app 要開、新檔要手動存；Figma 官方 skills 是強制前置）。

`lib/skill/pack.test.ts` 驗證整包的可安裝性：每個 skill 的 frontmatter 完整、`name` 與資料夾同名、description 長度在限制內、內文引用的 `references/`／`templates/` 檔案存在、每個階段都與協調者雙向連結、兩份 plugin manifest 與 marketplace 的名稱版本一致。這些是 plugin 最容易安靜壞掉的地方。

### Layer 2：框架註冊表（framework-as-data）

Layer 1 解決了「隨處可用」，但用的還是同一套創業畫布。真正讓這個 codebase 變成你所有專案的起點，是把它從「創業畫布 app」變成「**有紀律的訪談引擎**」：框架是資料，引擎不認識任何特定框架。

改動清單：

1. `lib/frameworks/types.ts` — 抽出 `FrameworkSpec`：

```ts
export type FrameworkSpec = {
  key: string          // 'de-canvas' | 'tech-design' | ...
  name: string
  locale: string       // 進 prompt，取代寫死的「請全程使用繁體中文」
  intro: string        // 進 prompt，取代寫死的「紀律創業畫布」
  stages: StageSpec[]  // 階段也變資料：名稱、角色、指令、完成後的 status
  statuses: StatusSpec[]
  blocks: BlockSpec[]
}
```

2. `lib/frameworks/de-canvas.ts` — 現有 `CANVAS` 原封不動搬進來，成為第一個註冊項；`lib/frameworks/registry.ts` 提供 `getFramework(key)`、`listFrameworks()`。
3. `lib/canvas-framework.ts` 保留為 `de-canvas` 的 re-export，讓現有 import 不必一次全改（之後再逐檔收斂）。
4. `prompts.ts` / `draft.ts` / `chat.ts` / `synthesize.ts` / `markdown.ts` 的簽章由 `(blockNo, stage)` 改成 `(framework, blockNo, stage)`。
5. DB：`canvases` 加 `framework_key text not null default 'de-canvas'`，`blocks.blockNo` 的唯一性維持 `(canvasId, blockNo)` 即可（框架綁在 canvas 上）。`buildInitialBlocks(canvasId, framework)`。
6. UI：建立畫布時多一個「選框架」步驟；`canvas-grid` 的欄數改成依 `blocks.length` 算，不要假設 10。
7. `scripts/build-skill.ts` 對每個註冊框架各產一個 skill 目錄。

值得先加的第二、三個框架（同一個引擎，換一份知識）：

- **技術設計 review**：格子＝問題陳述、非目標、資料模型、失效模式、可觀測性、回滾策略；魔鬼代言人問「這個設計在流量十倍時先壞在哪」。這一份會是你每個新專案第一天最常用的。
- **產品 PRD／spec**：格子＝使用者、要解決的痛、成功指標、範圍外、驗收條件。
- **上線前檢查**：格子＝權限邊界、錢與退款、資料刪除、稽核紀錄。

這一層做完，「未來所有專案一開始都可以用」才算真的成立：新專案第一天要的往往不是灘頭堡市場，而是技術設計 review，而你已經有引擎了。

註：Layer 1.5 的 pipeline 已經先用 markdown（`grill-to-converge/references/coverage.md`、`spec-writer/templates/spec.md`）把上面這幾份框架的內容落地了。Layer 2 的價值在於把它們變成**有型別、有測試、app 與 skill 共用**的資料，而不是各自維護一份 markdown——等第三份框架出現、開始出現複製貼上時再做，才不會過早抽象。

### Layer 3：分發面

引擎與知識分離後，可以按需要多開輸出面，彼此共用 `lib/frameworks`：

- **CLI**：`npx reality-check` 在任何資料夾產出／續寫 `reality-check.md`，不需要 agent 也能用（自帶 model 呼叫）。適合放進專案的 bootstrap 腳本。
- **MCP server**：把 `getFramework`／`buildSystemPrompt`／`synthesize` 開成 tool，讓任何支援 MCP 的 agent 拿到「框架知識」而不必複製一份 markdown。知識更新即時生效，是 skill pack 的升級路線。
- **Web app（現況保留）**：需要多畫布比較、跨裝置、分享連結、版本歷史時才需要帳號與資料庫。它不該是入口，而是「這個點子我要認真做」之後才進來的那一層。

建議順序：Layer 1 與 1.5（已完成）→ 用 pipeline 實際跑完一個功能，看哪個階段的 markdown 開始出現重複 → 針對那部分做 Layer 2 → 再決定要 CLI 還是 MCP。

## 4. 不建議做的事：把這個 repo 當成 boilerplate

另一種「未來所有專案都能用」的解讀是把這份 repo 當 starter template（Next 16 + Supabase RLS + Drizzle + AI SDK + shadcn）。不建議，理由：

- 這套 stack 的版本半年就過期，維護一份 fork 的成本會超過重新 `create-next-app` 加裝的成本。
- 真正的可攜資產是知識與協議，不是 `middleware.ts` 與 `components/ui/*`。
- 如果確實想留 stack，該留的是**清單與決策理由**（一份 `docs/stack.md` 記下為什麼選 Drizzle、RLS policy 怎麼寫），而不是一份會腐化的程式碼骨架。

## 5. 與 grill-me 的關係

[grill-me](https://www.aihero.dev/my-grill-me-skill-has-gone-viral)（Matt Pocock）是一個約三行的 skill：「relentlessly 訪問我、走過決策樹的每一條分支、能查 codebase 就自己查、每題附上你建議的答案」。它極簡而通用，也因此和本專案是互補而非競爭：

| | grill-me | 創業真心話 |
|---|---|---|
| 知識來源 | 模型自己判斷該問什麼 | 人工整理的 10 格方法論（定義、好／壞範例、題庫、攻擊角度、所需證據） |
| 問題品質 | 隨模型與上下文浮動 | 每格題目固定，換模型仍然問得到單位經濟與 LTV／CAC |
| 覆蓋保證 | 無。模型沒想到的分支就不會問 | 有。10 格不填完不算完成，逼你面對想迴避的格子 |
| 角色 | 單一角色：追問者 | 三種角色：起草者、教練、魔鬼代言人，有推進順序 |
| 完成定義 | 「達成共識」，由雙方主觀判斷 | 狀態階梯 ○◐●★，升到 ★ 需要真實證據或驗證計畫 |
| 產出 | 對話本身（＋收尾摘要） | 結構化文件，逐格內容＋狀態＋還缺的證據，可 diff、可續做、可匯出 |
| 適用範圍 | 任何主題，包含非程式 | 商業模型（Layer 2 之後可擴到技術設計、PRD 等） |
| 體積 | 三行 | 一份框架知識庫（＋可選的 app） |

一句話：**grill-me 是通用的「問問題引擎」，創業真心話是特定領域的「該問哪些問題」**。前者的強項是零成本、任何情境都能用；後者的強項是不會漏、不會因為模型當天狀態不好就問淺了，而且結果留下的是文件不是聊天記錄。

grill-me 有兩個設計直接被抄進 `startup-reality-check` 與 `grill-to-converge`：

- **每題附上建議答案**，讓使用者只要回「對」就能前進，比開放式問句快得多。
- **能從 codebase 查到的就自己查**，只把「只有使用者知道的決定」留給他。

而 `grill-to-converge` 補上 grill-me 沒有的那一半：**固定的覆蓋清單**（`references/coverage.md` 的十個維度）、**停止條件**（未決清單清空、每個決定有紀錄、使用者確認摘要），以及**產出落地成檔案**而不是聊天記錄。這三件事讓訪談品質不再取決於模型當天的直覺。

實務上的搭配不再是「二選一」，而是同一條 pipeline 的不同階段：用 `startup-reality-check` 決定「這個事業值不值得做」，用 `grill-to-converge`（grill-me 的方法 + 覆蓋清單）決定「這個功能的每個細節怎麼定」，再往下走到規格、設計、實作、部署。
