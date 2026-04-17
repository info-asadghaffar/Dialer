/**
 * Utility functions for phone number formatting and validation.
 */

/**
 * Formats a phone number into standardized E.164 format for API.
 */
export const formatE164 = (number: string, countryCode: string = '+1'): string => {
  const cleaned = number.replace(/\D/g, '')
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`
  }
  return cleaned.length === 10 ? `${countryCode}${cleaned}` : cleaned
}

/**
 * Formats an E.164 number into a friendly display format: (XXX) XXX-XXXX.
 */
export const formatDisplay = (number: string): string => {
  const cleaned = number.replace(/\D/g, '')
  const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    const intlCode = match[1] ? '+1 ' : ''
    return `${intlCode}(${match[2]}) ${match[3]}-${match[4]}`
  }
  return number
}

/**
 * Validates a phone number for E.164 compliance.
 */
export const isValidPhoneNumber = (number: string): boolean => {
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(number)
}

/**
 * Formats duration in seconds into human-readable string: "3m 42s".
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}
