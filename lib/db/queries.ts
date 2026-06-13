import { and, asc, desc, eq } from 'drizzle-orm'
import type { Stage } from '@/lib/canvas-framework'
import { getDb } from '@/lib/db/index'
import { buildInitialBlocks, statusAfterStage } from '@/lib/db/blocks'
import { blocks, canvases, messages, type Canvas } from '@/lib/db/schema'

/**
 * 建立 canvas，並在同一交易內預插 10 筆空白 blocks。回傳新 canvas。
 */
export async function createCanvas(input: {
  userId: string
  title: string
  oneLiner?: string | null
}): Promise<Canvas> {
  const db = getDb()
  return db.transaction(async (tx) => {
    const [canvas] = await tx
      .insert(canvases)
      .values({
        userId: input.userId,
        title: input.title,
        oneLiner: input.oneLiner ?? null,
      })
      .returning()
    await tx.insert(blocks).values(buildInitialBlocks(canvas.id))
    return canvas
  })
}

/** 列出某使用者的所有 canvas（最近更新在前）。 */
export async function listCanvases(userId: string): Promise<Canvas[]> {
  const db = getDb()
  return db
    .select()
    .from(canvases)
    .where(eq(canvases.userId, userId))
    .orderBy(desc(canvases.updatedAt))
}

/**
 * 取單一 canvas 與其 10 格（深度防禦：再次以 userId 過濾，不只靠 RLS）。
 * 找不到（或非本人）回傳 null。
 */
export async function getCanvasWithBlocks(canvasId: string, userId: string) {
  const db = getDb()
  const [canvas] = await db
    .select()
    .from(canvases)
    .where(and(eq(canvases.id, canvasId), eq(canvases.userId, userId)))
    .limit(1)
  if (!canvas) return null
  const canvasBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.canvasId, canvasId))
    .orderBy(asc(blocks.blockNo))
  return { canvas, blocks: canvasBlocks }
}

/** 重新命名 canvas（限本人）。回傳更新後的 canvas 或 null。 */
export async function renameCanvas(canvasId: string, userId: string, title: string) {
  const db = getDb()
  const [canvas] = await db
    .update(canvases)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(canvases.id, canvasId), eq(canvases.userId, userId)))
    .returning()
  return canvas ?? null
}

/** 刪除 canvas（限本人）。blocks / messages 經 FK cascade 一併刪除。 */
export async function deleteCanvas(canvasId: string, userId: string): Promise<boolean> {
  const db = getDb()
  const deleted = await db
    .delete(canvases)
    .where(and(eq(canvases.id, canvasId), eq(canvases.userId, userId)))
    .returning({ id: canvases.id })
  return deleted.length > 0
}

/**
 * 採納：把內容寫回某格，並依當下 stage 設定狀態。
 * 同步把 canvas 的 updatedAt 往前推。
 */
export async function adoptBlockContent(input: {
  canvasId: string
  blockNo: number
  content: string
  stage: Stage
}) {
  const db = getDb()
  const status = statusAfterStage(input.stage)
  return db.transaction(async (tx) => {
    const [block] = await tx
      .update(blocks)
      .set({ content: input.content, status, updatedAt: new Date() })
      .where(and(eq(blocks.canvasId, input.canvasId), eq(blocks.blockNo, input.blockNo)))
      .returning()
    await tx
      .update(canvases)
      .set({ updatedAt: new Date() })
      .where(eq(canvases.id, input.canvasId))
    return block ?? null
  })
}

/** 載入某格的對話歷史（時間升冪）。 */
export async function listMessages(canvasId: string, blockNo: number) {
  const db = getDb()
  return db
    .select()
    .from(messages)
    .where(and(eq(messages.canvasId, canvasId), eq(messages.blockNo, blockNo)))
    .orderBy(asc(messages.createdAt))
}

/** 寫入一則對話訊息。 */
export async function appendMessage(input: {
  canvasId: string
  blockNo: number
  stage: Stage
  role: 'user' | 'assistant'
  content: string
}) {
  const db = getDb()
  const [message] = await db.insert(messages).values(input).returning()
  return message
}
