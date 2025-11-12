

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

  // In an Edge environment, we log to the console instead of a file.
  console.error(`ERROR: [${type}] ${error}`, errorLog)
}

// Get error statistics
export function getErrorStats(): ErrorStats {
  // This function is a stub in Edge environments.
  return {
    totalErrors: 0,
    last24Hours: 0,
    last7Days: 0,
    errorRate: 0,
    byType: { chat: 0, admin: 0, system: 0, api: 0 },
    recentErrors: []
  }
}

// Get error trend (last 7 days)
export function getErrorTrend(): { date: string; count: number }[] {
  // This function is a stub in Edge environments.
  return Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return { date: d.toISOString().split('T')[0], count: 0 };
  }).reverse();
}

// Clear all error logs (admin action)
export async function clearErrorLogs(): Promise<void> {
  // This function is a stub in Edge environments.
  console.log('ERROR: clearErrorLogs called, but no action is taken in Edge environment.')
  return Promise.resolve()
}
