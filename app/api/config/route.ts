import { NextResponse } from 'next/server'
import { getDefaultModelId } from '@/lib/settings'

export const runtime = 'edge'

export async function GET() {
  try {
    const defaultModelId = await getDefaultModelId()
    return NextResponse.json({ defaultModelId })
  } catch (e: any) {
    return NextResponse.json({ defaultModelId: null }, { status: 200 })
  }
}
