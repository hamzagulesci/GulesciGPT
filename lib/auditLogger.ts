import fs from 'fs'
import path from 'path'
import { lock, unlock } from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'audit-logs.json')
const LOCK_OPTIONS = {
  retries: {
    retries: 5,
    minTimeout: 100,
    maxTimeout: 1000
  }
}

export interface AuditLog {
  id: string
  timestamp: string
  action: 'login' | 'logout' | 'add_key' | 'remove_key' | 'toggle_key' | 'clear_errors' | 'settings_change' | 'view_stats'
  details: string
  ip?: string
  userAgent?: string
  success: boolean
}

interface AuditStats {
  totalLogs: number
  last24Hours: number
  last7Days: number
  byAction: Record<string, number>
  recentLogs: AuditLog[]
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Read audit logs
function readAuditLogs(): AuditLog[] {
  ensureDataDir()

  if (!fs.existsSync(AUDIT_LOG_FILE)) {
    return []
  }

  try {
    const data = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading audit logs:', error)
    return []
  }
}

// Write audit logs with lock
async function writeAuditLogs(logs: AuditLog[]): Promise<void> {
  ensureDataDir()

  // Create file if it doesn't exist
  if (!fs.existsSync(AUDIT_LOG_FILE)) {
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify([]))
  }

  try {
    await lock(AUDIT_LOG_FILE, LOCK_OPTIONS)
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(logs, null, 2))
    await unlock(AUDIT_LOG_FILE)
  } catch (error) {
    console.error('Error writing audit logs:', error)
    // Try to unlock if locked
    try {
      await unlock(AUDIT_LOG_FILE)
    } catch (unlockError) {
      // Ignore unlock errors
    }
  }
}

// Clean old logs (keep last 90 days)
function cleanOldLogs(logs: AuditLog[]): AuditLog[] {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  return logs.filter(log => {
    const logDate = new Date(log.timestamp)
    return logDate > ninetyDaysAgo
  })
}

// Log an admin action
export async function logAuditAction(
  action: AuditLog['action'],
  details: string,
  metadata?: {
    ip?: string
    userAgent?: string
    success?: boolean
  }
): Promise<void> {
  let logs = readAuditLogs()

  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    details,
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
    success: metadata?.success ?? true
  }

  logs.push(auditLog)
  logs = cleanOldLogs(logs)

  await writeAuditLogs(logs)
}

// Get audit statistics
export function getAuditStats(): AuditStats {
  const logs = readAuditLogs()
  const now = new Date()
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const last24HoursLogs = logs.filter(log => new Date(log.timestamp) > last24Hours)
  const last7DaysLogs = logs.filter(log => new Date(log.timestamp) > last7Days)

  // Count by action
  const byAction: Record<string, number> = {}
  logs.forEach(log => {
    byAction[log.action] = (byAction[log.action] || 0) + 1
  })

  // Get recent logs (last 50)
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50)

  return {
    totalLogs: logs.length,
    last24Hours: last24HoursLogs.length,
    last7Days: last7DaysLogs.length,
    byAction,
    recentLogs
  }
}

// Get audit trend (last 7 days)
export function getAuditTrend(): { date: string; count: number }[] {
  const logs = readAuditLogs()
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

// Clear audit logs (admin action)
export async function clearAuditLogs(): Promise<void> {
  await writeAuditLogs([])
}
