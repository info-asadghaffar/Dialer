import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AppSettings } from '../types/settings.types'

interface SettingsState {
  settings: AppSettings | null
  isLoading: boolean
  connectionStatus: 'idle' | 'testing' | 'connected' | 'failed'
  
  setSettings: (settings: AppSettings) => void
  updateSettings: (partial: Partial<AppSettings>) => void
  setConnectionStatus: (status: SettingsState['connectionStatus']) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: null,
      isLoading: false,
      connectionStatus: 'idle',

      setSettings: (settings) => set({ settings }),
      
      updateSettings: (partial) => set((state) => ({
        settings: state.settings ? { ...state.settings, ...partial } : null
      })),
      
      setConnectionStatus: (status) => set({ connectionStatus: status }),
    }),
    {
      name: 'nexadial-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
