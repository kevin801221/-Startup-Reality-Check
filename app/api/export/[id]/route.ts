import type { BlockStatus } from '@/lib/canvas-framework'
import { createClient } from '@/lib/supabase/server'
import { getCanvasWithBlocks } from '@/lib/db/queries'
import { canvasToMarkdown } from '@/lib/export/markdown'

type Ctx = { params: Promise<{ id: string }> }

/** 匯出畫布為 Markdown 檔下載。 */
export async function GET(_req: Request, { params }: Ctx) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const { id } = await params
  const data = await getCanvasWithBlocks(id, user.id)
  if (!data) return new Response('not found', { status: 404 })

  const md = canvasToMarkdown({
    title: data.canvas.title,
    oneLiner: data.canvas.oneLiner,
    blocks: data.blocks.map((b) => ({
      blockNo: b.blockNo,
      content: b.content,
      status: b.status as BlockStatus,
    })),
  })

  return new Response(md, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="canvas-${id}.md"`,
    },
  })
}
