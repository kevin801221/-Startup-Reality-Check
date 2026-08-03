# Idea to Ship｜給所有 coding agent 的一條流程

一個 agent plugin：把**一場訪談或一次會議**變成**上線的功能**。從整理事實、追問收斂、開規格，到接 Figma／Pencil MCP 設計介面、規劃前後端、切片實作、部署，全部在同一條流程上，狀態寫在檔案裡，所以中途換 agent、換工具、關掉視窗都能接著做。

方法上結合兩件事：

- **grill-me 式的追問**（一次一題、每題附建議答案、能從 repo 查到的就自己查）——負責把模糊講成具體。
- **固定的覆蓋清單與框架知識**（`grill-to-converge/references/coverage.md`、MIT 紀律創業畫布的 10 格）——負責讓「模型今天沒想到」的維度不會漏。

## 八個階段

| # | 階段 | Skill | 產出 |
|---|------|-------|------|
| 1 | 事實整理 | `meeting-to-facts` | `docs/discovery/<date>-<slug>.md` |
| 2 | 商業壓測（選用） | `startup-reality-check` | `docs/reality-check.md` |
| 3 | 追問收斂 | `grill-to-converge` | 更新 discovery 的決定與未決清單 |
| 4 | 寫規格 | `spec-writer` | `docs/specs/<date>-<slug>.md` |
| 5 | 介面設計 | `design-ui` | `docs/design/<slug>.md` + 設計檔 |
| 6 | 前後端規劃 | `implementation-plan` | `docs/plans/<date>-<slug>.md` |
| 7 | 切片實作 | `build-slices` | 程式碼 + commits |
| 8 | 上線 | `ship-it` | `docs/ship/<date>-<slug>.md` |

`idea-to-ship` 是協調者：決定從哪個階段進、呼叫哪個 skill、把進度寫回 `docs/pipeline/<slug>.md`。

## 安裝

**個人全域（所有專案通用，推薦）**

```bash
scripts/install-skills.sh            # → ~/.agents/skills（Cursor / Codex 讀得到）
scripts/install-skills.sh claude     # → ~/.claude/skills（Claude Code）
scripts/install-skills.sh agents claude cursor codex   # 全都裝
scripts/install-skills.sh --copy ./.cursor/skills      # 複製進某個專案並進版控
```

預設用 symlink，這個 repo 更新知識後所有專案下次啟動就吃到新版；不想連動就加 `--copy`。

**當成 Claude Code plugin**

```bash
/plugin marketplace add kevin801221/-Startup-Reality-Check
/plugin install idea-to-ship@kevin-idea-to-ship
```

本機測試：`claude --plugin-dir ./plugin`。

**當成 Cursor plugin**

`plugin/.cursor-plugin/plugin.json` 已備好；也可以直接把 `plugin/skills/*` 放進 `.cursor/skills/`（上面的 `--copy` 用法）。

## 使用

```text
/idea-to-ship
這是今天跟客戶的逐字稿，幫我一路做到可以部署。
```

或只跑單一階段：`/meeting-to-facts`、`/grill-to-converge`、`/spec-writer`、`/design-ui`、`/implementation-plan`、`/build-slices`、`/ship-it`。

想一路跑完不要每階段停，就說「全部跑完不要停」，協調者會切到 `mode: auto`。**auto 模式仍然會在四種硬停點停下來**：只有人能做的決定（定價、法遵、品牌、對外承諾）、花錢或不可逆的動作（production 部署與 migration、寄信給真實使用者）、缺憑證或環境（少 API key、Pencil app 沒開、Figma MCP 沒連）、以及事實不足只能靠猜的時候。這是刻意的：能被自動化的是流程，不是責任。

## 設計工具

`design-ui` 會照這個順序找通道：Figma MCP → Pencil（`.pen`）MCP → 專案既有設計系統 → 沒有工具就用既有元件寫可跑的 UI 骨架當設計稿。各通道的踩雷點（Pencil 只能用 hex、不能直接寫 `.pen` JSON、桌面 app 要開、新檔要手動存；Figma 官方 skills 是強制前置）寫在 `design-ui/references/mcp-tools.md`。

## 目錄

```text
plugin/
  .claude-plugin/plugin.json   # Claude Code plugin manifest
  .cursor-plugin/plugin.json   # Cursor plugin manifest
  skills/
    idea-to-ship/              # 協調者 + pipeline 狀態範本
    meeting-to-facts/
    grill-to-converge/         # grill-me 姿態 + 覆蓋清單
    startup-reality-check/     # 由 pnpm skill:build 從 lib/canvas-framework.ts 產生
    spec-writer/
    design-ui/
    implementation-plan/
    build-slices/
    ship-it/
```

`startup-reality-check/` 是**產生**的，不要手改；要改 10 格的知識請改 `lib/canvas-framework.ts` 或 `lib/skill/build.ts`，再跑 `pnpm skill:build`。其他 skill 直接編輯即可。`pnpm test` 會驗證每個 skill 的 frontmatter、名稱與資料夾一致、跨 skill 連結是否指向存在的檔案，以及產生的檔案有沒有過期。
