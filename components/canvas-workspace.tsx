'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download } from 'lucide-react'
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
  initialBlocks,
}: {
  canvasId: string
  title: string
  initialBlocks: WorkspaceBlock[]
}) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [selectedNo, setSelectedNo] = useState<number | null>(null)

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
        <Button asChild variant="outline">
          <a href={`/api/export/${canvasId}`}>
            <Download /> 匯出 Markdown
          </a>
        </Button>
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
