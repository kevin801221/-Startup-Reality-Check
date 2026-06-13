import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deleteCanvas, getCanvasWithBlocks, renameCanvas } from '@/lib/db/queries'

type Ctx = { params: Promise<{ id: string }> }

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/** 取單一畫布與其 10 格（限本人）。 */
export async function GET(_req: Request, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const data = await getCanvasWithBlocks(id, user.id)
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data)
}

/** 重新命名畫布。 */
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const body = (await req.json()) as { title?: string }
  const title = body.title?.trim()
  if (!title) return NextResponse.json({ error: 'title 為必填' }, { status: 400 })
  const canvas = await renameCanvas(id, user.id, title)
  if (!canvas) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ canvas })
}

/** 刪除畫布（連動刪除 blocks / messages）。 */
export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await params
  const ok = await deleteCanvas(id, user.id)
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
