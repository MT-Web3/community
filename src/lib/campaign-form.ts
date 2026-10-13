import type { CampaignStatus, CampaignType } from '../types'

export const campaignTypes: CampaignType[] = ['Giveaway', 'Whitelist', 'Community Nomination', 'NFT Allowlist', 'Early Access', 'Community Campaign']
export interface CampaignForm {
  slug: string; name: string; project: string; description: string; campaign_type: CampaignType
  status: CampaignStatus; reward: string; capacity: string; starts_at: string; ends_at: string
  requirements: string; walletRequired: boolean
}
export function toLocalDateTime(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
export function campaignPayload(form: CampaignForm) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) throw new Error('Đường dẫn chỉ gồm chữ thường, số và dấu gạch ngang.')
  if (!form.name.trim() || !form.project.trim() || !form.description.trim()) throw new Error('Điền tên, dự án và mô tả chiến dịch.')
  const starts = form.starts_at ? new Date(form.starts_at) : null
  const ends = form.ends_at ? new Date(form.ends_at) : null
  if ((starts && !Number.isFinite(starts.getTime())) || (ends && !Number.isFinite(ends.getTime()))) throw new Error('Ngày giờ không hợp lệ.')
  if (starts && ends && ends <= starts) throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu.')
  const capacity = form.capacity === '' ? null : Number(form.capacity)
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1)) throw new Error('Số suất phải là số nguyên lớn hơn 0.')
  return {
    slug: form.slug, name: form.name.trim(), project: form.project.trim(), description: form.description.trim(),
    campaign_type: form.campaign_type, status: form.status, reward: form.reward.trim() || null, capacity,
    starts_at: starts?.toISOString() ?? null, ends_at: ends?.toISOString() ?? null,
    requirements: form.requirements.split('\n').map(item => item.trim()).filter(Boolean),
    updated_at: new Date().toISOString(),
  }
}
