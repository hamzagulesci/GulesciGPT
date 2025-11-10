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
}

export function Sidebar({
  chats,
  currentChatId,
  selectedModel,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onModelChange,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">GüleşciGPT</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <Button
          onClick={() => {
            onNewChat()
            setIsOpen(false)
          }}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sohbet
        </Button>
      </div>

      {/* Model Selector */}
      <div className="p-4 border-b border-gray-700">
        <label className="text-sm text-gray-400 mb-2 block">Model Seçin</label>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          className="w-full bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {chats.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              Henüz sohbet yok
            </p>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.chatId}
                className={cn(
                  "group relative rounded-lg p-3 cursor-pointer transition-colors",
                  currentChatId === chat.chatId
                    ? "bg-gray-700"
                    : "hover:bg-gray-800"
                )}
                onClick={() => {
                  onSelectChat(chat.chatId)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(chat.chatId)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-600 rounded"
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
      <div className="p-4 border-t border-gray-700">
        <div
          id="ad-sidebar"
          className="w-full h-[250px] bg-gray-800 flex items-center justify-center text-gray-500 text-sm"
        >
          Reklam Alanı (300x250)
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
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
