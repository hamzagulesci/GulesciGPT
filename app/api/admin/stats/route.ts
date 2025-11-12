import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { getStats, getMessageTrend, getTopModels, resetStats } from '@/lib/statsManager';
import { listApiKeys } from '@/lib/keyManager';
import { ApiKey } from '@/lib/keyManager'; // Import the interface

export const runtime = 'edge';

async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token || !await verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  try {
    const [stats, messageTrend, topModels, allKeys] = await Promise.all([
      getStats(),
      getMessageTrend(7),
      getTopModels(5),
      listApiKeys()
    ]);

    const keyStats = {
      active: allKeys.filter((k: ApiKey) => k.isActive).length,
      inactive: allKeys.filter((k: ApiKey) => !k.isActive).length,
      total: allKeys.length
    };

    return NextResponse.json({ stats, messageTrend, topModels, keyStats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await authMiddleware(request);
  if (authError) return authError;

  try {
    const { action } = await request.json();

    if (action === 'reset') {
      await resetStats();
      return NextResponse.json({ success: true, message: 'Statistics have been reset.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error resetting stats:', error);
    return NextResponse.json({ error: 'Failed to reset stats' }, { status: 500 });
  }
}
