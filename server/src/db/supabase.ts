import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables')
}

/**
 * Supabase client initialized with Service Role Key for backend administrative tasks.
 */
export const supabase = createClient(supabaseUrl, supabaseKey)

// Export helper type for DB schema
export type Database = any // Replace with actual generated types when ready
