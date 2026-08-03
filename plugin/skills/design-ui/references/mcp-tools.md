# 設計通道的實務注意事項

工具名稱與可用性會隨版本改變。**先確認當前 session 真的有哪些工具**（列出可用工具或試著讀取一次），不要照記憶呼叫。

## Figma MCP

常見工具：`get_design_context`（從 Figma 讀設計）、`use_figma`（在 Figma 執行 JS 做寫入）、`create_new_file`（開新檔）、`generate_diagram`（畫流程圖到 FigJam）。

- **官方 Figma 外掛自帶的 skills 是強制前置。** 如果環境裡有 `figma-design-to-code`、`figma-use`、`figma-create-new-file`、`figma-generate-design` 這些 skill，**在呼叫對應工具之前必須先把它們讀完**——那些 skill 自己聲明是 mandatory prerequisite，跳過會踩掉一整串已知地雷。
- 方向要分清楚：從 Figma 產生程式碼走 design-to-code；從程式碼／spec 產生 Figma 畫面走 generate-design。這一階段通常是後者。
- 寫入前先搜尋既有的 design system library、variables、Code Connect 檔，用既有元件與 token 組裝，不要硬寫顏色與間距。
- 一次做一個 section，做完檢查一次再繼續。大批量一次寫入很難回溯哪一步壞掉。
- 記下 file key 與 node id 放進對照表，之後實作時才能用 `get_design_context` 精準拉那個節點。

## Pencil MCP（`.pen`）

Pencil（pen.dev）的 MCP server 通常叫 `pencil`，工具包含 `execute`（insert／update／delete／move／copy／replace，以及用 `Get` 讀節點階層與 `ctx.bounds`／`ctx.problems` 檢查佈局問題）、`batch_design`、`get_app_state`、匯出。

已知地雷（踩到很難查，先記住）：

- **絕對不要直接寫 `.pen` 的 JSON。** 一定透過 MCP 工具操作，手寫 JSON 會得到空白畫布。
- **顏色只用 hex（`#RRGGBB`）。** 用 OKLCH 會渲染成看不見。
- **桌面 app（或 IDE extension）必須在跑**，MCP 才連得上。沒開就停下來請使用者開，不要自己亂試。
- **新建的檔案要使用者先手動存檔（Cmd+S）**，MCP 才吃得到；新檔沒存過時匯出會失敗。
- 檔案路徑用相對路徑，操作 timeout 放寬一點（大批次容易超時）。
- 多個 `.pen` 檔開著時，明確帶 `filePath` 或用 batch 模式，否則可能改到別的檔。
- 完全 headless 的情境（CI、雲端 agent）可以用 `pen` CLI 的 agent 模式（`--in` / `--out` / `--prompt` / `--export`），不需要 GUI。

## 專案既有設計系統

沒有設計工具、或設計工具只是輔助時，這一條其實最實用：

- 讀 `components/ui/*`、`app/globals.css`、Tailwind theme、`components.json`，把可用的元件、色票、字級、圓角、間距列成清單。
- 有 Code Connect 檔（`*.figma.ts`）就照它的 mapping 走，那是設計與程式碼的正式對照表。
- 缺元件時，照既有元件的 API 風格新增（同樣的 variant 命名、同樣的 props 慣例），不要引入第二套風格。

## 無工具的最後手段

用 Markdown 或註解寫 wireframe（區塊、層級、狀態），或直接寫可跑的頁面骨架。重點是**留下可被實作的結構**，不要停在「等有設計稿再說」。
