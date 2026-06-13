import { CANVAS, type BlockStatus } from '@/lib/canvas-framework'
import { STATUS_META } from '@/lib/canvas/status'

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']

export type ExportBlock = {
  blockNo: number
  content: string | null
  status: BlockStatus
}

export type ExportCanvas = {
  title: string
  oneLiner?: string | null
  blocks: ExportBlock[]
}

/**
 * 把一個事業畫布轉成 Markdown 文件。
 * 依 canvas-framework 的 10 格順序輸出；缺內容的格子標記「（尚未填寫）」。
 */
export function canvasToMarkdown(canvas: ExportCanvas): string {
  const byNo = new Map(canvas.blocks.map((b) => [b.blockNo, b]))
  const lines: string[] = []

  lines.push(`# ${canvas.title}`)
  lines.push('')
  if (canvas.oneLiner && canvas.oneLiner.trim()) {
    lines.push(`> ${canvas.oneLiner.trim()}`)
    lines.push('')
  }

  for (const spec of CANVAS) {
    const block = byNo.get(spec.no)
    const status = block?.status ?? 'empty'
    const meta = STATUS_META[status]
    const circled = CIRCLED[spec.no - 1] ?? `${spec.no}.`

    lines.push(`## ${circled} ${spec.title}（${spec.subtitle}） ${meta.symbol} ${meta.label}`)
    lines.push('')
    lines.push(`*這一格在問：${spec.question}*`)
    lines.push('')
    const content = block?.content?.trim()
    lines.push(content && content.length > 0 ? content : '（尚未填寫）')
    lines.push('')
  }

  return lines.join('\n').trimEnd() + '\n'
}
