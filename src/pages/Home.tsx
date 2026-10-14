import { useI18n } from '../lib/i18n'
import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MotionStage } from '../components/MotionStage'
import { XFeed } from '../components/XFeed'

export function Home() {
  const { t } = useI18n()

  const [word, setWord] = useState(0)
  const words = [t("Đóng góp."), t("Kết nối.").normalize("NFC"), t("Khám phá.")]
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => setWord(current => (current + 1) % 3), 3400)
    return () => clearInterval(timer)
  }, [])
  return <><section className="monday-home container"><div className="monday-editorial"><p className="kicker">MT-WEB3 COMMUNITY</p><h1>{t('Cùng xây')}<br/>{t('điều hay')}<span className="hero-period">.</span></h1><div className="kinetic-word" aria-hidden="true"><span key={word}>{words[word]}</span></div><p className="hero-copy">{t("Không gian chiến dịch dành cho cộng đồng Web3 Việt Nam. Gửi minh chứng, theo dõi hồ sơ và cùng xây dựng giá trị.")}</p><div className="hero-actions"><Link className="button primary" to="/campaigns">{t("Khám phá chiến dịch") + " "}<ArrowUpRight size={23}/></Link></div></div><MotionStage/></section><XFeed /></>
}
