import { describe, expect, test } from 'vitest'
import { buildInitialBlocks, statusAfterStage } from '@/lib/db/blocks'

describe('statusAfterStage', () => {
  test('draft → draft', () => {
    expect(statusAfterStage('draft')).toBe('draft')
  })
  test('coach → refined', () => {
    expect(statusAfterStage('coach')).toBe('refined')
  })
  test('devil → challenged', () => {
    expect(statusAfterStage('devil')).toBe('challenged')
  })
})

describe('buildInitialBlocks', () => {
  test('產生 10 筆、blockNo 1..10、皆 empty、content 為 null', () => {
    const rows = buildInitialBlocks('canvas-123')
    expect(rows).toHaveLength(10)
    expect(rows.map((r) => r.blockNo)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(rows.every((r) => r.status === 'empty')).toBe(true)
    expect(rows.every((r) => r.content === null)).toBe(true)
    expect(rows.every((r) => r.canvasId === 'canvas-123')).toBe(true)
  })
})
