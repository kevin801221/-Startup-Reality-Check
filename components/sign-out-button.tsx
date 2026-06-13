import { Button } from '@/components/ui/button'

/** 以表單 POST 到 /auth/signout（不需 client JS）。 */
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <Button type="submit" variant="ghost" size="sm">
        登出
      </Button>
    </form>
  )
}
