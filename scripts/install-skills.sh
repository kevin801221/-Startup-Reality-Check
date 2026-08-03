#!/usr/bin/env bash
# 把 plugin/skills 裡的 skills 安裝到 coding agent 讀得到的位置。
# 預設對每個 skill 建 symlink，這個 repo 更新後所有專案自動吃到新版。
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/plugin/skills"

MODE="link"
TARGETS=()

usage() {
  cat <<'EOF'
用法：scripts/install-skills.sh [--copy] [target ...]

target（可給多個，預設 agents）：
  agents   ~/.agents/skills     跨工具的個人 skills（Cursor 與 Codex 都會讀）
  claude   ~/.claude/skills      Claude Code 個人 skills
  cursor   ~/.cursor/skills      Cursor 個人 skills
  codex    ~/.codex/skills       Codex 個人 skills
  ./path   任意目錄，例如某個專案的 .cursor/skills

選項：
  --copy   用複製取代 symlink（不想跟這個 repo 連動時用）
  -h       顯示說明

範例：
  scripts/install-skills.sh                      # 安裝到 ~/.agents/skills
  scripts/install-skills.sh claude cursor        # 同時安裝到兩個位置
  scripts/install-skills.sh --copy ./.cursor/skills
EOF
}

for arg in "$@"; do
  case "$arg" in
    --copy) MODE="copy" ;;
    -h|--help) usage; exit 0 ;;
    agents) TARGETS+=("$HOME/.agents/skills") ;;
    claude) TARGETS+=("$HOME/.claude/skills") ;;
    cursor) TARGETS+=("$HOME/.cursor/skills") ;;
    codex) TARGETS+=("$HOME/.codex/skills") ;;
    -*) echo "未知選項：$arg" >&2; usage >&2; exit 2 ;;
    *) TARGETS+=("$arg") ;;
  esac
done

if [ ${#TARGETS[@]} -eq 0 ]; then
  TARGETS=("$HOME/.agents/skills")
fi

if [ ! -d "$SRC_DIR" ]; then
  echo "找不到 $SRC_DIR" >&2
  exit 1
fi

for target in "${TARGETS[@]}"; do
  mkdir -p "$target"
  for skill_dir in "$SRC_DIR"/*/; do
    name="$(basename "$skill_dir")"
    dest="$target/$name"
    if [ -e "$dest" ] || [ -L "$dest" ]; then
      rm -rf "$dest"
    fi
    if [ "$MODE" = "copy" ]; then
      cp -R "${skill_dir%/}" "$dest"
    else
      ln -s "${skill_dir%/}" "$dest"
    fi
    echo "$MODE  $dest"
  done
done

echo
echo "重啟 agent（或開新 session）後，用 /idea-to-ship 開始整條流程。"
