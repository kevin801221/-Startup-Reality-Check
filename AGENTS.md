## Superpowers System

<EXTREMELY_IMPORTANT>
You have superpowers. Superpowers teach you new skills and capabilities. RIGHT NOW run: `~/.codex/superpowers/.codex/superpowers-codex bootstrap` and follow the instructions it returns.
</EXTREMELY_IMPORTANT>

## GitHub Account Rules

This machine uses SSH host aliases to choose the GitHub account. Do not assume GitHub push access should use HTTPS credentials or `GITHUB_TOKEN`.

- Personal GitHub account: `kevin801221`
  - SSH host alias: `github-personal`
  - Use remotes like: `git@github-personal:kevin801221/<repo>.git`
  - Use this for repos under `github.com/kevin801221/*`.
- Work GitHub account: `KevinLegalAI`
  - Default SSH host: `github.com`
  - Use remotes like: `git@github.com:<org-or-user>/<repo>.git`
  - Use this for work/company repos.

Before pushing to GitHub:

1. Run `git remote -v` and confirm the remote host matches the intended account.
2. For personal repos under `kevin801221`, prefer `git@github-personal:kevin801221/<repo>.git`.
3. If an HTTPS push fails as `KevinLegalAI` for a personal repo, switch the remote to the `github-personal` SSH alias instead of asking for a GitHub token.
4. Stage explicit files only when the working tree contains unrelated changes.
