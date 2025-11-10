// LocalStorage helper functions (client-side)

import { ChatMessage } from './openrouter'

export interface Chat {
  chatId: string
  title: string
  model: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  thinking?: string // DeepSeek R1 için düşünce süreci
}

const CHATS_KEY = 'gulescigpt_chats'
const SELECTED_MODEL_KEY = 'gulescigpt_selected_model'
const MAX_CHATS = 50

// Tüm chat'leri al
export function getAllChats(): Chat[] {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(CHATS_KEY)
    if (!data) return []

    const chats: Chat[] = JSON.parse(data)
    // updatedAt'e göre sırala (en yeni üstte)
    return chats.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  } catch (error) {
    console.error('Chat yükleme hatası:', error)
    return []
  }
}

// Tek bir chat'i al
export function getChat(chatId: string): Chat | null {
  const chats = getAllChats()
  return chats.find(c => c.chatId === chatId) || null
}

// Chat kaydet veya güncelle
export function saveChat(chat: Chat): void {
  if (typeof window === 'undefined') return

  try {
    let chats = getAllChats()

    // Mevcut chat'i bul
    const existingIndex = chats.findIndex(c => c.chatId === chat.chatId)

    if (existingIndex >= 0) {
      // Güncelle
      chats[existingIndex] = chat
    } else {
      // Yeni ekle
      chats.push(chat)

      // Max 50 chat tut, en eskiyi sil
      if (chats.length > MAX_CHATS) {
        chats = chats.slice(-MAX_CHATS)
      }
    }

    localStorage.setItem(CHATS_KEY, JSON.stringify(chats))
  } catch (error) {
    console.error('Chat kaydetme hatası:', error)
  }
}

// Chat sil
export function deleteChat(chatId: string): void {
  if (typeof window === 'undefined') return

  try {
    const chats = getAllChats()
    const filtered = chats.filter(c => c.chatId !== chatId)
    localStorage.setItem(CHATS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Chat silme hatası:', error)
  }
}

// Seçili modeli kaydet
export function setSelectedModel(modelId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SELECTED_MODEL_KEY, modelId)
}

// Seçili modeli al
export function getSelectedModel(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SELECTED_MODEL_KEY)
}

// Yeni chat oluştur
export function createNewChat(model: string): Chat {
  return {
    chatId: crypto.randomUUID(),
    title: 'Yeni Sohbet',
    model,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

// Chat title güncelle (ilk mesajdan)
export function updateChatTitle(chat: Chat): Chat {
  if (chat.messages.length > 0 && chat.title === 'Yeni Sohbet') {
    const firstUserMessage = chat.messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      const content = firstUserMessage.content
      chat.title = content.length > 30 ? content.substring(0, 30) + '...' : content
    }
  }
  return chat
}
