import { CANVAS, type BlockStatus, type Stage } from '@/lib/canvas-framework'
import type { NewBlock } from '@/lib/db/schema'

/**
 * 「採納」對話結論寫回該格時，依當下階段決定新的格子狀態：
 * draft → draft、coach → refined、devil → challenged。
 */
export function statusAfterStage(stage: Stage): BlockStatus {
  switch (stage) {
    case 'draft':
      return 'draft'
    case 'coach':
      return 'refined'
    case 'devil':
      return 'challenged'
  }
}

/**
 * 建立 canvas 時預先產生的 10 筆空白格子（blockNo 1..10、status=empty）。
 * blockNo 對齊 canvas-framework 的 no，確保兩邊一致。
 */
export function buildInitialBlocks(canvasId: string): NewBlock[] {
  return CANVAS.map((b) => ({
    canvasId,
    blockNo: b.no,
    content: null,
    status: 'empty' satisfies BlockStatus,
  }))
}
