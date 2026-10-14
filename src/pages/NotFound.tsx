import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { useI18n } from '../lib/i18n'

export function NotFound() {
  const { t } = useI18n()
  return <section className="page section not-found-page"><div className="container narrow not-found-card"><Compass size={46} aria-hidden="true"/><p className="kicker">MT-WEB3 · 404</p><h1>{t('Không tìm thấy trang')}</h1><p>{t('Trang này không tồn tại hoặc tab tương ứng đã được ẩn trong cài đặt hiển thị.')}</p><Link className="button primary" to="/"><ArrowLeft size={17}/>{t('Về trang chủ')}</Link></div></section>
}
