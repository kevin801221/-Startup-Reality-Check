import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listCanvases } from '@/lib/db/queries'
import { SignOutButton } from '@/components/sign-out-button'
import { CanvasBoard, type CanvasSummary } from '@/components/canvas-board'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const canvases = await listCanvases(user.id)
  const summaries: CanvasSummary[] = canvases.map((c) => ({
    id: c.id,
    title: c.title,
    oneLiner: c.oneLiner,
    updatedAt: c.updatedAt.toISOString(),
  }))

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">我的事業畫布</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </header>
      <CanvasBoard initialCanvases={summaries} />
    </div>
  )
}
