import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export function NotFound() {
  const { t } = useI18n()
  return <section className="page section not-found-page"><div className="container not-found-card"><div className="not-found-art"><div className="not-found-orbit" aria-hidden="true"/><img src="/community/assets/community-mascot.png" alt="MT-Web3 mascot"/></div><div className="not-found-copy"><p className="kicker">MT-WEB3 · ERROR</p><div className="not-found-code" aria-label="404">404</div><h1>{t('Page not found')}</h1><p>{t('Trang này không tồn tại hoặc tab tương ứng đã được ẩn trong cài đặt hiển thị.')}</p><Link className="button primary" to="/"><ArrowLeft size={17}/>{t('Về trang chủ')}</Link></div></div></section>
}
