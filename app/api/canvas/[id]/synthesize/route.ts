import { NextResponse } from 'next/server'
import type { ModelMessage } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { getCanvasWithBlocks, listMessages } from '@/lib/db/queries'
import { synthesizeContent } from '@/lib/ai/synthesize'

type Ctx = { params: Promise<{ id: string }> }

export const maxDuration = 30

/**
 * 用該格的完整對話 + 目前內容，整理出更新後的「正式內容」（不直接存，回傳給前端確認）。
 */
export async function POST(req: Request, { params }: Ctx) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await params
  const body = (await req.json()) as { blockNo?: number; content?: string }
  const blockNo = Number(body.blockNo)
  if (!Number.isInteger(blockNo) || blockNo < 1 || blockNo > 10) {
    return NextResponse.json({ error: 'blockNo 無效' }, { status: 400 })
  }

  const owned = await getCanvasWithBlocks(id, user.id)
  if (!owned) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const history = await listMessages(id, blockNo)
  if (history.length === 0) {
    return NextResponse.json({ error: '這一格還沒有對話可整理' }, { status: 400 })
  }

  const messages: ModelMessage[] = history.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }))

  const content = await synthesizeContent({
    blockNo,
    currentContent: body.content ?? '',
    messages,
  })

  return NextResponse.json({ content })
}
