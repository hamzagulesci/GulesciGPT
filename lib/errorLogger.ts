import fs from 'fs'
import path from 'path'
import { lock, unlock } from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const ERROR_LOG_FILE = path.join(DATA_DIR, 'error-logs.json')
const LOCK_OPTIONS = {
  retries: {
    retries: 5,
    minTimeout: 100,
    maxTimeout: 1000
  }
}

interface ErrorLog {
  id: string
  timestamp: string
  type: 'chat' | 'admin' | 'system' | 'api'
  error: string
  details?: string
  userAgent?: string
  ip?: string
  endpoint?: string
  statusCode?: number
}

interface ErrorStats {
  totalErrors: number
  last24Hours: number
  last7Days: number
  errorRate: number // errors per hour in last 24h
  byType: {
    chat: number
    admin: number
    system: number
    api: number
  }
  recentErrors: ErrorLog[]
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Read error logs
function readErrorLogs(): ErrorLog[] {
  ensureDataDir()

  if (!fs.existsSync(ERROR_LOG_FILE)) {
    return []
  }

  try {
    const data = fs.readFileSync(ERROR_LOG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading error logs:', error)
    return []
  }
}

// Write error logs with lock
async function writeErrorLogs(logs: ErrorLog[]): Promise<void> {
  ensureDataDir()

  // Create file if it doesn't exist
  if (!fs.existsSync(ERROR_LOG_FILE)) {
    fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify([]))
  }

  try {
    await lock(ERROR_LOG_FILE, LOCK_OPTIONS)
    fs.writeFileSync(ERROR_LOG_FILE, JSON.stringify(logs, null, 2))
    await unlock(ERROR_LOG_FILE)
  } catch (error) {
    console.error('Error writing error logs:', error)
    // Try to unlock if locked
    try {
      await unlock(ERROR_LOG_FILE)
    } catch (unlockError) {
      // Ignore unlock errors
    }
  }
}

// Clean old logs (keep last 30 days)
function cleanOldLogs(logs: ErrorLog[]): ErrorLog[] {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return logs.filter(log => {
    const logDate = new Date(log.timestamp)
    return logDate > thirtyDaysAgo
  })
}

// Log an error
export async function logError(
  type: ErrorLog['type'],
  error: string,
  details?: {
    message?: string
    userAgent?: string
    ip?: string
    endpoint?: string
    statusCode?: number
  }
): Promise<void> {
  let logs = readErrorLogs()

  const errorLog: ErrorLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type,
    error,
    details: details?.message,
    userAgent: details?.userAgent,
    ip: details?.ip,
    endpoint: details?.endpoint,
    statusCode: details?.statusCode
  }

  logs.push(errorLog)
  logs = cleanOldLogs(logs)

  await writeErrorLogs(logs)
}

// Get error statistics
export function getErrorStats(): ErrorStats {
  const logs = readErrorLogs()
  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const last24HoursErrors = logs.filter(log => new Date(log.timestamp) > last24Hours)
  const last7DaysErrors = logs.filter(log => new Date(log.timestamp) > last7Days)

  const errorRate = last24HoursErrors.length / 24 // errors per hour

  const byType = {
    chat: logs.filter(log => log.type === 'chat').length,
    admin: logs.filter(log => log.type === 'admin').length,
    system: logs.filter(log => log.type === 'system').length,
    api: logs.filter(log => log.type === 'api').length
  }

  // Get recent errors (last 20)
  const recentErrors = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

  return {
    totalErrors: logs.length,
    last24Hours: last24HoursErrors.length,
    last7Days: last7DaysErrors.length,
    errorRate: Math.round(errorRate * 10) / 10,
    byType,
    recentErrors
  }
}

// Get error trend (last 7 days)
export function getErrorTrend(): { date: string; count: number }[] {
  const logs = readErrorLogs()
  const now = new Date()
  const last7Days: { date: string; count: number }[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)

    const count = logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= date && logDate < nextDate
    }).length

    last7Days.push({
      date: date.toISOString(),
      count
    })
  }

  return last7Days
}

// Clear all error logs (admin action)
export async function clearErrorLogs(): Promise<void> {
  await writeErrorLogs([])
}
