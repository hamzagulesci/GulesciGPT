import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { listApiKeys, addApiKey, deleteApiKey, toggleApiKeyStatus } from '@/lib/keyManager';
import { logAuditAction } from '@/lib/auditLogger';

export const runtime = 'edge';

async function authMiddleware(req: NextRequest) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token || !await verifyToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const authError = await authMiddleware(req);
    if (authError) return authError;

    const keys = await listApiKeys();
    return NextResponse.json({ keys });
  } catch (error: any) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch keys' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authError = await authMiddleware(req);
    if (authError) return authError;

    const { key } = await req.json();
    const newKey = await addApiKey(key);
    await logAuditAction('add_key', `New key added: ${newKey.id}`);
    return NextResponse.json({ success: true, key: newKey });
  } catch (error: any) {
    console.error('Error adding key:', error);
    return NextResponse.json({ error: error.message || 'Failed to add key' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authError = await authMiddleware(req);
    if (authError) return authError;

    const { id } = await req.json();
    await deleteApiKey(id);
    await logAuditAction('remove_key', `Key removed: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting key:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete key' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authError = await authMiddleware(req);
    if (authError) return authError;

    const { id } = await req.json();
    const updatedKey = await toggleApiKeyStatus(id);
    if (updatedKey) {
      await logAuditAction('toggle_key', `Key ${id} status toggled to ${updatedKey.isActive}`);
      return NextResponse.json({ success: true, key: updatedKey });
    }
    return NextResponse.json({ error: 'Key not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Error updating key:', error);
    return NextResponse.json({ error: error.message || 'Failed to update key' }, { status: 500 });
  }
}
