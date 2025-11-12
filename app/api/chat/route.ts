import { NextRequest, NextResponse } from 'next/server';
import { getActiveApiKey, markKeyAsFailed, updateKeyUsage } from '@/lib/keyManager';
import { incrementMessageCount, addResponseTime } from '@/lib/statsManager';
import { checkRateLimit } from '@/lib/rateLimit';
import { logError } from '@/lib/errorLogger';
import { trackTokenUsage } from '@/lib/tokenTracker';
import { isValidString } from '@/lib/validation';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimit = await checkRateLimit(`chat:${ip}`, 20, 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { messages, model } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0 || !isValidString(model, 200)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let apiKeyObj = await getActiveApiKey();
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      if (!apiKeyObj) {
        return NextResponse.json({ error: 'System busy, please try again later.' }, { status: 503 });
      }

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeyObj.key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://hamzagpt.com',
            'X-Title': 'HamzaGPT'
          },
          body: JSON.stringify({ model, messages, stream: true })
        });

        if (response.status === 401) {
          console.warn(`API key ${apiKeyObj.id} is invalid. Marking as failed.`);
          await markKeyAsFailed(apiKeyObj.id);
          apiKeyObj = await getActiveApiKey();
          retryCount++;
          continue;
        }

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        await updateKeyUsage(apiKeyObj.id);

        let accumulatedOutput = '';
        const stream = new ReadableStream({
          async start(controller) {
            const reader = response.body!.getReader();
            const decoder = new TextDecoder();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                accumulatedOutput += chunk;
                controller.enqueue(value);
              }
            } catch (error) {
              console.error('Stream reading error:', error);
              controller.error(error);
            } finally {
              const responseTime = Date.now() - startTime;
              await incrementMessageCount(model);
              await addResponseTime(responseTime);
              // Token tracking can be added here if needed
              controller.close();
            }
          }
        });

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (error) {
        if (apiKeyObj) {
          console.error(`Attempt ${retryCount + 1} failed for key ${apiKeyObj.id}:`, error);
        } else {
          console.error(`Attempt ${retryCount + 1} failed as no API key was available.`, error);
        }
        apiKeyObj = await getActiveApiKey(); // Get a new key for the next attempt
        retryCount++;
      }
    }

    return NextResponse.json({ error: 'Failed to get response from AI after multiple retries.' }, { status: 500 });

  } catch (error: any) {
    await logError('chat', 'Unhandled API error', { message: error.message });
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}
