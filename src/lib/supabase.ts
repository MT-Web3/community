import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isBackendConfigured = Boolean(url && key)
export const supabase = isBackendConfigured ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null

export async function submitApplication(payload: Record<string, unknown>) {
  if (!supabase) throw new Error('Hệ thống đăng ký chưa được cấu hình.')
  const { data, error } = await supabase.functions.invoke('submit-application', { body: payload })
  if (error) throw error
  return data
}

export async function lookupApplication(code: string, email?: string) {
  if (!supabase) throw new Error('Hệ thống tra cứu chưa được cấu hình.')
  const { data, error } = await supabase.functions.invoke('application-status', { body: { code, email } })
  if (error) throw error
  return data
}
