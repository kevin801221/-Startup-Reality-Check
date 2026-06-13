import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCanvasWithBlocks, listMessages } from '@/lib/db/queries'

type Ctx = { params: Promise<{ id: string }> }

/** 取某格對話歷史：GET /api/canvas/[id]/messages?blockNo=2 */
export async function GET(req: Request, { params }: Ctx) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const blockNo = Number(new URL(req.url).searchParams.get('blockNo'))
  if (!Number.isInteger(blockNo) || blockNo < 1 || blockNo > 10) {
    return NextResponse.json({ error: 'blockNo 無效' }, { status: 400 })
  }

  const owned = await getCanvasWithBlocks(id, user.id)
  if (!owned) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const messages = await listMessages(id, blockNo)
  return NextResponse.json({ messages })
}
