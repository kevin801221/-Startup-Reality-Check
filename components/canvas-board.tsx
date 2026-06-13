'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export type CanvasSummary = {
  id: string
  title: string
  oneLiner: string | null
  updatedAt: string
}

export function CanvasBoard({ initialCanvases }: { initialCanvases: CanvasSummary[] }) {
  const router = useRouter()
  const [canvases, setCanvases] = useState(initialCanvases)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<CanvasSummary | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CanvasSummary | null>(null)

  async function handleCreate(title: string, oneLiner: string) {
    const res = await fetch('/api/canvas', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, oneLiner }),
    })
    if (!res.ok) {
      toast.error('建立失敗，請稍後再試')
      return
    }
    const { canvas } = (await res.json()) as { canvas: CanvasSummary }
    setCreateOpen(false)
    toast.success('已建立新畫布')
    router.push(`/canvas/${canvas.id}`)
  }

  async function handleRename(id: string, title: string) {
    const res = await fetch(`/api/canvas/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) {
      toast.error('重新命名失敗')
      return
    }
    setCanvases((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
    setRenameTarget(null)
    toast.success('已重新命名')
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/canvas/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('刪除失敗')
      return
    }
    setCanvases((prev) => prev.filter((c) => c.id !== id))
    setDeleteTarget(null)
    toast.success('已刪除畫布')
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <Plus className="size-6" />
          <span className="text-sm font-medium">建立新畫布</span>
        </button>

        {canvases.map((c) => (
          <Card key={c.id} className="relative gap-0 py-0">
            <Link href={`/canvas/${c.id}`} className="block p-6">
              <CardHeader className="p-0">
                <CardTitle className="pr-8">{c.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {c.oneLiner?.trim() || '尚未填寫一句話總述'}
                </CardDescription>
              </CardHeader>
            </Link>
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="更多操作">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setRenameTarget(c)}>
                    <Pencil /> 重新命名
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => setDeleteTarget(c)}>
                    <Trash2 /> 刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <CreateDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
      <RenameDialog
        target={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onRename={handleRename}
      />
      <DeleteDialog
        target={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </>
  )
}

function CreateDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (title: string, oneLiner: string) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    try {
      await onCreate(title.trim(), oneLiner.trim())
      setTitle('')
      setOneLiner('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>建立新事業畫布</DialogTitle>
          <DialogDescription>給它一個名字，並用一句話描述你的事業（之後可改）。</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-title">畫布名稱</Label>
            <Input
              id="new-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：法律 AI 助手"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-oneliner">一句話總述（選填）</Label>
            <Textarea
              id="new-oneliner"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="幫中小律所把合約初審自動化，把資深律師的時間還給需要判斷的案子。"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              {busy ? '建立中…' : '建立'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function RenameDialog({
  target,
  onOpenChange,
  onRename,
}: {
  target: CanvasSummary | null
  onOpenChange: (open: boolean) => void
  onRename: (id: string, title: string) => Promise<void>
}) {
  const [title, setTitle] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!target || !title.trim()) return
    setBusy(true)
    try {
      await onRename(target.id, title.trim())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (open && target) setTitle(target.title)
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>重新命名</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
          <DialogFooter>
            <Button type="submit" disabled={busy}>
              儲存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({
  target,
  onOpenChange,
  onDelete,
}: {
  target: CanvasSummary | null
  onOpenChange: (open: boolean) => void
  onDelete: (id: string) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>刪除「{target?.title}」？</DialogTitle>
          <DialogDescription>
            這會一併刪除此畫布的所有格子與對話歷史，且無法復原。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              if (!target) return
              setBusy(true)
              try {
                await onDelete(target.id)
              } finally {
                setBusy(false)
              }
            }}
          >
            刪除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
