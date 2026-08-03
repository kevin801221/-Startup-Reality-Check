import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const PLUGIN_DIR = join(process.cwd(), 'plugin')
const SKILLS_DIR = join(PLUGIN_DIR, 'skills')

const skillNames = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

type Skill = {
  name: string
  dir: string
  file: string
  body: string
  frontmatter: Record<string, string>
}

function readSkill(name: string): Skill {
  const dir = join(SKILLS_DIR, name)
  const file = join(dir, 'SKILL.md')
  const raw = readFileSync(file, 'utf8')
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw)
  if (!match) throw new Error(`${name}/SKILL.md 缺少 frontmatter`)

  const frontmatter: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const kv = /^([a-z-]+):\s*(.*)$/.exec(line)
    if (kv) frontmatter[kv[1]] = kv[2]
  }
  return { name, dir, file, body: match[2], frontmatter }
}

const skills = skillNames.map(readSkill)

/** SKILL.md 內文引用的相對 markdown 連結。 */
function relativeLinks(body: string): string[] {
  return [...body.matchAll(/\]\((\.[^)]+)\)/g)].map((m) => m[1])
}

/** 內文以反引號提到的、看起來像 skill pack 內部檔案的路徑。 */
function backtickedPackPaths(body: string): string[] {
  return [...body.matchAll(/`((?:references|templates)\/[\w./-]+)`/g)].map((m) => m[1])
}

describe('plugin skills', () => {
  it('至少包含整條 pipeline 的每個階段', () => {
    expect(skillNames).toEqual([
      'build-slices',
      'design-ui',
      'grill-to-converge',
      'idea-to-ship',
      'implementation-plan',
      'meeting-to-facts',
      'ship-it',
      'spec-writer',
      'startup-reality-check',
    ])
  })

  it.each(skillNames)('%s 的 frontmatter 可被 agent 發現', (name) => {
    const skill = skills.find((s) => s.name === name)!

    expect(skill.frontmatter.name, 'name 必須與資料夾同名').toBe(name)
    expect(name, 'skill 名稱只能用小寫與連字號').toMatch(/^[a-z][a-z0-9-]*$/)

    const description = skill.frontmatter.description ?? ''
    expect(description.length, 'description 不可為空').toBeGreaterThan(40)
    expect(description.length, 'description 過長，agent 端會被截斷').toBeLessThanOrEqual(1024)
  })

  it.each(skillNames)('%s 引用的檔案都存在', (name) => {
    const skill = skills.find((s) => s.name === name)!

    for (const link of relativeLinks(skill.body)) {
      const target = resolve(dirname(skill.file), link)
      expect(existsSync(target), `${name} 連到不存在的 ${link}`).toBe(true)
    }

    for (const packPath of backtickedPackPaths(skill.body)) {
      expect(existsSync(join(skill.dir, packPath)), `${name} 提到不存在的 ${packPath}`).toBe(true)
    }
  })

  it('每個階段都連回協調者，協調者也連到每個階段', () => {
    const orchestrator = skills.find((s) => s.name === 'idea-to-ship')!
    const stages = skillNames.filter((n) => n !== 'idea-to-ship')

    for (const stage of stages) {
      expect(orchestrator.body, `協調者沒有連到 ${stage}`).toContain(`../${stage}/SKILL.md`)
    }

    for (const skill of skills) {
      if (skill.name === 'idea-to-ship') continue
      expect(skill.body, `${skill.name} 沒有連回 idea-to-ship`).toContain(
        '../idea-to-ship/SKILL.md',
      )
    }
  })
})

describe('plugin manifests', () => {
  const claude = JSON.parse(
    readFileSync(join(PLUGIN_DIR, '.claude-plugin/plugin.json'), 'utf8'),
  )
  const cursor = JSON.parse(
    readFileSync(join(PLUGIN_DIR, '.cursor-plugin/plugin.json'), 'utf8'),
  )
  const marketplace = JSON.parse(
    readFileSync(join(process.cwd(), '.claude-plugin/marketplace.json'), 'utf8'),
  )

  it('兩個 agent 的 manifest 名稱與版本一致', () => {
    expect(claude.name).toBe('idea-to-ship')
    expect(cursor.name).toBe(claude.name)
    expect(cursor.version).toBe(claude.version)
  })

  it('cursor manifest 的 skills 路徑存在', () => {
    expect(existsSync(join(PLUGIN_DIR, cursor.skills))).toBe(true)
  })

  it('marketplace 指向這個 plugin 且版本對得上', () => {
    const entry = marketplace.plugins.find(
      (p: { name: string }) => p.name === 'idea-to-ship',
    )
    expect(entry, 'marketplace 沒有列出 idea-to-ship').toBeDefined()
    expect(existsSync(resolve(process.cwd(), entry.source))).toBe(true)
    expect(entry.version).toBe(claude.version)
  })
})
