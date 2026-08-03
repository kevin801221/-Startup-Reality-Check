---
name: design-ui
description: 依規格的畫面清單設計介面，優先接 Figma MCP、Pencil（.pen）MCP 或既有設計系統，沒有設計工具時退回用專案現有元件做可跑的 UI 骨架，並產出畫面到元件的對照表。Use when the user wants screens designed from a spec, mentions Figma MCP, Pencil, .pen, 設計介面, 畫 UI, wireframe, mockup, design system, or as stage 5 of the idea-to-ship pipeline.
---

# 介面設計

把 spec 的畫面清單變成**可以照著實作的設計**，而且盡量用專案已經有的元件與 token，不要每次都重畫一套。

輸出到 `docs/design/<slug>.md`（畫面 → 設計檔位置 → 用到的元件與 token 的對照表），範本見 `templates/design.md`。設計檔本身留在設計工具裡。

## 步驟

1. **讀 spec 的畫面清單。** 沒有 spec 就先回 [spec-writer](../spec-writer/SKILL.md)。清單裡的每個畫面、每個狀態（空／載入／錯誤／無權限）都要有對應處理，不能只做 happy path。
2. **偵測可用的設計通道**，照這個順序：
   - Figma MCP（工具如 `get_design_context`、`use_figma`、`create_new_file`）
   - Pencil MCP（server 名稱通常是 `pencil`；專案裡有 `.pen` 檔就是它）
   - 專案既有設計系統（`components/ui/*`、Tailwind theme、Code Connect 檔）
   - 都沒有 → 走「無設計工具」路線
   每個通道的實務注意事項與踩雷點在 `references/mcp-tools.md`，**動手前先讀對應那一節**。
3. **盤點既有資產。** 先找專案裡已經有的按鈕、輸入框、卡片、色票、字級、間距。新畫面優先組合既有元件；真的缺才新增，並在對照表標記「新元件」。
4. **逐畫面設計，一個一個來。** 每個畫面完成後就寫進對照表，不要全部做完才記錄——中途被打斷會全部白費。
5. **文案用 spec 的名詞表。** 按鈕與標題用使用者的詞彙，不要自己另創一套。
6. **標註可實作的細節**：哪些是元件、哪些是狀態、哪些是資料綁定（對應 spec 的哪個欄位或 API 回應）。設計稿漂亮但無法對應資料，實作時會全部重來。

## 無設計工具時怎麼做

不要卡住。用專案既有的元件庫直接寫出**可跑的 UI 骨架**（真元件、真路由、假資料），把它當設計稿：使用者在瀏覽器點得到，比看靜態圖更早發現問題。做完在對照表註明「以程式碼作為設計來源」，並附上路由與檔案路徑。

## 鐵則

- **不要憑空發明設計系統。** 先找 `components/`、Tailwind config、既有頁面的慣例。
- **四個狀態不是選配。** 空／載入／錯誤／無權限至少要決定「要不要做」，決定不做也要寫下來。
- **不要在設計階段偷偷改需求。** 設計時發現 spec 有洞（少了某個入口、某個狀態沒定義）是常態：回頭更新 spec 並在 pipeline 狀態檔記一筆，不要只在設計裡默默補上。
- **不要對設計工具做破壞性操作。** 覆蓋既有 frame、刪除別人的圖層、改共用元件之前先問。
- **設計檔要能被找到。** 對照表裡放檔案路徑、node id 或連結。找不到的設計等於不存在。

## 收尾

回報：做了幾個畫面、其中幾個完全用既有元件、新增了哪些元件、以及設計過程中發現 spec 的哪些洞（有洞就一定要講）。

接著進 [implementation-plan](../implementation-plan/SKILL.md)。整條流程見 [idea-to-ship](../idea-to-ship/SKILL.md)。
