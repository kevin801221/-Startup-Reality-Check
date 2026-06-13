import { notFound, redirect } from 'next/navigation'
import type { BlockStatus } from '@/lib/canvas-framework'
import { createClient } from '@/lib/supabase/server'
import { getCanvasWithBlocks } from '@/lib/db/queries'
import { CanvasWorkspace, type WorkspaceBlock } from '@/components/canvas-workspace'

export default async function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const data = await getCanvasWithBlocks(id, user.id)
  if (!data) notFound()

  const blocks: WorkspaceBlock[] = data.blocks.map((b) => ({
    blockNo: b.blockNo,
    content: b.content,
    status: b.status as BlockStatus,
  }))

  return <CanvasWorkspace canvasId={id} title={data.canvas.title} initialBlocks={blocks} />
}
