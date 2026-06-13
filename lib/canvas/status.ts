import type { BlockStatus } from '@/lib/canvas-framework'

export type StatusMeta = {
  label: string
  /** 狀態燈符號：○空 → ◐草稿 → ●已深化 → ★已挑戰 */
  symbol: string
  /** 文字 / 燈號顏色（Tailwind class） */
  colorClass: string
}

export const STATUS_META: Record<BlockStatus, StatusMeta> = {
  empty: { label: '空', symbol: '○', colorClass: 'text-muted-foreground' },
  draft: { label: '草稿', symbol: '◐', colorClass: 'text-amber-500' },
  refined: { label: '已深化', symbol: '●', colorClass: 'text-emerald-600' },
  challenged: { label: '已挑戰', symbol: '★', colorClass: 'text-violet-600' },
}

/** 狀態由淺到深的排序（可用於進度計算）。 */
export const STATUS_ORDER: BlockStatus[] = ['empty', 'draft', 'refined', 'challenged']

/** 已開始（非 empty）的格子比例，0..1。 */
export function progressRatio(statuses: BlockStatus[]): number {
  if (statuses.length === 0) return 0
  const started = statuses.filter((s) => s !== 'empty').length
  return started / statuses.length
}
