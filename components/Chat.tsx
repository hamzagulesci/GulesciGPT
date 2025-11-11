'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { Sidebar } from './Sidebar'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { ModelSelector } from './ModelSelector'
import {
  getAllChats,
  saveChat,
  deleteChat as deleteLocalChat,
  getSelectedModel,
  setSelectedModel,
  createNewChat,
  updateChatTitle,
  type Chat as ChatType,
} from '@/lib/localStorage'
import { DEFAULT_MODEL, isDeepSeekR1Model } from '@/lib/models'
import { ChatMessage } from '@/lib/openrouter'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Message extends ChatMessage {
  thinking?: string
}

export function Chat() {
  const [chats, setChats] = useState<ChatType[]>([])
  const [currentChat, setCurrentChat] = useState<ChatType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModelState] = useState(DEFAULT_MODEL)
  const [showModelChangeDialog, setShowModelChangeDialog] = useState(false)
  const [pendingModel, setPendingModel] = useState<string | null>(null)

  // Load chats ve selected model on mount
  useEffect(() => {
    const loadedChats = getAllChats()
    setChats(loadedChats)

    const savedModel = getSelectedModel()
    if (savedModel) {
      setSelectedModelState(savedModel)
    }

    // İlk chat'i yükle veya yeni oluştur
    if (loadedChats.length > 0) {
      handleSelectChat(loadedChats[0].chatId)
    } else {
      handleNewChat()
    }
  }, [])

  const handleNewChat = useCallback(() => {
    const newChat = createNewChat(selectedModel)
    setCurrentChat(newChat)
    setMessages([])
    saveChat(newChat)
    setChats(getAllChats())
  }, [selectedModel])

  const handleSelectChat = useCallback((chatId: string) => {
    const chat = getAllChats().find(c => c.chatId === chatId)
    if (chat) {
      setCurrentChat(chat)
      setMessages(chat.messages.map(m => ({
        ...m,
        thinking: (m as any).thinking
      })))
    }
  }, [])

  const handleDeleteChat = useCallback((chatId: string) => {
    deleteLocalChat(chatId)
    setChats(getAllChats())

    if (currentChat?.chatId === chatId) {
      const remaining = getAllChats()
      if (remaining.length > 0) {
        handleSelectChat(remaining[0].chatId)
      } else {
        handleNewChat()
      }
    }

    toast.success('Sohbet silindi')
  }, [currentChat?.chatId, handleNewChat, handleSelectChat])

  const handleModelChange = useCallback((newModel: string) => {
    if (newModel === selectedModel) return

    // Eğer chat'te mesaj varsa, modal göster
    if (messages.length > 0) {
      setPendingModel(newModel)
      setShowModelChangeDialog(true)
    } else {
      // Mesaj yoksa direkt değiştir
      setSelectedModelState(newModel)
      setSelectedModel(newModel)

      if (currentChat) {
        const updated = { ...currentChat, model: newModel }
        setCurrentChat(updated)
        saveChat(updated)
      }
    }
  }, [selectedModel, messages.length, currentChat])

  const confirmModelChange = useCallback(() => {
    if (!pendingModel) return

    setSelectedModelState(pendingModel)
    setSelectedModel(pendingModel)

    // Yeni chat başlat
    const newChat = createNewChat(pendingModel)
    setCurrentChat(newChat)
    setMessages([])
    saveChat(newChat)
    setChats(getAllChats())

    setShowModelChangeDialog(false)
    setPendingModel(null)
    toast.success('Yeni sohbet başlatıldı')
  }, [pendingModel])

  const cancelModelChange = useCallback(() => {
    setShowModelChangeDialog(false)
    setPendingModel(null)
  }, [])

  const handleSendMessage = async (content: string, captchaToken: string) => {
    if (!currentChat) return

    const userMessage: Message = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // API'ye istek gönder
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          captchaToken,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Sunucu hatası' }))

        // Hata mesajını daha açıklayıcı yap
        let errorMessage = error.error || 'Bir hata oluştu'

        if (response.status === 503) {
          errorMessage = '⚠️ API key bulunamadı veya tükendi. Lütfen sistem yöneticisinin sorunu çözmesini bekleyin (genellikle 1 saat içinde düzeltilir).'
        } else if (response.status === 403) {
          errorMessage = '🔒 CAPTCHA doğrulaması başarısız\n\n' +
                        'Development modunda olmalısınız ama CAPTCHA key\'leri girilmiş.\n' +
                        '.env.local dosyasındaki CAPTCHA satırlarını boşaltın.'
        }

        throw new Error(errorMessage)
      }

      // SSE stream'ini oku
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      let assistantContent = ''
      let assistantThinking = ''

      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        thinking: ''
      }

      setMessages([...newMessages, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6)

            try {
              const parsed = JSON.parse(data)

              if (parsed.type === 'content') {
                assistantContent += parsed.data
              } else if (parsed.type === 'reasoning') {
                assistantThinking += parsed.data
              }

              // UI'ı güncelle
              setMessages([...newMessages, {
                role: 'assistant',
                content: assistantContent,
                thinking: assistantThinking || undefined
              }])
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Chat'i kaydet
      const finalMessages = [
        ...newMessages,
        {
          role: 'assistant' as const,
          content: assistantContent,
          thinking: assistantThinking || undefined
        }
      ]

      const updatedChat = {
        ...currentChat,
        messages: finalMessages,
        updatedAt: new Date().toISOString()
      }

      // İlk mesajsa, title güncelle
      const chatWithTitle = updateChatTitle(updatedChat)
      setCurrentChat(chatWithTitle)
      saveChat(chatWithTitle)
      setChats(getAllChats())
      setMessages(finalMessages)

    } catch (error: any) {
      console.error('Chat hatası:', error)

      // Daha uzun toast için duration artır
      toast.error(error.message || 'Mesaj gönderilemedi', {
        duration: 10000, // 10 saniye
        style: {
          whiteSpace: 'pre-line', // Satır atlamalarını göster
        }
      })

      // Kullanıcı mesajını geri al
      setMessages(messages)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex h-screen">
        <Sidebar
          chats={chats}
          currentChatId={currentChat?.chatId || null}
          selectedModel={selectedModel}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onModelChange={handleModelChange}
        />

        <main className="flex-1 flex flex-col">
          {/* Top Bar - Navbar */}
          <div
            className="p-3 md:p-4 flex items-center justify-between shadow-sm"
            style={{
              background: 'var(--bg-navbar)',
              borderBottom: '1px solid var(--border-color)',
              boxShadow: '0px 2px 4px var(--shadow)'
            }}
          >
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-base md:text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {currentChat?.title || 'Yeni Sohbet'}
              </h2>
              <p className="text-xs md:text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                Model: {selectedModel.split('/').pop()?.split(':')[0]}
              </p>
            </div>

            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              className="w-32 md:w-48 lg:w-64 flex-shrink-0"
            />
          </div>

          {/* Messages */}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            modelId={selectedModel}
          />

          {/* Input */}
          <MessageInput
            onSend={handleSendMessage}
            disabled={isLoading}
          />
        </main>
      </div>

      {/* Model Change Dialog */}
      <Dialog open={showModelChangeDialog} onOpenChange={setShowModelChangeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Model Değiştirildi</DialogTitle>
            <DialogDescription>
              Yeni model için yeni sohbet başlatılsın mı?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelModelChange}>
              Hayır, İptal Et
            </Button>
            <Button onClick={confirmModelChange}>
              Evet, Yeni Sohbet Başlat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
