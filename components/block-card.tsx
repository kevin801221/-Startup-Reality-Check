'use client'

import type { BlockSpec, BlockStatus } from '@/lib/canvas-framework'
import { STATUS_META } from '@/lib/canvas/status'
import { cn } from '@/lib/utils'

export function BlockCard({
  spec,
  status,
  onSelect,
}: {
  spec: BlockSpec
  status: BlockStatus
  onSelect: () => void
}) {
  const meta = STATUS_META[status]
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-32 flex-col items-start gap-1 rounded-xl border bg-card p-4 text-left transition-colors hover:border-foreground/30 focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{spec.no}</span>
        <span className={cn('text-xs', meta.colorClass)}>
          {meta.symbol} {meta.label}
        </span>
      </div>
      <div className="mt-1 font-medium">{spec.title}</div>
      <div className="text-xs text-muted-foreground">{spec.subtitle}</div>
    </button>
  )
}
