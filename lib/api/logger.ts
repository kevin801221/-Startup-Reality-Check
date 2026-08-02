/**
 * 結構化日誌工具
 * 生產環境可替換為 Pino、Winston 或其他專業日誌庫
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'
  private minLevel: LogLevel = process.env.LOG_LEVEL as LogLevel || 'info'

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel]
  }

  private format(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    
    if (this.isDev) {
      return {
        timestamp,
        level,
        message,
        ...context,
      }
    }

    return JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
    })
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, context))
    }
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, context))
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, context))
    }
  }

  error(message: string, context?: LogContext) {
    if (this.shouldLog('error')) {
      console.error(this.format('error', message, context))
    }
  }

  // API 專用的請求日誌
  apiRequest(method: string, path: string, context?: LogContext) {
    this.info('API Request', { method, path, ...context })
  }

  apiResponse(method: string, path: string, status: number, duration: number, context?: LogContext) {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    this[level]('API Response', { method, path, status, duration, ...context })
  }
}

export const logger = new Logger()

// API 請求計時器工具
export function createApiTimer() {
  const start = Date.now()
  return {
    end: () => Date.now() - start,
  }
}
