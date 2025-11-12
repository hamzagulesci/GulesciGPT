

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
  const auditLog: AuditLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    details,
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
    success: metadata?.success ?? true
  }

  // In an Edge environment, we log to the console instead of a file.
  console.log(`AUDIT: [${action}] ${details}`, auditLog)
}

// Get audit statistics
export function getAuditStats(): AuditStats {
  // This function is a stub in Edge environments as there is no persistent file system.
  // For a full implementation, a serverless database (e.g., KV store) would be needed.
  return {
    totalLogs: 0,
    last24Hours: 0,
    last7Days: 0,
    byAction: {},
    recentLogs: []
  }
}

// Get audit trend (last 7 days)
export function getAuditTrend(): { date: string; count: number }[] {
  // This function is a stub in Edge environments.
  return Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { date: d.toISOString().split('T')[0], count: 0 };
  }).reverse();
}

// Clear audit logs (admin action)
export async function clearAuditLogs(): Promise<void> {
  // This function is a stub in Edge environments.
  console.log('AUDIT: clearAuditLogs called, but no action is taken in Edge environment.')
  return Promise.resolve()
}
