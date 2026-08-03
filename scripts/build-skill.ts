/**
 * 把 lib/canvas-framework.ts 的方法論知識編譯成可攜的 agent skill pack。
 * 產物 skills/startup-reality-check/ 可以直接複製或 symlink 到任何專案的
 * .claude/skills/ 或 ~/.claude/skills/ 使用，不需要跑這個 web app。
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'

import { buildSkillPack } from '@/lib/skill/build'

export const SKILL_PACK_DIR = 'skills/startup-reality-check'

async function main() {
  const root = resolve(import.meta.dirname, '..')
  const outDir = join(root, SKILL_PACK_DIR)

  for (const file of buildSkillPack()) {
    const target = join(outDir, file.path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, file.content, 'utf8')
    console.log(`written ${relative(root, target)}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
