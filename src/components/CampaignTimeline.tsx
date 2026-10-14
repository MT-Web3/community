import { Check, Clock3, Flag } from 'lucide-react'
import type { Campaign } from '../types'
import { useI18n } from '../lib/i18n'

export function CampaignTimeline({ campaign }: { campaign: Campaign }) {
  const { language } = useI18n()
  const now = Date.now(), start = campaign.startsAt ? Date.parse(campaign.startsAt) : null, end = campaign.endsAt ? Date.parse(campaign.endsAt) : null
  const phase = start && now < start ? 'upcoming' : end && now > end ? 'ended' : 'active'
  const format = (value: string | null) => value ? new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : (language === 'vi' ? 'Chưa ấn định' : 'Not set')
  const labels = language === 'vi' ? { start: 'Bắt đầu', now: 'Hiện tại', end: 'Kết thúc' } : { start: 'Starts', now: 'Now', end: 'Ends' }
  return <section className={`campaign-timeline timeline-${phase}`} aria-label={language === 'vi' ? 'Tiến trình chiến dịch' : 'Campaign timeline'}><div className="timeline-track"><div className="timeline-step done"><span className="timeline-dot"><Check size={14}/></span><strong>{labels.start}</strong><small>{format(campaign.startsAt)}</small></div><div className={`timeline-step current ${phase === 'active' ? 'pulse' : ''}`}><span className="timeline-dot"><Clock3 size={14}/></span><strong>{labels.now}</strong><small>{phase === 'upcoming' ? (language === 'vi' ? 'Sắp mở' : 'Opening soon') : phase === 'ended' ? (language === 'vi' ? 'Đã đóng' : 'Closed') : (language === 'vi' ? 'Đang diễn ra' : 'Live now')}</small></div><div className="timeline-step"><span className="timeline-dot"><Flag size={14}/></span><strong>{labels.end}</strong><small>{format(campaign.endsAt)}</small></div></div><p className="timeline-zone">{language === 'vi' ? 'Tất cả mốc thời gian theo giờ Việt Nam (UTC+07:00).' : 'All campaign times use Vietnam time (UTC+07:00).'}</p></section>
}
