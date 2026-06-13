import { describe, expect, test } from 'vitest'
import { buildSystemPrompt } from '@/lib/ai/prompts'

describe('buildSystemPrompt', () => {
  test('共用區塊帶入該格的 title、question、definition、好壞範例', () => {
    const p = buildSystemPrompt(2, 'coach')
    expect(p).toContain('你的客戶是誰')
    expect(p).toContain('灘頭堡市場')
    expect(p).toContain('你最早要服務、而且最有機會贏的那一小群具體的人是誰？')
    expect(p).toContain('所有需要法律服務的中小企業') // badExample
  })

  test('draft 階段帶入起草指示', () => {
    const p = buildSystemPrompt(1, 'draft')
    expect(p).toContain('初稿')
    expect(p).not.toContain('蘇格拉底')
  })

  test('coach 階段帶入蘇格拉底式追問指示', () => {
    const p = buildSystemPrompt(1, 'coach')
    expect(p).toContain('蘇格拉底')
  })

  test('devil 階段帶入魔鬼代言人指示與該格所需證據', () => {
    const p = buildSystemPrompt(2, 'devil')
    expect(p).toContain('投資人')
    expect(p).toContain('已訪談人數') // evidenceNeeded
  })

  test('無效格號丟錯', () => {
    expect(() => buildSystemPrompt(99, 'coach')).toThrow()
  })

  test('三個階段的輸出各自穩定（snapshot）', () => {
    expect(buildSystemPrompt(2, 'draft')).toMatchSnapshot()
    expect(buildSystemPrompt(2, 'coach')).toMatchSnapshot()
    expect(buildSystemPrompt(2, 'devil')).toMatchSnapshot()
  })
})
