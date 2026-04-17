import { AppError } from '../middleware/errorHandler';

/**
 * Validates if a string is a valid E.164 phone number.
 */
export function isE164(number: string): boolean {
  return /^\+[1-9]\d{9,14}$/.test(number);
}

/**
 * Asserts E.164 format or throws a relevant error.
 */
export function assertE164(number: string, fieldName: string): void {
  if (!isE164(number)) {
    throw new AppError(`${fieldName} must be in E.164 format (e.g. +12125551234)`, 400);
  }
}

/**
 * Sanitizes input number to standard E.164 for US/Global.
 */
export function sanitizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}
