import { ArrowRight, CheckCircle2, Database, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CampaignCard } from '../components/CampaignCard'
import { publicCampaigns } from '../data'

export function Home() {
  return <>
    <section className="hero"><div className="container hero-grid"><div>
      <p className="kicker"><span/> 000 · COMMUNITY PROTOCOL</p>
      <h1>Seen by all.<br/><em>Earned by contribution.</em></h1>
      <p className="hero-copy">Hạ tầng chiến dịch Web3 dành cho cộng đồng Việt Nam — tiêu chí công khai, dữ liệu được bảo vệ và mọi quyết định đều dựa trên đóng góp thực chất.</p>
      <div className="hero-actions"><Link className="button primary" to="/campaigns">Khám phá chiến dịch <ArrowRight size={18}/></Link><Link className="button secondary" to="/status">Tra cứu hồ sơ</Link></div>
    </div><div className="protocol-panel" aria-hidden="true"><div className="protocol-top"><span>MTW3/GENESIS</span><span>SEALED</span></div><div className="protocol-mark">{Array.from({length:8},(_,index)=><i key={index}/>)}</div><div className="protocol-readout"><span>NETWORK<br/><b>ETHEREUM</b></span><span>PRIVACY<br/><b>BY DESIGN</b></span><span>STATUS<br/><b>READY</b></span></div></div></div></section>
    <section className="proof"><div className="container proof-grid">
      <div><strong>{publicCampaigns.length}</strong><span>Chiến dịch đang công khai</span></div>
      <div><strong>0</strong><span>Hồ sơ công khai danh tính</span></div>
      <div><strong>100%</strong><span>Tiêu chí được công bố rõ ràng</span></div>
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
