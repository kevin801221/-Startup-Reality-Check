import { createClient } from '@/lib/supabase/server'
import { ApiError } from './error-handler'

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new ApiError('Authentication failed', 401, 'AUTH_ERROR')
  }

  if (!user) {
    throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED')
  }

  return user
}

export async function getOptionalAuth() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
