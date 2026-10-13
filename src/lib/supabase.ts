import { createClient } from '@supabase/supabase-js'
import type { Campaign, CampaignStatus, CampaignType } from '../types'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isBackendConfigured = Boolean(url && key)
export const supabase = isBackendConfigured ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
}) : null

async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!url || !key) throw new Error('Hệ thống chưa được cấu hình.')
  const response = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({})) as T & { error?: string }
  if (!response.ok) throw new Error(payload.error || 'Không thể kết nối tới hệ thống.')
  return payload
}

export async function submitApplication(payload: Record<string, unknown>) {
  if (!supabase) throw new Error('Hệ thống đăng ký chưa được cấu hình.')
  return invokeFunction<{ code: string; status: string }>('submit-application', payload)
}

export async function lookupApplication(code: string, email?: string) {
  if (!supabase) throw new Error('Hệ thống tra cứu chưa được cấu hình.')
  return invokeFunction<{ status: string; campaign: string; updatedAt: string }>('application-status', { code, email })
}

type CampaignRow = {
  id: string; slug: string; name: string; project: string; description: string
  campaign_type: string; status: CampaignStatus; capacity: number | null
  starts_at: string | null; ends_at: string | null; reward: string | null
  requirements: string[]; form_config: { walletRequired?: boolean } | null
}

export function mapCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id, slug: row.slug, name: row.name, project: row.project,
    description: row.description, longDescription: row.description,
    type: row.campaign_type as CampaignType, status: row.status,
    startsAt: row.starts_at, endsAt: row.ends_at, capacity: row.capacity,
    reward: row.reward || 'Đang cập nhật', requirements: row.requirements || [],
    walletRequired: Boolean(row.form_config?.walletRequired), accent: '#ffd400',
  }
}

const campaignColumns = 'id,slug,name,project,description,campaign_type,status,capacity,starts_at,ends_at,reward,requirements,form_config'

export async function getPublicCampaigns(): Promise<Campaign[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from('campaigns').select(campaignColumns).neq('status', 'draft').order('starts_at', { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data as CampaignRow[]).map(mapCampaign)
}

export async function getPublicCampaign(slug: string): Promise<Campaign | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from('campaigns').select(campaignColumns).eq('slug', slug).neq('status', 'draft').maybeSingle()
  if (error) throw error
  return data ? mapCampaign(data as CampaignRow) : null
}
