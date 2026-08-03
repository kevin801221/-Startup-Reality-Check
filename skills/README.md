# Skill pack：把創業真心話帶到任何專案

`startup-reality-check/` 是這個 app 的方法論知識（`lib/canvas-framework.ts`）編譯出來的 agent skill。它讓你在**還沒有這個 web app、還沒有資料庫、專案第一天只有一個空資料夾**的情況下，就能在 Cursor / Claude Code / Codex 裡跑同一套三階段壓力測試。

產物由 `pnpm skill:build` 生成，請不要手改 `startup-reality-check/` 裡的檔案；要改內容請改 `lib/canvas-framework.ts` 或 `lib/skill/build.ts`，再重新 build。`pnpm test` 會擋住產物與原始碼不同步的情況。

## 安裝

**個人全域（推薦，所有專案通用）**

```bash
# Cursor 與 Claude Code 都會讀 ~/.agents/skills
mkdir -p ~/.agents/skills
ln -s "$(pwd)/skills/startup-reality-check" ~/.agents/skills/startup-reality-check
```

用 symlink 的好處：這個 repo 更新框架知識後，所有專案下次啟動就吃到新版。不想連動就改成 `cp -R`。

**單一專案（想跟團隊一起共用時 commit 進去）**

```bash
mkdir -p .cursor/skills
cp -R /path/to/this-repo/skills/startup-reality-check .cursor/skills/
```

Cursor 掃 `.cursor/skills/`、`.agents/skills/` 以及對應的 `~/` 版本，另外也相容 `.claude/skills/` 與 `.codex/skills/`；Claude Code 用 `.claude/skills/` 或 `~/.claude/skills/`。挑一個放，不要重複放同一個 skill。

## 使用

在新專案裡直接說：

```text
/startup-reality-check
```

或講出觸發語，例如「幫我壓力測試這個點子」「用灘頭堡市場的角度挑戰我」「不要說好聽話，grill 我的商業模型」。

agent 會把訪談成果寫進該專案的 `reality-check.md`（有 `docs/` 就放 `docs/reality-check.md`），所以結論跟著專案走、進 git、之後還能繼續往下做。

## 檔案

```text
startup-reality-check/
  SKILL.md                    # 訪談協議：三種模式、流程、狀態晉級門檻、鐵則
  references/canvas.md        # 10 格完整方法論（定義、好壞範例、追問題庫、攻擊角度、所需證據）
  templates/reality-check.md  # 工作檔案範本
```
