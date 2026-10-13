import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Campaign } from '../types'

const labels = { draft: 'Bản nháp', upcoming: 'Sắp diễn ra', active: 'Đang mở', ended: 'Đã kết thúc' }
export function CampaignCard({ campaign, admin = false }: { campaign: Campaign; admin?: boolean }) {
  const isFungo = campaign.slug.startsWith('fungolabs')
  return <article className={`campaign-card${isFungo ? ' fungo-card' : ''}`} style={{ '--accent': campaign.accent } as React.CSSProperties}>
    <div className="campaign-art">{isFungo ? <><div className="fungo-mark" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i}/>)}</div><span className="fungo-name">FUNGO<br/>LABS</span><small>SEEN BY ALL · KNOWN BY ONE</small></> : <span>{campaign.project.slice(0, 2).toUpperCase()}</span>}</div>
    <div className="campaign-body"><div className="eyebrow-row"><span className={`status ${campaign.status}`}>{labels[campaign.status]}</span><span>{campaign.type}</span></div>
      <h3>{campaign.name}</h3><p>{campaign.description}</p>
      <div className="campaign-meta"><CalendarDays size={16}/><span>{campaign.startsAt ? new Date(campaign.startsAt).toLocaleDateString('vi-VN') : 'Chưa ấn định'}</span></div>
      <Link className="text-link" to={admin ? `/admin/campaigns/${campaign.slug}` : `/campaigns/${campaign.slug}`}>{admin ? 'Chỉnh sửa' : 'Xem chi tiết'} <ArrowUpRight size={17}/></Link>
    </div>
  </article>
}
