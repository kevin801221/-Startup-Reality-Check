import { sql } from 'drizzle-orm'
import {
  integer,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { authenticatedRole, authUid, authUsers } from 'drizzle-orm/supabase'

/**
 * 事業畫布。每位使用者可有多個畫布；RLS 只允許本人存取自己的畫布。
 */
export const canvases = pgTable(
  'canvases',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    oneLiner: text('one_liner'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    pgPolicy('canvases_owner_all', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.userId} = ${authUid}`,
      withCheck: sql`${t.userId} = ${authUid}`,
    }),
  ],
).enableRLS()

/**
 * 畫布的 10 格內容。建立 canvas 時預先插入 10 筆（status=empty）。
 * RLS 經由所屬 canvas 連動到 user。
 */
export const blocks = pgTable(
  'blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    canvasId: uuid('canvas_id')
      .notNull()
      .references(() => canvases.id, { onDelete: 'cascade' }),
    blockNo: integer('block_no').notNull(),
    content: text('content'),
    status: text('status').notNull().default('empty'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique('blocks_canvas_block_unique').on(t.canvasId, t.blockNo),
    pgPolicy('blocks_owner_all', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.canvasId} in (select id from ${canvases} where ${canvases.userId} = ${authUid})`,
      withCheck: sql`${t.canvasId} in (select id from ${canvases} where ${canvases.userId} = ${authUid})`,
    }),
  ],
).enableRLS()

/**
 * 三階段對話歷史（draft / coach / devil），依 (canvas, block) 歸屬。
 * RLS 經由所屬 canvas 連動到 user。
 */
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    canvasId: uuid('canvas_id')
      .notNull()
      .references(() => canvases.id, { onDelete: 'cascade' }),
    blockNo: integer('block_no').notNull(),
    stage: text('stage').notNull(),
    role: text('role').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    pgPolicy('messages_owner_all', {
      for: 'all',
      to: authenticatedRole,
      using: sql`${t.canvasId} in (select id from ${canvases} where ${canvases.userId} = ${authUid})`,
      withCheck: sql`${t.canvasId} in (select id from ${canvases} where ${canvases.userId} = ${authUid})`,
    }),
  ],
).enableRLS()

export type Canvas = typeof canvases.$inferSelect
export type NewCanvas = typeof canvases.$inferInsert
export type Block = typeof blocks.$inferSelect
export type NewBlock = typeof blocks.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert
