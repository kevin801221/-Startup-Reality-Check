import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CANVAS } from '@/lib/canvas-framework'
import {
  buildSkillPack,
  renderCanvasReference,
  renderCanvasTemplate,
  renderSkillMd,
} from '@/lib/skill/build'

const PACK_DIR = join(process.cwd(), 'plugin/skills/startup-reality-check')

describe('renderSkillMd', () => {
  const md = renderSkillMd()

  it('帶有可被 agent 觸發的 frontmatter', () => {
    expect(md.startsWith('---\nname: startup-reality-check\n')).toBe(true)
    expect(md).toMatch(/^description: .+/m)
  })

  it('把方法論細節留在 reference，不重複貼進協議', () => {
    expect(md).toContain('references/canvas.md')
    for (const block of CANVAS) {
      expect(md).not.toContain(block.definition)
    }
  })

  it('保留三階段與狀態晉級的證據門檻', () => {
    for (const stage of ['起草', '教練', '魔鬼代言人']) {
      expect(md).toContain(stage)
    }
    expect(md).toContain('○ 空 → ◐ 草稿 → ● 已深化 → ★ 已挑戰')
    expect(md).toContain('沒有證據就不能升到 ★')
  })
})

describe('renderCanvasReference', () => {
  const md = renderCanvasReference()

  it('十格的知識都完整帶進去', () => {
    for (const block of CANVAS) {
      expect(md).toContain(`${block.title}（${block.subtitle}）`)
      expect(md).toContain(block.question)
      expect(md).toContain(block.definition)
      expect(md).toContain(block.goodExample)
      expect(md).toContain(block.badExample)
      for (const line of [
        ...block.coachQuestions,
        ...block.devilAngles,
        ...block.evidenceNeeded,
      ]) {
        expect(md).toContain(`- ${line}`)
      }
    }
  })

  it('每格一個 h2', () => {
    expect(md.match(/^## /gm)).toHaveLength(CANVAS.length)
  })
})

describe('renderCanvasTemplate', () => {
  it('每格預設為空狀態且標出缺少的證據', () => {
    const md = renderCanvasTemplate()
    expect(md.match(/^## /gm)).toHaveLength(CANVAS.length)
    expect(md.match(/○ 空/g)).toHaveLength(CANVAS.length + 1)
    expect(md).toContain('**還缺的證據**')
  })
})

describe('committed skill pack', () => {
  it('與 lib/canvas-framework.ts 同步（不同步時跑 pnpm skill:build）', async () => {
    for (const file of buildSkillPack()) {
      const onDisk = await readFile(join(PACK_DIR, file.path), 'utf8')
      expect(onDisk, `${file.path} 已過期`).toBe(file.content)
    }
  })
})
