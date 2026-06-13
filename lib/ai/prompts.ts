import { getBlock, type Stage } from '@/lib/canvas-framework'

const STAGE_INSTRUCTION: Record<Stage, (evidence: string[]) => string> = {
  draft: () =>
    '【任務：起草】根據使用者的事業總述與這一格的問題，產出這一格的初稿。3–5 句、具體、可被質疑。只輸出初稿內容本身，不要客套或前言。',
  coach: () =>
    '【任務：教練】你是蘇格拉底式教練。一次只問 1–2 個追問，幫使用者把答案想得更具體、更有深度。不要替他回答，用對照好範例的方式點出落差，引導他自己補上證據。',
  devil: (evidence) =>
    `【任務：魔鬼代言人】你是挑剔的早期投資人。攻擊使用者的假設、戳破盲點，並要求以下這類數字與證據：${evidence.join('、')}。語氣犀利但有建設性，目的是讓商業模型禁得起挑戰，而不是打擊他。`,
}

export function buildSystemPrompt(blockNo: number, stage: Stage): string {
  const b = getBlock(blockNo)
  return [
    `你正在協助使用者完成「紀律創業畫布」（MIT Disciplined Entrepreneurship）的第 ${b.no} 格：${b.title}（${b.subtitle}）。`,
    `這一格在問：${b.question}`,
    `定義：${b.definition}`,
    `好範例：${b.goodExample}`,
    `壞範例：${b.badExample}`,
    '',
    STAGE_INSTRUCTION[stage](b.evidenceNeeded),
    '',
    '請全程使用繁體中文。',
  ].join('\n')
}
