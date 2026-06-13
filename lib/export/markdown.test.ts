import { describe, expect, test } from 'vitest'
import { canvasToMarkdown } from '@/lib/export/markdown'

describe('canvasToMarkdown', () => {
  test('含標題、一句話總述、10 格標題', () => {
    const md = canvasToMarkdown({
      title: '法律 AI 助手',
      oneLiner: '幫中小律所把合約初審自動化',
      blocks: [
        { blockNo: 2, content: '台北 5–20 人 B2B SaaS 法務窗口', status: 'refined' },
      ],
    })
    expect(md).toContain('# 法律 AI 助手')
    expect(md).toContain('> 幫中小律所把合約初審自動化')
    // 10 格各有一個二級標題
    expect(md.match(/^## /gm)?.length).toBe(10)
    // 已填的第 2 格內容出現
    expect(md).toContain('台北 5–20 人 B2B SaaS 法務窗口')
    // 第 2 格狀態為已深化
    expect(md).toContain('你的客戶是誰（灘頭堡市場） ● 已深化')
  })

  test('缺內容的格子標記「（尚未填寫）」', () => {
    const md = canvasToMarkdown({ title: 'X', blocks: [] })
    expect(md).toContain('（尚未填寫）')
    // 沒 oneLiner 時不應有引言行
    expect(md).not.toContain('> ')
  })

  test('結尾以單一換行收束', () => {
    const md = canvasToMarkdown({ title: 'X', blocks: [] })
    expect(md.endsWith('\n')).toBe(true)
    expect(md.endsWith('\n\n')).toBe(false)
  })
})
