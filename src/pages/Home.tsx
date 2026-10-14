import { useI18n, localizeCampaign } from '../lib/i18n'
import { ArrowDownRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MotionStage } from '../components/MotionStage'
import { getPublicCampaigns } from '../lib/supabase'
import type { Campaign } from '../types'
import { XFeed } from '../components/XFeed'
import { XLogo } from '../components/XLogo'

export function Home() {
  const { t, language } = useI18n()

  const [campaigns, setCampaigns] = useState<Campaign[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(false)
  const [word, setWord] = useState(0)
  const words = [t("Đóng góp."), t("Kết nối.").normalize("NFC"), t("Khám phá.")]
  useEffect(() => { getPublicCampaigns().then(setCampaigns).catch(() => setError(true)).finally(() => setLoading(false)) }, [])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setWord(current => (current + 1) % 3), 3400)
    return () => clearInterval(timer)
  }, [])
  return <><section className="monday-home container"><div className="monday-editorial"><p className="kicker">MT-WEB3 COMMUNITY</p><h1>{t('Cùng xây')}<br/>{t('điều hay')}<span className="hero-period">.</span></h1><div className="kinetic-word" aria-hidden="true"><span key={word}>{words[word]}</span></div><p className="hero-copy">{t("Không gian chiến dịch dành cho cộng đồng Web3 Việt Nam. Gửi minh chứng, theo dõi hồ sơ và cùng xây dựng giá trị.")}</p><div className="hero-actions"><Link className="button primary" to="/campaigns">{t("Khám phá chiến dịch") + " "}<ArrowUpRight size={23}/></Link><Link className="hero-text-link" to="/status">{t("Tra cứu hồ sơ") + " "}<ArrowUpRight size={20}/></Link></div><a className="monday-builder x-profile-card" href="https://x.com/daomintam" target="_blank" rel="noreferrer" aria-label={t("Mở hồ sơ TΛM trên X")}><img src="https://pbs.twimg.com/profile_images/2109830409219665920/4CcXu0y4_400x400.jpg" alt="TΛM"/><span className="x-profile-card-body"><span className="x-profile-card-name">TΛM <span aria-hidden="true">🔶</span></span><span className="x-profile-card-handle">@daomintam</span><span className="x-profile-card-bio">{t("Dev · Web3 & Crypto · Creator")}</span></span><span className="x-profile-card-action"><XLogo size={15}/><ExternalLink size={13}/></span></a></div><MotionStage/><div className="campaign-ribbon"><div className="ribbon-heading"><ArrowDownRight size={32}/><span>{t("Cơ hội dành cho bạn")}</span></div><div className="ribbon-opportunities">{loading ? <span>{t("Đang tải chiến dịch…")}</span> : error ? <Link to="/campaigns">{t("Thử lại")}</Link> : campaigns.length ? campaigns.slice(0,3).map(item => localizeCampaign(item, language)).map(campaign => <Link key={campaign.id} to={`/campaigns/${campaign.slug}`} className="ribbon-link"><span className={`status ${campaign.status}`}>{campaign.status === 'active' ? t("Đang mở") : campaign.status === 'upcoming' ? t("Sắp diễn ra") : t("Đã kết thúc")}</span><strong>{campaign.name}</strong><ArrowUpRight size={26}/></Link>) : <span>{t("Cơ hội mới đang đến")}</span>}</div><Link className="ribbon-all" to="/campaigns" aria-label={t("Xem chiến dịch")}><ArrowUpRight size={28}/></Link></div></section><XFeed /></>
}
