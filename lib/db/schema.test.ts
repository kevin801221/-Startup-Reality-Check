import { describe, expect, test } from 'vitest'
import { getTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { blocks, canvases, messages } from '@/lib/db/schema'

describe('db schema', () => {
  test('canvases 欄位齊全', () => {
    const cols = Object.keys(getTableColumns(canvases))
    expect(cols.sort()).toEqual(
      ['id', 'userId', 'title', 'oneLiner', 'createdAt', 'updatedAt'].sort(),
    )
  })

  test('blocks 欄位齊全', () => {
    const cols = Object.keys(getTableColumns(blocks))
    expect(cols.sort()).toEqual(
      ['id', 'canvasId', 'blockNo', 'content', 'status', 'updatedAt'].sort(),
    )
  })

  test('messages 欄位齊全', () => {
    const cols = Object.keys(getTableColumns(messages))
    expect(cols.sort()).toEqual(
      ['id', 'canvasId', 'blockNo', 'stage', 'role', 'content', 'createdAt'].sort(),
    )
  })

  test('status 預設為 empty、content 可空', () => {
    const cols = getTableColumns(blocks)
    expect(cols.status.notNull).toBe(true)
    expect(cols.status.hasDefault).toBe(true)
    expect(cols.content.notNull).toBe(false)
  })

  test('三表皆啟用 RLS 且各有一條 owner policy', () => {
    for (const table of [canvases, blocks, messages]) {
      const cfg = getTableConfig(table)
      expect(cfg.enableRLS).toBe(true)
      expect(cfg.policies.length).toBeGreaterThanOrEqual(1)
    }
  })

  test('blocks 有 (canvas_id, block_no) 唯一約束', () => {
    const cfg = getTableConfig(blocks)
    const uniqueCols = cfg.uniqueConstraints.flatMap((u) => u.columns.map((c) => c.name))
    expect(uniqueCols).toContain('canvas_id')
    expect(uniqueCols).toContain('block_no')
  })
})
