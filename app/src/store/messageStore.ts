import { create } from 'zustand'
import { Conversation, Message } from '../types/message.types'

interface MessageState {
  conversations: Conversation[]
  activeMessages: Message[]
  isLoading: boolean
  
  setConversations: (conversations: Conversation[]) => void
  setActiveMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessageStatus: (messageSid: string, status: Message['status']) => void
  markAsRead: (contactNumber: string) => void
}

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  activeMessages: [],
  isLoading: false,

  setConversations: (conversations) => set({ conversations }),
  
  setActiveMessages: (messages) => set({ activeMessages: messages }),
  
  addMessage: (message) => set((state) => ({
    activeMessages: [...state.activeMessages, message]
  })),

  updateMessageStatus: (messageSid, status) => set((state) => ({
    activeMessages: state.activeMessages.map(m => 
        m.messageSid === messageSid ? { ...m, status } : m
    )
  })),

  markAsRead: (contactNumber) => set((state) => ({
    conversations: state.conversations.map(c => 
        c.contactNumber === contactNumber ? { ...c, unreadCount: 0 } : c
    )
  }))
}))
