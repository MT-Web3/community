import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Campaign } from '../types'

const labels = { draft: 'Bản nháp', upcoming: 'Sắp diễn ra', active: 'Đang mở', ended: 'Đã kết thúc' }
export function CampaignCard({ campaign, admin = false }: { campaign: Campaign; admin?: boolean }) {
  const isFungo = campaign.slug.startsWith('fungolabs')
  return <article className={`campaign-card${isFungo ? ' fungo-card' : ''}`} style={{ '--accent': campaign.accent } as React.CSSProperties} onPointerMove={event => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }}>
    <div className="campaign-art">{isFungo ? <><img className="fungo-logo" src="/community/assets/fungolabs-logo.png" alt="Logo FungoLabs"/><span className="fungo-name">FUNGO<br/>LABS</span><small>SEEN BY ALL · KNOWN BY ONE</small></> : <span>{campaign.project.slice(0, 2).toUpperCase()}</span>}</div>
    <div className="campaign-body"><div className="eyebrow-row"><span className={`status ${campaign.status}`}>{labels[campaign.status]}</span><span>{campaign.type}</span></div>
      <h3>{campaign.name}</h3><p>{campaign.description}</p>
      <div className="campaign-meta"><CalendarDays size={16}/><span>{campaign.startsAt ? new Date(campaign.startsAt).toLocaleDateString('vi-VN') : 'Chưa ấn định'}</span></div>
      <div className="card-links"><Link className="text-link" to={admin ? `/admin/campaigns/${campaign.slug}` : `/campaigns/${campaign.slug}`}>{admin ? 'Chỉnh sửa' : 'Xem chi tiết'} <ArrowUpRight size={17}/></Link>{isFungo&&<a className="text-link muted-link x-link" href="https://x.com/FungoLabs" target="_blank" rel="noreferrer" aria-label="X của FungoLabs"><span className="x-icon">X</span> @FungoLabs <ArrowUpRight size={15}/></a>}</div>
    </div>
  </article>
}
