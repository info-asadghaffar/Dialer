export type CallDirection = 'inbound' | 'outbound'
export type CallStatus = 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer'

export interface Call {
  id: string
  callSid: string
  direction: CallDirection
  status: CallStatus
  fromNumber: string
  toNumber: string
  twilioNumber: string
  duration: number       // seconds
  startedAt: string | null
  endedAt: string | null
  createdAt: string
}

export interface ActiveCall {
  callSid: string
  toNumber: string
  fromNumber: string
  direction: CallDirection
  status: CallStatus
  startTime: Date
  isMuted: boolean
  isOnHold: boolean
  isSpeakerOn: boolean
}
