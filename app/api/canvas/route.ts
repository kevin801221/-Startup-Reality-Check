import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCanvas, listCanvases } from '@/lib/db/queries'

/** 列出目前登入者的所有事業畫布。 */
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const canvases = await listCanvases(user.id)
  return NextResponse.json({ canvases })
}

/** 建立新畫布（同時預插 10 格）。 */
export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as { title?: string; oneLiner?: string }
  const title = body.title?.trim()
  if (!title) {
    return NextResponse.json({ error: 'title 為必填' }, { status: 400 })
  }

  const canvas = await createCanvas({
    userId: user.id,
    title,
    oneLiner: body.oneLiner?.trim() || null,
  })
  return NextResponse.json({ canvas }, { status: 201 })
}
