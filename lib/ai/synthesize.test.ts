import { describe, expect, test } from 'vitest'
import { MockLanguageModelV3 } from 'ai/test'
import { synthesizeContent } from '@/lib/ai/synthesize'

function mockModel(capture: { prompt?: unknown }) {
  return new MockLanguageModelV3({
    // 回傳型別標 any，避開 V3 型別在反變位置的嚴格比對；核心斷言不受影響。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doGenerate: async (options): Promise<any> => {
      capture.prompt = options.prompt
      return {
        content: [{ type: 'text', text: '在台北、5–20 人的 B2B SaaS 早期新創法務窗口。' }],
        finishReason: 'stop',
        usage: {
          inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 8, text: 8, reasoning: 0 },
        },
        warnings: [],
      }
    },
  })
}

describe('synthesizeContent', () => {
  test('把該格 synthesis system prompt 與對話餵給 model，回傳整理後文字', async () => {
    const capture: { prompt?: unknown } = {}
    const text = await synthesizeContent({
      blockNo: 2,
      currentContent: '所有中小企業',
      messages: [
        { role: 'user', content: '我的客戶是所有中小企業' },
        { role: 'assistant', content: '太廣了，這不是灘頭堡，給我具體數字。' },
      ],
      model: mockModel(capture),
    })

    expect(text).toBe('在台北、5–20 人的 B2B SaaS 早期新創法務窗口。')

    const prompt = capture.prompt as Array<{ role: string; content: unknown }>
    const system = prompt.find((m) => m.role === 'system')
    expect(JSON.stringify(system)).toContain('整理正式內容')
    // 目前內容應被帶進最後一則 user 訊息
    expect(JSON.stringify(prompt)).toContain('所有中小企業')
  })
})
