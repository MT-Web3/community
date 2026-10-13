import { ArrowRight, CheckCircle2, Database, ExternalLink, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CampaignCard } from '../components/CampaignCard'
import { getPublicCampaigns } from '../lib/supabase'
import type { Campaign } from '../types'

export function Home() {
  const [publicCampaigns,setPublicCampaigns]=useState<Campaign[]>([])
  useEffect(()=>{getPublicCampaigns().then(setPublicCampaigns).catch(()=>setPublicCampaigns([]))},[])
  return <>
    <section className="hero"><div className="container hero-grid"><div>
      <p className="kicker"><span/> 000 · COMMUNITY PROTOCOL</p>
      <h1><span>Seen by all.</span><em>Earned by contribution.</em></h1>
      <p className="hero-copy">Hạ tầng chiến dịch Web3 dành cho cộng đồng Việt Nam — tiêu chí công khai, dữ liệu được bảo vệ và mọi quyết định đều dựa trên đóng góp thực chất.</p>
      <div className="hero-actions"><Link className="button primary" to="/campaigns">Khám phá chiến dịch <ArrowRight size={18}/></Link><Link className="button secondary" to="/status">Tra cứu hồ sơ</Link></div>
    </div><div className="protocol-panel" aria-hidden="true"><div className="protocol-top"><span>MTW3/GENESIS</span><span>SEALED</span></div><div className="protocol-mark">{Array.from({length:8},(_,index)=><i key={index}/>)}</div><div className="protocol-readout"><span>NETWORK<br/><b>ETHEREUM</b></span><span>PRIVACY<br/><b>BY DESIGN</b></span><span>STATUS<br/><b>READY</b></span></div></div></div></section>
    <section className="proof"><div className="container proof-grid">
      <div><strong>{publicCampaigns.length}</strong><span>Chiến dịch đang công khai</span></div>
      <div><strong>0</strong><span>Hồ sơ công khai danh tính</span></div>
      <div><strong>100%</strong><span>Tiêu chí được công bố rõ ràng</span></div>
    </div></section>
    <section className="section creator-section"><div className="container creator-card">
      <div className="creator-avatar"><img src="/community/assets/tam-profile.png" alt="TAM — người xây dựng MT-Web3 Community"/></div>
      <div className="creator-copy"><p className="kicker">COMMUNITY BUILDER</p><div className="creator-name"><h2>TAM</h2><span className="creator-badge" aria-label="Đã xác minh">◆ ✓</span></div><a className="creator-handle" href="https://x.com/daomintam" target="_blank" rel="noreferrer"><span className="x-icon">X</span> @daomintam <ExternalLink size={16}/></a><p>Part of the @vibevibefun squad · Debugging life by day, airdropping gain by night. NFA. DYOR.</p><div className="creator-meta"><span><MapPin size={16}/> Dev · Web3 & Crypto · Creator</span><span>Tham gia X từ 06/2024</span></div><a className="button primary" href="https://x.com/daomintam" target="_blank" rel="noreferrer">Theo dõi TAM trên X <ArrowRight size={18}/></a></div>
    </div></section>
    <section className="section"><div className="container"><div className="section-head"><div><p className="kicker">CHIẾN DỊCH</p><h2>Đang diễn ra</h2></div><Link className="text-link" to="/campaigns">Xem tất cả <ArrowRight size={17}/></Link></div>
      {publicCampaigns.length ? <div className="card-grid">{publicCampaigns.map(c => <CampaignCard key={c.id} campaign={c}/>)}</div> : <div className="empty"><span>00</span><h3>Chưa có chiến dịch đang mở</h3><p>Các chiến dịch bản nháp không được hiển thị công khai. Hãy quay lại khi có thông báo chính thức.</p></div>}
    </div></section>
    <section className="section principles"><div className="container"><p className="kicker">NGUYÊN TẮC</p><h2>Một hạ tầng đáng tin cậy<br/>cho cộng đồng.</h2><div className="feature-grid">
      <article><ShieldCheck/><h3>Riêng tư từ thiết kế</h3><p>Thông tin cá nhân không được công khai. Người dùng chỉ tra cứu hồ sơ qua mã riêng.</p></article>
      <article><CheckCircle2/><h3>Tiêu chí minh bạch</h3><p>Mỗi chiến dịch công bố rõ điều kiện, thời hạn và quy trình xét duyệt.</p></article>
      <article><Database/><h3>Dữ liệu có trách nhiệm</h3><p>Dữ liệu chỉ được lưu trong thời gian cần thiết và có chính sách xóa rõ ràng.</p></article>
    </div></div></section>
  </>
}
