import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'
import { getDefaultModelId, setDefaultModelId } from '@/lib/settings'
import { logAuditAction } from '@/lib/auditLogger'

export const runtime = 'edge'

async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1]
  if (!token || !await verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const defaultModelId = await getDefaultModelId()
    return NextResponse.json({ defaultModelId })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req)
  if (authError) return authError

  try {
    const { defaultModelId } = await req.json()
    await setDefaultModelId(defaultModelId)
    await logAuditAction('settings_change', `Default model set to ${defaultModelId}`)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save settings' }, { status: 400 })
  }
}
