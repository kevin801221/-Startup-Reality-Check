import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyDrafts, getCanvasWithBlocks } from '@/lib/db/queries'
import { generateDrafts } from '@/lib/ai/draft'

type Ctx = { params: Promise<{ id: string }> }

export const maxDuration = 60

/**
 * 一鍵起草：用 canvas 的一句話總述，為「目前空白」的格子各生初稿並寫入。
 * 不覆蓋已有內容。
 */
export async function POST(_req: Request, { params }: Ctx) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const owned = await getCanvasWithBlocks(id, user.id)
  if (!owned) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const oneLiner = owned.canvas.oneLiner?.trim()
  if (!oneLiner) {
    return NextResponse.json(
      { error: '請先填一句事業總述（一句話描述你的事業）再起草' },
      { status: 400 },
    )
  }

  const emptyNos = owned.blocks
    .filter((b) => !b.content || b.content.trim() === '')
    .map((b) => b.blockNo)

  if (emptyNos.length === 0) {
    return NextResponse.json({ blocks: owned.blocks, filled: 0 })
  }

  const drafts = await generateDrafts({ oneLiner, blockNos: emptyNos })
  await applyDrafts(id, drafts)

  const updated = await getCanvasWithBlocks(id, user.id)
  return NextResponse.json({ blocks: updated?.blocks ?? [], filled: drafts.length })
}
