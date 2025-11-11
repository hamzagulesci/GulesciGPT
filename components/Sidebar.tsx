'use client'

import { useState } from 'react'
import { Plus, Trash2, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Chat } from '@/lib/localStorage'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { ModelSelector } from './ModelSelector'

interface SidebarProps {
  chats: Chat[]
  currentChatId: string | null
  selectedModel: string
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
  onDeleteChat: (chatId: string) => void
  onModelChange: (modelId: string) => void
  isOpen?: boolean
  onToggle?: () => void
}

export function Sidebar({
  chats,
  currentChatId,
  selectedModel,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onModelChange,
  isOpen: externalIsOpen,
  onToggle,
}: SidebarProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen

  const toggleSidebar = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(!isOpen)
    }
  }

  const sidebarContent = (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)',
        boxShadow: '0px 2px 6px var(--shadow)'
      }}
    >
      {/* Header */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            GüleşciGPT
          </h1>
          <button
            onClick={toggleSidebar}
            className="lg:hidden transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-action-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            aria-label="Menüyü kapat"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <Button
          onClick={() => {
            onNewChat()
            if (window.innerWidth < 1024) toggleSidebar()
          }}
          className="w-full"
          style={{
            background: 'var(--color-action)',
            color: 'var(--text-primary)'
          }}
          aria-label="Yeni sohbet başlat"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sohbet
        </Button>
      </div>

      {/* Model Selector */}
      <div className="p-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <label
          className="text-sm mb-2 block"
          style={{ color: 'var(--text-tertiary)' }}
          htmlFor="model-selector"
        >
          Model Seçin
        </label>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          className="w-full"
        />
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {chats.length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
              Henüz sohbet yok
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chatId}
                className="group relative rounded-lg p-3 cursor-pointer transition-colors"
                style={{
                  background: currentChatId === chat.chatId ? 'rgba(30, 144, 255, 0.15)' : 'transparent',
                  borderLeft: currentChatId === chat.chatId ? '3px solid var(--color-action)' : '3px solid transparent'
                }}
                onMouseEnter={(e) => {
                  if (currentChatId !== chat.chatId) {
                    e.currentTarget.style.background = 'rgba(30, 144, 255, 0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentChatId !== chat.chatId) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
                onClick={() => {
                  onSelectChat(chat.chatId)
                  if (window.innerWidth < 1024) toggleSidebar()
                }}
                role="button"
                tabIndex={0}
                aria-label={`Sohbet: ${chat.title}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-secondary)' }}>
                      {chat.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(chat.chatId)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ background: 'var(--color-alert)' }}
                    aria-label={`${chat.title} sohbetini sil`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ad Space - Sidebar Bottom */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div id="ad-sidebar" className="w-full h-[250px]"></div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={toggleSidebar}
          aria-label="Menüyü kapat"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-50 w-80 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
