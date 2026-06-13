import { google } from '@ai-sdk/google'
import { generateText, type LanguageModel } from 'ai'
import { CANVAS } from '@/lib/canvas-framework'
import { buildSystemPrompt } from '@/lib/ai/prompts'

export type DraftResult = { blockNo: number; content: string }

/**
 * 「一鍵起草」：用一句事業總述，為指定的格子（預設全 10 格）各生一段初稿。
 * 平行呼叫 Gemini，回傳依 blockNo 排序的結果。
 */
export async function generateDrafts({
  oneLiner,
  blockNos,
  model,
}: {
  oneLiner: string
  blockNos?: number[]
  model?: LanguageModel
}): Promise<DraftResult[]> {
  const targets =
    blockNos && blockNos.length > 0
      ? CANVAS.filter((b) => blockNos.includes(b.no))
      : CANVAS
  const m = model ?? google('gemini-2.5-flash')

  const results = await Promise.all(
    targets.map(async (b) => {
      const { text } = await generateText({
        model: m,
        system: buildSystemPrompt(b.no, 'draft'),
        messages: [
          {
            role: 'user',
            content: `我的事業總述：${oneLiner}\n\n請為這一格產出初稿。`,
          },
        ],
      })
      return { blockNo: b.no, content: text.trim() }
    }),
  )

  return results.sort((a, b) => a.blockNo - b.blockNo)
}
