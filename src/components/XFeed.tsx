import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { XLogo } from './XLogo'

declare global { interface Window { twttr?: { widgets?: { load: (element?: HTMLElement) => void } } } }

export function XFeed() {
  const { language } = useI18n()
  useEffect(() => {
    const existing = document.querySelector('script[data-x-embed]') as HTMLScriptElement | null
    if (existing) { window.twttr?.widgets?.load(); return }
    const script = document.createElement('script')
    script.src = 'https://platform.twitter.com/widgets.js'
    script.async = true
    script.charset = 'utf-8'
    script.dataset.xEmbed = 'true'
    script.onload = () => window.twttr?.widgets?.load()
    document.body.appendChild(script)
  }, [])
  return <section className="x-feed section" aria-labelledby="x-feed-title"><div className="container"><div className="section-head"><div><p className="kicker"><XLogo size={15}/> CỘNG ĐỒNG MT-WEB3</p><h2 id="x-feed-title">{language === 'vi' ? 'Theo dõi những gì đang được xây.' : 'Follow what is being built.'}</h2></div><a className="x-profile-link" href="https://x.com/daomintam" target="_blank" rel="noreferrer" aria-label="@daomintam trên X"><XLogo size={17}/><span>@daomintam</span><ExternalLink size={15}/></a></div><div className="x-feed-grid"><div className="x-timeline-card"><a className="twitter-timeline" data-height="520" data-dnt="true" data-theme="dark" href="https://twitter.com/daomintam">{language === 'vi' ? 'Bài đăng mới nhất từ cộng đồng MT-Web3' : 'Latest posts from MT-Web3 community'}</a></div><aside className="x-feed-note"><XLogo size={22}/><h3>{language === 'vi' ? 'Góc cập nhật cộng đồng' : 'Community updates'}</h3><p>{language === 'vi' ? 'Các bài đăng mới sẽ tự cập nhật từ X. Không cần đăng nhập và không lưu dữ liệu X trên MT-Web3.' : 'New posts update directly from X. No login is required and MT-Web3 does not store X data.'}</p><a className="twitter-follow-button" href="https://twitter.com/intent/follow?screen_name=daomintam" data-show-count="false" data-size="large">Follow @daomintam</a></aside></div></div></section>
}
