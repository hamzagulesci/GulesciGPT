import { NextRequest, NextResponse } from 'next/server'
import { getActiveKey, markKeyAsFailed, updateKeyUsage } from '@/lib/keyManager'
import { incrementMessageCount, addResponseTime } from '@/lib/statsManager'
import { ChatMessage } from '@/lib/openrouter'
import { isDeepSeekR1Model } from '@/lib/models'
import { isValidString } from '@/lib/validation'
import { checkRateLimit } from '@/lib/rateLimit'
import { logError } from '@/lib/errorLogger'
import { trackTokenUsage } from '@/lib/tokenTracker'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // IP-based rate limiting (20 mesaj / dakika)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    const rateLimitKey = `chat:${ip}`
    const rateLimit = checkRateLimit(rateLimitKey, 20, 60 * 1000) // 20 req/min

    if (!rateLimit.allowed) {
      await logError('chat', 'Rate limit exceeded', {
        message: `IP: ${ip}`,
        ip,
        userAgent: request.headers.get('user-agent') || undefined,
        endpoint: '/api/chat',
        statusCode: 429
      })
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen bir dakika bekleyin.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0'
          }
        }
      )
    }

    const { messages, model } = await request.json()

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Geçersiz mesaj formatı' },
        { status: 400 }
      )
    }

    if (!model || typeof model !== 'string' || !isValidString(model, 200)) {
      return NextResponse.json(
        { error: 'Geçersiz model parametresi' },
        { status: 400 }
      )
    }

    // Mesaj sayısı limiti
    if (messages.length > 100) {
      return NextResponse.json(
        { error: 'Çok fazla mesaj (max: 100)' },
        { status: 400 }
      )
    }

    // Her mesajı validate et
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== 'string') {
        return NextResponse.json(
          { error: 'Geçersiz mesaj içeriği' },
          { status: 400 }
        )
      }

      // Maksimum mesaj uzunluğu: 50KB
      if (msg.content.length > 50000) {
        return NextResponse.json(
          { error: 'Mesaj çok uzun (max: 50KB)' },
          { status: 400 }
        )
      }
    }

    console.log('🔵 Chat request received:', { model, messageCount: messages.length })

    // Aktif API key al
    let apiKey = getActiveKey()
    console.log('🔵 API Key check:', { hasKey: !!apiKey, keyId: apiKey?.id })

    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Sistem şu anda yoğun, lütfen daha sonra tekrar deneyin.' },
          { status: 503 }
        )
      }

      try {
        // OpenRouter API isteği (streaming)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey.key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://gulescigpt.com',
            'X-Title': 'GulesciGPT'
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true
          })
        })

        // Rate limit kontrolü (geçici durum - key'i pasife çekme!)
        if (response.status === 429) {
          console.log(`API key ${apiKey.id} rate limit'e takıldı - geçici hata`)
          return NextResponse.json(
            { error: 'Sistem şu anda yoğun, lütfen birkaç saniye sonra tekrar deneyin.' },
            { status: 503 }
          )
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API hatası:', response.status, errorText)

          // 401 hatası - invalid key
          if (response.status === 401) {
            await logError('api', 'OpenRouter API 401 - Invalid key', {
              message: `Key ID: ${apiKey.id}, Error: ${errorText.substring(0, 200)}`,
              endpoint: '/api/chat',
              statusCode: 401
            })
            await markKeyAsFailed(apiKey.id)
            apiKey = getActiveKey()
            retryCount++
            continue
          }

          await logError('api', 'OpenRouter API error', {
            message: `Status: ${response.status}, Error: ${errorText.substring(0, 200)}`,
            endpoint: '/api/chat',
            statusCode: response.status
          })

          return NextResponse.json(
            { error: 'AI yanıtı alınamadı' },
            { status: 500 }
          )
        }

        // Başarılı istek - key kullanımını güncelle
        await updateKeyUsage(apiKey.id)

        // Streaming response oluştur
        const encoder = new TextEncoder()
        let accumulatedOutput = '' // Track output for token counting
        const stream = new ReadableStream({
          async start(controller) {
            const reader = response.body!.getReader()
            const decoder = new TextDecoder()

            try {
              while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n').filter(line => line.trim() !== '')

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    const data = line.substring(6)

                    if (data === '[DONE]') {
                      controller.close()
                      break
                    }

                    try {
                      const parsed = JSON.parse(data)

                      // DeepSeek R1 için reasoning/thinking desteği
                      if (parsed.choices && parsed.choices[0]) {
                        const delta = parsed.choices[0].delta

                        // Normal content
                        if (delta.content) {
                          accumulatedOutput += delta.content
                          controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ type: 'content', data: delta.content })}\n\n`)
                          )
                        }

                        // Reasoning content (DeepSeek R1)
                        if (delta.reasoning_content) {
                          controller.enqueue(
                            encoder.encode(`data: ${JSON.stringify({ type: 'reasoning', data: delta.reasoning_content })}\n\n`)
                          )
                        }
                      }
                    } catch (parseError) {
                      console.error('JSON parse hatası:', parseError)
                    }
                  }
                }
              }
            } catch (error: any) {
              console.error('Stream okuma hatası:', error)
              await logError('chat', 'Stream reading error', {
                message: error.message || 'Unknown stream error',
                endpoint: '/api/chat'
              })
              controller.error(error)
            } finally {
              reader.releaseLock()

              // İstatistikleri güncelle
              const responseTime = Date.now() - startTime
              await incrementMessageCount(model)
              await addResponseTime(responseTime)

              // Token kullanımını takip et
              try {
                const inputText = messages.map((m: any) => m.content).join('\n')
                await trackTokenUsage(model, inputText, accumulatedOutput)
              } catch (tokenError) {
                console.error('Token tracking hatası:', tokenError)
              }
            }
          }
        })

        return new NextResponse(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        })

      } catch (error) {
        console.error('API isteği hatası:', error)
        retryCount++

        if (retryCount >= maxRetries) {
          return NextResponse.json(
            { error: 'Bağlantı hatası, lütfen tekrar deneyin' },
            { status: 500 }
          )
        }
      }
    }

    // Tüm retry'lar başarısız
    return NextResponse.json(
      { error: 'Sistem şu anda yoğun, lütfen daha sonra tekrar deneyin.' },
      { status: 503 }
    )

  } catch (error: any) {
    console.error('❌ Chat API FATAL ERROR:', error)
    console.error('❌ Error stack:', error.stack)
    console.error('❌ Error message:', error.message)

    await logError('system', 'Chat API fatal error', {
      message: `${error.message}\n${error.stack?.substring(0, 500) || ''}`,
      endpoint: '/api/chat',
      statusCode: 500
    })

    return NextResponse.json(
      { error: `Sunucu hatası: ${error.message}` },
      { status: 500 }
    )
  }
}
