import { useI18n, localizeCampaign } from '../lib/i18n'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Campaign } from '../types'

const labels = { draft: 'Bản nháp', upcoming: 'Sắp diễn ra', active: 'Đang mở', ended: 'Đã kết thúc' }
export function CampaignCard({ campaign, admin = false }: { campaign: Campaign; admin?: boolean }) {
  const { t, locale, language } = useI18n()
  campaign = localizeCampaign(campaign, language)

  const isFungo = campaign.slug.startsWith('fungolabs')
  return <article className={`campaign-card${isFungo ? ' fungo-card' : ''}`} style={{ '--accent': campaign.accent } as React.CSSProperties} onPointerMove={event => {
    if (event.pointerType !== 'mouse') return
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }}>
    <div className="campaign-art">{isFungo ? <><img className="fungo-logo" src="/community/assets/fungolabs-logo.png" alt="Logo FungoLabs"/><span className="fungo-name">FUNGO<br/>LABS</span><small>SEEN BY ALL · KNOWN BY ONE</small></> : <span>{campaign.project.slice(0, 2).toUpperCase()}</span>}</div>
    <div className="campaign-body"><div className="eyebrow-row"><span className={`status ${campaign.status}`}>{t(labels[campaign.status])}</span><span>{t(campaign.type)}</span></div>
      <h3>{campaign.name}</h3><p>{campaign.description}</p>
      <div className="campaign-meta"><CalendarDays size={16}/><span>{campaign.startsAt ? new Date(campaign.startsAt).toLocaleDateString(locale) : t("Chưa ấn định")}</span></div>
      <div className="card-links"><Link className="text-link" to={admin ? `/admin/campaigns/${campaign.slug}` : `/campaigns/${campaign.slug}`}>{admin ? t("Chỉnh sửa") : t("Xem chi tiết")} <ArrowUpRight size={17}/></Link>{isFungo&&<a className="text-link muted-link x-link" href="https://x.com/FungoLabs" target="_blank" rel="noreferrer" aria-label={t("X của FungoLabs")} title="X · FungoLabs"><span className="x-icon" aria-hidden="true">𝕏</span><span className="x-link-label">FungoLabs</span><ArrowUpRight size={15}/></a>}</div>
    </div>
  </article>
}
