import { describe, expect, test } from 'vitest'
import { CANVAS, type BlockSpec } from '@/lib/canvas-framework'

describe('canvas-framework', () => {
  test('剛好 10 格，no 從 1 到 10 連續', () => {
    expect(CANVAS).toHaveLength(10)
    expect(CANVAS.map((b) => b.no)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  test('key 全部唯一', () => {
    const keys = CANVAS.map((b) => b.key)
    expect(new Set(keys).size).toBe(10)
  })

  test('每一格的文字欄位都非空、陣列欄位至少 3 筆', () => {
    const textFields: (keyof BlockSpec)[] = [
      'key', 'title', 'subtitle', 'question', 'definition', 'goodExample', 'badExample',
    ]
    const arrayFields: (keyof BlockSpec)[] = ['coachQuestions', 'devilAngles', 'evidenceNeeded']
    for (const block of CANVAS) {
      for (const f of textFields) {
        expect(typeof block[f], `第 ${block.no} 格的 ${String(f)}`).toBe('string')
        expect((block[f] as string).length, `第 ${block.no} 格的 ${String(f)}`).toBeGreaterThan(0)
      }
      for (const f of arrayFields) {
        expect(Array.isArray(block[f]), `第 ${block.no} 格的 ${String(f)}`).toBe(true)
        expect((block[f] as string[]).length, `第 ${block.no} 格的 ${String(f)}`).toBeGreaterThanOrEqual(3)
        for (const item of block[f] as string[]) {
          expect(item.length).toBeGreaterThan(0)
        }
      }
    }
  })
})
