import { useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { useI18n } from '../lib/i18n'

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
  return <section className="x-feed section" aria-labelledby="x-feed-title"><div className="container"><div className="section-head"><div><p className="kicker">X / @DAOMINTAM</p><h2 id="x-feed-title">{language === 'vi' ? 'Theo dõi những gì đang được xây.' : 'Follow what is being built.'}</h2></div><a className="text-link" href="https://x.com/daomintam" target="_blank" rel="noreferrer">{language === 'vi' ? 'Mở trang X' : 'Open on X'} <ExternalLink size={16}/></a></div><div className="x-feed-grid"><div className="x-timeline-card"><a className="twitter-timeline" data-height="520" data-dnt="true" data-theme="dark" href="https://twitter.com/daomintam">{language === 'vi' ? 'Bài đăng mới nhất của @daomintam' : 'Latest posts from @daomintam'}</a></div><aside className="x-feed-note"><span className="x-feed-mark">X</span><h3>{language === 'vi' ? 'Góc cập nhật cộng đồng' : 'Community updates'}</h3><p>{language === 'vi' ? 'Các bài đăng mới sẽ tự cập nhật từ X. Không cần đăng nhập và không lưu dữ liệu X trên MT-Web3.' : 'New posts update directly from X. No login is required and MT-Web3 does not store X data.'}</p><a className="button secondary" href="https://x.com/daomintam" target="_blank" rel="noreferrer">@daomintam <ExternalLink size={16}/></a></aside></div></div></section>
}
