import { NextRequest, NextResponse } from 'next/server'
import { getActiveKey, markKeyAsFailed, updateKeyUsage } from '@/lib/keyManager'
import { incrementMessageCount, addResponseTime } from '@/lib/statsManager'
import { ChatMessage } from '@/lib/openrouter'
import { isDeepSeekR1Model } from '@/lib/models'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { messages, model, captchaToken } = await request.json()

    // CAPTCHA doğrulaması
    if (!captchaToken) {
      return NextResponse.json(
        { error: 'CAPTCHA token bulunamadı' },
        { status: 400 }
      )
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: captchaToken,
        }),
      }
    )

    const verifyData = await verifyResponse.json()

    if (!verifyData.success) {
      return NextResponse.json(
        { error: 'CAPTCHA doğrulaması başarısız' },
        { status: 403 }
      )
    }

    // Aktif API key al
    let apiKey = getActiveKey()
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
            'X-Title': 'GüleşciGPT'
          },
          body: JSON.stringify({
            model,
            messages,
            stream: true
          })
        })

        // Rate limit kontrolü
        if (response.status === 429) {
          console.log(`API key ${apiKey.id} rate limit'e takıldı, rotate ediliyor...`)
          await markKeyAsFailed(apiKey.id)
          apiKey = getActiveKey()
          retryCount++
          continue
        }

        if (!response.ok) {
          const errorText = await response.text()
          console.error('OpenRouter API hatası:', response.status, errorText)

          // 401 hatası - invalid key
          if (response.status === 401) {
            await markKeyAsFailed(apiKey.id)
            apiKey = getActiveKey()
            retryCount++
            continue
          }

          return NextResponse.json(
            { error: 'AI yanıtı alınamadı' },
            { status: 500 }
          )
        }

        // Başarılı istek - key kullanımını güncelle
        await updateKeyUsage(apiKey.id)

        // Streaming response oluştur
        const encoder = new TextEncoder()
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
            } catch (error) {
              console.error('Stream okuma hatası:', error)
              controller.error(error)
            } finally {
              reader.releaseLock()

              // İstatistikleri güncelle
              const responseTime = Date.now() - startTime
              await incrementMessageCount(model)
              await addResponseTime(responseTime)
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

  } catch (error) {
    console.error('Chat API hatası:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
