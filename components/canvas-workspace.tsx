'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { BlockStatus } from '@/lib/canvas-framework'
import { Button } from '@/components/ui/button'
import { CanvasGrid } from '@/components/canvas-grid'
import { BlockPanel, type SelectedBlock } from '@/components/block-panel'

export type WorkspaceBlock = {
  blockNo: number
  content: string | null
  status: BlockStatus
}

export function CanvasWorkspace({
  canvasId,
  title,
  hasOneLiner,
  initialBlocks,
}: {
  canvasId: string
  title: string
  hasOneLiner: boolean
  initialBlocks: WorkspaceBlock[]
}) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [selectedNo, setSelectedNo] = useState<number | null>(null)
  const [drafting, setDrafting] = useState(false)

  async function draftAll() {
    setDrafting(true)
    try {
      const res = await fetch(`/api/canvas/${canvasId}/draft-all`, { method: 'POST' })
      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(error || '起草失敗，請稍後再試')
        return
      }
      const data = (await res.json()) as { blocks: WorkspaceBlock[]; filled: number }
      setBlocks(data.blocks)
      toast.success(
        data.filled > 0 ? `已為 ${data.filled} 個空白格產出初稿` : '沒有空白格可起草',
      )
    } catch {
      toast.error('起草失敗，請稍後再試')
    } finally {
      setDrafting(false)
    }
  }

  const statusByNo = useMemo(() => {
    const m: Record<number, BlockStatus> = {}
    for (const b of blocks) m[b.blockNo] = b.status
    return m
  }, [blocks])

  const selected: SelectedBlock | null =
    selectedNo == null
      ? null
      : (blocks.find((b) => b.blockNo === selectedNo) ?? {
          blockNo: selectedNo,
          content: null,
          status: 'empty',
        })

  function onAdopted(blockNo: number, content: string, status: BlockStatus) {
    setBlocks((prev) =>
      prev.map((b) => (b.blockNo === blockNo ? { ...b, content, status } : b)),
    )
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="回到列表">
            <Link href="/dashboard">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={draftAll}
            disabled={drafting || !hasOneLiner}
            title={hasOneLiner ? undefined : '請先在畫布設定一句話總述'}
          >
            <Sparkles /> {drafting ? '起草中…' : '一鍵起草空白格'}
          </Button>
          <Button asChild variant="outline">
            <a href={`/api/export/${canvasId}`}>
              <Download /> 匯出 Markdown
            </a>
          </Button>
        </div>
      </header>

      <CanvasGrid statusByNo={statusByNo} onSelect={setSelectedNo} />

      <BlockPanel
        canvasId={canvasId}
        selected={selected}
        onOpenChange={(open) => {
          if (!open) setSelectedNo(null)
        }}
        onAdopted={onAdopted}
      />
    </div>
  )
}
