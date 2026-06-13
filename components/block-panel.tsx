'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { getBlock, type BlockStatus, type Stage } from '@/lib/canvas-framework'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { BlockChat } from '@/components/block-chat'

export type SelectedBlock = {
  blockNo: number
  content: string | null
  status: BlockStatus
}

export function BlockPanel({
  canvasId,
  selected,
  onOpenChange,
  onAdopted,
}: {
  canvasId: string
  selected: SelectedBlock | null
  onOpenChange: (open: boolean) => void
  onAdopted: (blockNo: number, content: string, status: BlockStatus) => void
}) {
  return (
    <Dialog open={selected !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        {selected && (
          <BlockPanelBody
            key={selected.blockNo}
            canvasId={canvasId}
            selected={selected}
            onAdopted={onAdopted}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function BlockPanelBody({
  canvasId,
  selected,
  onAdopted,
}: {
  canvasId: string
  selected: SelectedBlock
  onAdopted: (blockNo: number, content: string, status: BlockStatus) => void
}) {
  const spec = getBlock(selected.blockNo)
  const [stage, setStage] = useState<Stage>('draft')
  const [content, setContent] = useState(selected.content ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.error('內容不可為空')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/canvas/${canvasId}/adopt`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ blockNo: selected.blockNo, content: trimmed, stage }),
      })
      if (!res.ok) throw new Error()
      const { block } = (await res.json()) as { block: { status: BlockStatus } }
      onAdopted(selected.blockNo, trimmed, block.status)
      toast.success('已儲存為正式內容')
    } catch {
      toast.error('儲存失敗，請稍後再試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {spec.no}. {spec.title}（{spec.subtitle}）
        </DialogTitle>
        <DialogDescription>這一格在問：{spec.question}</DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">正式內容</span>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? '儲存中…' : '儲存為正式內容'}
          </Button>
        </div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-24"
          placeholder="可手動編輯，或從下方對話「採納此則」帶入。"
        />
      </div>

      <Tabs value={stage} onValueChange={(v) => setStage(v as Stage)}>
        <TabsList className="w-full">
          <TabsTrigger value="draft">起草</TabsTrigger>
          <TabsTrigger value="coach">教練</TabsTrigger>
          <TabsTrigger value="devil">魔鬼代言人</TabsTrigger>
        </TabsList>
      </Tabs>

      <BlockChat
        canvasId={canvasId}
        blockNo={selected.blockNo}
        stage={stage}
        onAdoptText={(t) => setContent(t)}
      />
    </>
  )
}
