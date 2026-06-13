import { describe, expect, test } from 'vitest'
import { MockLanguageModelV3 } from 'ai/test'
import { simulateReadableStream } from 'ai'
import { streamChat } from '@/lib/ai/chat'

function mockModel(capture: { prompt?: unknown }) {
  return new MockLanguageModelV3({
    // 回傳型別標成 any，避開 V3 stream part 在 PromiseLike 反變位置的嚴格比對；
    // 核心斷言（capture.prompt 含 system 文字、可消費串流）不受影響。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doStream: async (options): Promise<any> => {
      capture.prompt = options.prompt
      return {
        stream: simulateReadableStream({
          chunks: [
            { type: 'text-start', id: '0' },
            { type: 'text-delta', id: '0', delta: '已收到，' },
            { type: 'text-delta', id: '0', delta: '這是回應。' },
            { type: 'text-end', id: '0' },
            {
              type: 'finish',
              finishReason: 'stop' as const,
              usage: {
                inputTokens: { total: 5, noCache: 5, cacheRead: 0, cacheWrite: 0 },
                outputTokens: { total: 5, text: 5, reasoning: 0 },
              },
            },
          ],
        }),
      }
    },
  })
}

describe('streamChat', () => {
  test('把對應格＋階段的 system prompt 傳給 model，並可消費串流文字', async () => {
    const capture: { prompt?: unknown } = {}
    const result = streamChat({
      blockNo: 2,
      stage: 'devil',
      messages: [{ role: 'user', content: '我的客戶是所有中小企業。' }],
      model: mockModel(capture),
    })

    const text = await result.text
    expect(text).toBe('已收到，這是回應。')

    // model 收到的 prompt 第一則應是含該格知識的 system 訊息
    const prompt = capture.prompt as Array<{ role: string; content: unknown }>
    const system = prompt.find((m) => m.role === 'system')
    expect(JSON.stringify(system)).toContain('灘頭堡市場')
    expect(JSON.stringify(system)).toContain('投資人')
  })
})
