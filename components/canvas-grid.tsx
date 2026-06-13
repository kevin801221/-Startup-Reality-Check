'use client'

import { CANVAS, type BlockStatus } from '@/lib/canvas-framework'
import { BlockCard } from '@/components/block-card'

export function CanvasGrid({
  statusByNo,
  onSelect,
}: {
  statusByNo: Record<number, BlockStatus>
  onSelect: (blockNo: number) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {CANVAS.map((spec) => (
        <BlockCard
          key={spec.no}
          spec={spec}
          status={statusByNo[spec.no] ?? 'empty'}
          onSelect={() => onSelect(spec.no)}
        />
      ))}
    </div>
  )
}
