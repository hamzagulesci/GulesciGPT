import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { addApiKey, listApiKeys, deleteApiKey, toggleApiKeyStatus } from '@/lib/keyManager';
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
  const authError = await authMiddleware(req);
  if (authError) return authError;

  const keys = await listApiKeys();
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  try {
    const { key } = await req.json();
    if (!key || !key.trim()) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const newKey = await addApiKey(key.trim());
    
    if (!newKey || !newKey.id) {
      throw new Error('API key oluşturulamadı');
    }

    await logAuditAction('add_key', `API key added: ${newKey.id}`);
    return NextResponse.json({ newKey });
  } catch (error: any) {
    console.error('API key add error:', error);
    const errorMessage = error.message || 'API key eklenemedi';
    
    // KV hatası mı kontrol et
    if (errorMessage.includes('KV') || errorMessage.includes('namespace')) {
      return NextResponse.json({ 
        error: 'KV storage erişilemiyor. Cloudflare Pages\'de KV binding kontrolü yapın: Settings → Functions → KV namespace bindings' 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }
    await deleteApiKey(id);
    await logAuditAction('remove_key', `API key removed: ${id}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const authError = await authMiddleware(req);
  if (authError) return authError;

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
    }
    const updatedKey = await toggleApiKeyStatus(id);
    if (updatedKey) {
      await logAuditAction('toggle_key', `API key ${id} status toggled to ${updatedKey.isActive}`);
      return NextResponse.json({ updatedKey });
    } else {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
