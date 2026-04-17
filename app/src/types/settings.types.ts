export interface TwilioNumber {
  number: string       // E.164 format
  label: string        // friendly name
  isPrimary: boolean
  capabilities: {
    voice: boolean
    sms: boolean
  }
}

export interface AppSettings {
  accountSid: string
  authToken: string
  apiKey: string
  apiSecret: string
  twimlAppSid: string
  phoneNumbers: TwilioNumber[]
  primaryNumber: string
  isConnected: boolean
  lastVerifiedAt: string | null
}
