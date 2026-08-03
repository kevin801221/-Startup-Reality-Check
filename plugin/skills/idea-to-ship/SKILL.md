---
name: idea-to-ship
description: 從一段訪談逐字稿、會議紀錄或一句點子，一路做到上線：整理事實 → 追問收斂 → 開 spec → 用 Figma／Pencil MCP 設計介面 → 規劃前後端 → 切片實作 → 部署。Use when the user finishes a customer interview or meeting and wants it turned into shippable work, when they say 幫我整理需求, 開 spec, 從需求到上線, end-to-end, 自動化流程, idea to ship, or when they ask to run the whole pipeline instead of a single stage.
---

# Idea to Ship：從訪談到上線的一條流程

這是**協調者**。它自己不做細節，負責決定現在該進哪個階段、呼叫哪個 skill、把狀態寫回檔案，讓任何一個 coding agent（Cursor／Claude Code／Codex）接手都能從中斷處繼續。

每個階段的做法寫在各自的 skill 裡，用 Read 讀進來再執行，不要靠印象：

| # | 階段 | Skill | 產出 | 這階段要回答 |
|---|------|-------|------|--------------|
| 1 | 事實整理 | [meeting-to-facts](../meeting-to-facts/SKILL.md) | `docs/discovery/<date>-<slug>.md` | 對方到底說了什麼？哪些是事實、哪些是我們的推測？ |
| 2 | 商業壓測（選用） | [startup-reality-check](../startup-reality-check/SKILL.md) | `docs/reality-check.md` | 這件事值不值得做？客戶是誰、怎麼賺錢？ |
| 3 | 追問收斂 | [grill-to-converge](../grill-to-converge/SKILL.md) | 更新 discovery 的決定與未決清單 | 還有哪些沒決定？一題一題問到清空。 |
| 4 | 寫規格 | [spec-writer](../spec-writer/SKILL.md) | `docs/specs/<date>-<slug>.md` | 要做什麼、不做什麼、怎麼算做完？ |
| 5 | 介面設計 | [design-ui](../design-ui/SKILL.md) | `docs/design/<slug>.md` + 設計檔 | 每個畫面長什麼樣？用哪些既有元件？ |
| 6 | 前後端規劃 | [implementation-plan](../implementation-plan/SKILL.md) | `docs/plans/<date>-<slug>.md` | 資料模型、API、元件樹、任務切片順序？ |
| 7 | 切片實作 | [build-slices](../build-slices/SKILL.md) | 程式碼 + commits | 每一片都會動、有測試、可獨立驗收。 |
| 8 | 上線 | [ship-it](../ship-it/SKILL.md) | `docs/ship/<date>-<slug>.md` | preflight 過了嗎？部署到哪、怎麼回滾？ |

階段 2 只在「這是一個新事業／新產品方向」時做；如果是既有產品要加功能，跳過它。

## 狀態檔（單一事實來源）

整條流程的狀態放在 `docs/pipeline/<slug>.md`，範本見 `templates/pipeline.md`。**每個階段結束時更新它**，不要留在腦子裡。

開場先做這件事：

1. 找 `docs/pipeline/*.md`。有進行中的（`stage` 不是 `shipped`）就問使用者是要續做還是開新的。
2. 沒有就建一份，`slug` 用 kebab-case 的功能名，`mode` 依下節決定。
3. 每次交棒（階段完成、被中斷、要換 agent）都先把狀態檔寫好再停。

狀態檔就是交接文件。任何 agent 讀完它，加上裡面連到的產出檔，就該知道下一步做什麼，不需要看對話紀錄。

## 兩種模式

`mode: gated`（預設）— 每個階段結束後停下來，用一段話回報產出與下一階段要做什麼，等使用者說繼續。

`mode: auto` — 使用者明確說「全部跑完」「不要停」「一路做到部署」時用。不再逐階段確認，但遇到下面任何一種**硬停點**必須停下來問：

- **只有人能決定的事**：定價、法遵與隱私邊界、品牌與命名、對外承諾的時程、要不要付費開通第三方服務。
- **花錢或不可逆的動作**：production 部署、對 production 資料庫跑 migration、刪除資料、發信給真實使用者、任何會產生費用的 API 大量呼叫。
- **缺少憑證或環境**：少 API key、少 `.env` 變數、Pencil 桌面 app 沒開、Figma MCP 沒連上。
- **事實不足**：某個需求在 discovery 裡找不到來源，而你只能靠猜。猜出來的需求會一路錯到部署。

停下來時講清楚三件事：卡在哪、你建議的答案、使用者回覆後你會怎麼繼續。**不要為了「跑完」而編造答案**，這是這條 pipeline 最容易毀掉的地方。

## 執行規則

- **一次一個階段。** 做完寫檔、更新狀態、才進下一個。不要一口氣寫完 spec 又開始改程式碼。
- **不要跳階段。** 沒有 spec 就不設計，沒有 plan 就不寫實作程式碼。使用者要求跳過時照做，但在狀態檔記下「stage 4 skipped by user」。
- **可追溯。** spec 的每一條需求都要能指回 discovery 的某一句話或某個決定。指不回去的，標記為假設並列進未決清單。
- **每階段的產出都進 git。** 一個階段一個 commit，訊息寫 `docs(discovery): ...`、`docs(spec): ...` 這種形式，讓進度在 git log 上看得出來。
- **產出用檔案而不是聊天。** 使用者關掉視窗後還在的東西才算成果。

## 起點判斷

使用者手上的東西決定從哪裡進：

- 逐字稿／會議筆記／一堆零散訊息 → 階段 1。
- 一句話點子、還沒跟任何人談過 → 階段 2（先確認值不值得做），再回階段 3。
- 已經知道要做什麼，只是沒寫下來 → 階段 3，用追問把它擠成規格。
- 已經有 spec → 階段 5。
- 已經有設計稿 → 階段 6。

判斷完直接告訴使用者你要從哪個階段開始、為什麼，然後開始。不要問「你想從哪裡開始」——你有資訊，自己判斷。
