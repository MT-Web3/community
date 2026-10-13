import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isBackendConfigured = Boolean(url && key)
export const supabase = isBackendConfigured ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null

async function invokeFunction(name: string, body: Record<string, unknown>) {
  if (!url || !key) throw new Error('Hệ thống chưa được cấu hình.')
  const response = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(payload.error || 'Không thể kết nối tới hệ thống.')
  return payload
}

export async function submitApplication(payload: Record<string, unknown>) {
  if (!supabase) throw new Error('Hệ thống đăng ký chưa được cấu hình.')
  return invokeFunction('submit-application', payload)
}

export async function lookupApplication(code: string, email?: string) {
  if (!supabase) throw new Error('Hệ thống tra cứu chưa được cấu hình.')
  return invokeFunction('application-status', { code, email })
}
