import { NextResponse } from 'next/server'
import type { Stage } from '@/lib/canvas-framework'
import { createClient } from '@/lib/supabase/server'
import { adoptBlockContent, getCanvasWithBlocks } from '@/lib/db/queries'

type Ctx = { params: Promise<{ id: string }> }

const STAGES: Stage[] = ['draft', 'coach', 'devil']

/** 採納：把內容寫回某格並依 stage 設定狀態。 */
export async function POST(req: Request, { params }: Ctx) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const body = (await req.json()) as { blockNo?: number; content?: string; stage?: Stage }
  const blockNo = Number(body.blockNo)
  const content = body.content?.trim()
  const stage = body.stage

  if (!Number.isInteger(blockNo) || blockNo < 1 || blockNo > 10) {
    return NextResponse.json({ error: 'blockNo 無效' }, { status: 400 })
  }
  if (!content) {
    return NextResponse.json({ error: '內容不可為空' }, { status: 400 })
  }
  if (!stage || !STAGES.includes(stage)) {
    return NextResponse.json({ error: 'stage 無效' }, { status: 400 })
  }

  const owned = await getCanvasWithBlocks(id, user.id)
  if (!owned) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const block = await adoptBlockContent({ canvasId: id, blockNo, content, stage })
  if (!block) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ block })
}
