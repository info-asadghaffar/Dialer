import { create } from 'zustand'
import { ActiveCall, Call, CallStatus } from '../types/call.types'

interface CallState {
  activeCall: ActiveCall | null
  callHistory: Call[]
  isLoading: boolean
  accessToken: string | null
  tokenExpiry: string | null
  
  setActiveCall: (call: ActiveCall | null) => void
  clearActiveCall: () => void
  setCallHistory: (calls: Call[]) => void
  setAccessToken: (token: string, expiry: string) => void
  updateCallStatus: (callSid: string, status: CallStatus) => void
  toggleMute: () => void
  toggleHold: () => void
  toggleSpeaker: () => void
}

export const useCallStore = create<CallState>((set) => ({
  activeCall: null,
  callHistory: [],
  isLoading: false,
  accessToken: null,
  tokenExpiry: null,

  setActiveCall: (call) => set({ activeCall: call }),
  
  clearActiveCall: () => set({ activeCall: null }),
  
  setCallHistory: (calls) => set({ callHistory: calls }),
  
  setAccessToken: (token, expiry) => set({ 
    accessToken: token, 
    tokenExpiry: expiry 
  }),
  
  updateCallStatus: (callSid, status) => set((state) => ({
    activeCall: state.activeCall?.callSid === callSid 
      ? { ...state.activeCall, status } 
      : state.activeCall
  })),
  
  toggleMute: () => set((state) => ({
    activeCall: state.activeCall 
      ? { ...state.activeCall, isMuted: !state.activeCall.isMuted } 
      : null
  })),
  
  toggleHold: () => set((state) => ({
    activeCall: state.activeCall 
      ? { ...state.activeCall, isOnHold: !state.activeCall.isOnHold } 
      : null
  })),
  
  toggleSpeaker: () => set((state) => ({
    activeCall: state.activeCall 
      ? { ...state.activeCall, isSpeakerOn: !state.activeCall.isSpeakerOn } 
      : null
  }))
}))
