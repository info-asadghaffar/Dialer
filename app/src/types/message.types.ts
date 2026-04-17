export type MessageDirection = 'inbound' | 'outbound'
export type MessageStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'received'

export interface Message {
  id: string
  messageSid: string
  direction: MessageDirection
  status: MessageStatus
  fromNumber: string
  toNumber: string
  twilioNumber: string
  body: string
  createdAt: string
}

export interface Conversation {
  contactNumber: string
  lastMessage: Message
  unreadCount: number
  twilioNumber: string
}
