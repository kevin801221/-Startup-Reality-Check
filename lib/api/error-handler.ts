import { NextResponse } from 'next/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode },
    )
  }

  if (error instanceof Error) {
    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json(
      {
        error: isDev ? error.message : 'Internal server error',
        ...(isDev && { stack: error.stack }),
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    { error: 'Unknown error occurred' },
    { status: 500 },
  )
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>,
): Promise<T | NextResponse> {
  try {
    return await handler()
  } catch (error) {
    return handleApiError(error)
  }
}
