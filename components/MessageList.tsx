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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
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
                isUser
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-100 text-gray-900"
              )}
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
                          <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props} />
                        ) : (
                          <code className="block bg-gray-800 text-gray-100 p-2 rounded my-2 overflow-x-auto" {...props} />
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
          <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500">Yazıyor...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
