// OpenRouter API client

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OpenRouterResponse {
  id: string
  model: string
  choices: {
    message: {
      role: string
      content: string
      reasoning_content?: string // DeepSeek R1 için
    }
    finish_reason: string
  }[]
}

export interface StreamChunk {
  id: string
  choices: {
    delta: {
      content?: string
      reasoning_content?: string
    }
    finish_reason: string | null
  }[]
}

// OpenRouter API'ye chat isteği gönder (streaming)
export async function sendChatRequest(
  model: string,
  messages: ChatMessage[],
  apiKey: string,
  onChunk?: (content: string, reasoning?: string) => void
): Promise<{ content: string; reasoning?: string }> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://gulescigpt.com',
      'X-Title': 'HamzaGPT'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API hatası: ${response.status} - ${errorText}`)
  }

  if (!response.body) {
    throw new Error('Response body bulunamadı')
  }

  // Server-Sent Events (SSE) stream'ini oku
  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  let fullContent = ''
  let fullReasoning = ''

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
            break
          }

          try {
            const parsed: StreamChunk = JSON.parse(data)

            if (parsed.choices && parsed.choices[0]) {
              const delta = parsed.choices[0].delta

              if (delta.content) {
                fullContent += delta.content
                if (onChunk) {
                  onChunk(delta.content, undefined)
                }
              }

              if (delta.reasoning_content) {
                fullReasoning += delta.reasoning_content
                if (onChunk) {
                  onChunk('', delta.reasoning_content)
                }
              }
            }
          } catch (parseError) {
            console.error('JSON parse hatası:', parseError)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return {
    content: fullContent,
    reasoning: fullReasoning || undefined
  }
}

// Non-streaming version (basit kullanım için)
export async function sendChatRequestSimple(
  model: string,
  messages: ChatMessage[],
  apiKey: string
): Promise<{ content: string; reasoning?: string }> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://gulescigpt.com',
      'X-Title': 'HamzaGPT'
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter API hatası: ${response.status} - ${errorText}`)
  }

  const data: OpenRouterResponse = await response.json()

  if (!data.choices || data.choices.length === 0) {
    throw new Error('API yanıtı boş')
  }

  return {
    content: data.choices[0].message.content,
    reasoning: data.choices[0].message.reasoning_content
  }
}
