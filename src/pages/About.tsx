import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MotionStage } from '../components/MotionStage'
import { XFeed } from '../components/XFeed'
import { useI18n } from '../lib/i18n'
export function About() { const { t } = useI18n(); return <><section className="monday-home about-page container"><div className="monday-editorial"><p className="kicker">ABOUT MT-WEB3</p><h1>{t('Cùng xây')}<br/>{t('điều hay')}<span className="hero-period">.</span></h1><p className="hero-copy">{t('Không gian chiến dịch dành cho cộng đồng Web3 Việt Nam. Gửi minh chứng, theo dõi hồ sơ và cùng xây dựng giá trị.')}</p><Link className="button primary" to="/campaigns">{t('Khám phá chiến dịch')} <ArrowUpRight size={23}/></Link></div><MotionStage/></section><XFeed/></> }
