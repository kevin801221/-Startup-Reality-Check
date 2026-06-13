import { redirect } from 'next/navigation'

export default function Home() {
  // 進站直接導向 dashboard；未登入時 middleware 會再導向 /login。
  redirect('/dashboard')
}
