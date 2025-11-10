'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/lib/openrouter'
import { ThinkingSection } from './ThinkingSection'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface Message extends ChatMessage {
  thinking?: string
}

interface MessageListProps {
  messages: Message[]
  isLoading?: boolean
  modelId: string
}

export function MessageList({ messages, isLoading, modelId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Otomatik scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center" style={{ color: 'var(--text-tertiary)' }}>
          <p className="text-xl font-medium mb-2">Sohbet başlat!</p>
          <p className="text-sm">Aşağıdaki input alanından mesaj göndererek başlayın</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
      style={{ background: 'var(--bg-primary)' }}
    >
      {messages.map((message, index) => {
        const isUser = message.role === 'user'
        const isDeepSeekR1 = modelId.toLowerCase().includes('deepseek') &&
                             modelId.toLowerCase().includes('r1')

        return (
          <div
            key={index}
            className={cn(
              "flex",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-lg px-4 py-3",
                isUser ? "ml-auto" : ""
              )}
              style={isUser
                ? { background: 'var(--color-action)', color: 'var(--text-primary)' }
                : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }
              }
            >
              {/* DeepSeek R1 için düşünce süreci */}
              {!isUser && isDeepSeekR1 && message.thinking && (
                <ThinkingSection thinking={message.thinking} />
              )}

              {/* Mesaj içeriği */}
              <div className={cn(
                "prose prose-sm max-w-none",
                isUser ? "prose-invert" : ""
              )}>
                {isUser ? (
                  <p className="whitespace-pre-wrap m-0">{message.content}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="m-0 mb-2 last:mb-0" {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ? (
                          <code style={{ background: '#2C2C2C', color: 'var(--text-secondary)' }} className="px-1 py-0.5 rounded text-sm" {...props} />
                        ) : (
                          <code style={{ background: '#0D0D0D', color: 'var(--text-secondary)' }} className="block p-3 rounded my-2 overflow-x-auto font-mono text-sm" {...props} />
                        ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-[80%] rounded-lg px-4 py-3" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-action)', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-action)', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--color-action)', animationDelay: '300ms' }} />
              </div>
              <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Yazıyor...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
