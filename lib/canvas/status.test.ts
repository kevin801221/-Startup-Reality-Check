import { describe, expect, test } from 'vitest'
import { STATUS_META, STATUS_ORDER, progressRatio } from '@/lib/canvas/status'

describe('STATUS_META', () => {
  test('四種狀態都有 label/symbol/colorClass', () => {
    for (const s of STATUS_ORDER) {
      expect(STATUS_META[s].label.length).toBeGreaterThan(0)
      expect(STATUS_META[s].symbol.length).toBeGreaterThan(0)
      expect(STATUS_META[s].colorClass).toContain('text-')
    }
  })

  test('狀態由淺到深的順序', () => {
    expect(STATUS_ORDER).toEqual(['empty', 'draft', 'refined', 'challenged'])
  })
})

describe('progressRatio', () => {
  test('全空為 0', () => {
    expect(progressRatio(['empty', 'empty', 'empty'])).toBe(0)
  })
  test('全部開始為 1', () => {
    expect(progressRatio(['draft', 'refined', 'challenged'])).toBe(1)
  })
  test('一半', () => {
    expect(progressRatio(['empty', 'draft'])).toBe(0.5)
  })
  test('空陣列為 0', () => {
    expect(progressRatio([])).toBe(0)
  })
})
