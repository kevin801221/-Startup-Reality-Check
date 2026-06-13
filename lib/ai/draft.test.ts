import { describe, expect, test } from 'vitest'
import { MockLanguageModelV3 } from 'ai/test'
import { generateDrafts } from '@/lib/ai/draft'

function mockModel() {
  return new MockLanguageModelV3({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doGenerate: async (): Promise<any> => ({
      content: [{ type: 'text', text: '這是初稿內容。' }],
      finishReason: 'stop',
      usage: {
        inputTokens: { total: 5, noCache: 5, cacheRead: 0, cacheWrite: 0 },
        outputTokens: { total: 5, text: 5, reasoning: 0 },
      },
      warnings: [],
    }),
  })
}

describe('generateDrafts', () => {
  test('預設產生全 10 格、blockNo 1..10、皆有內容', async () => {
    const drafts = await generateDrafts({ oneLiner: '幫律所自動初審合約', model: mockModel() })
    expect(drafts).toHaveLength(10)
    expect(drafts.map((d) => d.blockNo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(drafts.every((d) => d.content === '這是初稿內容。')).toBe(true)
  })

  test('指定 blockNos 只產生對應格子，且依序排列', async () => {
    const drafts = await generateDrafts({
      oneLiner: 'x',
      blockNos: [5, 2, 9],
      model: mockModel(),
    })
    expect(drafts.map((d) => d.blockNo)).toEqual([2, 5, 9])
  })
})
