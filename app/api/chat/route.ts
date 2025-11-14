import { NextRequest, NextResponse } from 'next/server';
import { getActiveApiKeysInOrder, markKeyAsFailed, updateKeyUsage } from '@/lib/keyManager';
import { incrementMessageCount, addResponseTime } from '@/lib/statsManager';
import { checkRateLimit } from '@/lib/rateLimit';
import { logError } from '@/lib/errorLogger';
import { trackTokenUsage } from '@/lib/tokenTracker';
import { isValidString } from '@/lib/validation';
import { getDefaultModelId } from '@/lib/settings';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimit = await checkRateLimit(`chat:${ip}`, 20, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'Çok fazla istek gönderildi. Lütfen kısa bir süre bekleyin veya farklı bir modeli seçip yeni bir sohbet başlatın.'
      }, { status: 429 });
    }

    const body = await request.json();
    const messages = body?.messages;
    let model: string | null = body?.model;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    if (!isValidString(model ?? '', 200)) {
      model = await getDefaultModelId();
    }
    const modelId: string = model as string;

    const keys = await getActiveApiKeysInOrder();
    if (!keys || keys.length === 0) {
      return NextResponse.json({
        error: 'Sistem meşgul ya da API anahtarı bulunamadı. Lütfen daha sonra tekrar deneyin veya farklı bir modeli seçip yeni bir sohbet başlatın.'
      }, { status: 503 });
    }

    for (const apiKeyObj of keys) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeyObj.key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://hamzagpt.com',
            'X-Title': 'HamzaGPT'
          },
          body: JSON.stringify({ model: modelId, messages, stream: true })
        });

        if (response.status === 401) {
          console.warn(`API key ${apiKeyObj.id} is invalid. Marking as failed.`);
          await markKeyAsFailed(apiKeyObj.id);
          continue; // try next key immediately
        }

        if (!response.ok) {
          // try next key immediately on any non-2xx
          continue;
        }

        const currentKeyId = apiKeyObj.id;
        const stream = new ReadableStream({
          async start(controller) {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            let buffer = '';
            let deliveredAnyContent = false;

            const sendEvent = (obj: any) => {
              const line = `data: ${JSON.stringify(obj)}\n\n`;
              controller.enqueue(encoder.encode(line));
            };

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete lines only; keep remainder in buffer
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed) continue;

                  // Ignore comment/keep-alive lines
                  if (trimmed.startsWith(':')) continue;

                  if (trimmed.startsWith('data:')) {
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') {
                      continue;
                    }
                    try {
                      const json = JSON.parse(data);
                      const choices = json.choices || [];
                      for (const choice of choices) {
                        const delta = choice?.delta || {};
                        if (typeof delta.content === 'string' && delta.content) {
                          deliveredAnyContent = true;
                          sendEvent({ type: 'content', data: delta.content });
                        }
                        // Attempt to forward any reasoning-like field if present
                        if (typeof (delta as any).reasoning === 'string' && (delta as any).reasoning) {
                          sendEvent({ type: 'reasoning', data: (delta as any).reasoning });
                        }
                        if (typeof (delta as any).reasoning_content === 'string' && (delta as any).reasoning_content) {
                          sendEvent({ type: 'reasoning', data: (delta as any).reasoning_content });
                        }
                      }
                    } catch {
                      // ignore JSON parse errors from non-JSON data lines
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Stream reading error:', error);
              controller.error(error);
            } finally {
              const responseTime = Date.now() - startTime;
              if (deliveredAnyContent) {
                await incrementMessageCount(modelId);
                await addResponseTime(responseTime);
                await updateKeyUsage(currentKeyId);
              }
              controller.close();
            }
          }
        });

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
          },
        });

      } catch (error) {
        console.error(`Key ${apiKeyObj.id} failed with error:`, error);
        // try next key
      }
    }

    return NextResponse.json({
      error: 'Model şu an yoğun, lütfen tekrar deneyin.'
    }, { status: 500 });

  } catch (error: any) {
    await logError('chat', 'Unhandled API error', { message: error.message });
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
