'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** 把某則 AI 回覆採納進「正式內容」編輯區。 */
export function AdoptButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <Check /> 採納此則
    </Button>
  )
}
