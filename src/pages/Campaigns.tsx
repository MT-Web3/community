import { useI18n, localizeCampaign } from '../lib/i18n'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CampaignCard } from '../components/CampaignCard'
import { getPublicCampaigns } from '../lib/supabase'
import type { Campaign } from '../types'

export function Campaigns() {
  const { t, language } = useI18n()

  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all')
  const [items,setItems]=useState<Campaign[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('')
  useEffect(()=>{getPublicCampaigns().then(setItems).catch(()=>setError("Không thể tải chiến dịch. Vui lòng thử lại.")).finally(()=>setLoading(false))},[])
  const campaigns = useMemo(() => items.map(item => localizeCampaign(item, language)).filter(c => (filter === 'all' || c.status === filter) && `${c.name} ${c.project} ${c.type}`.toLowerCase().includes(query.toLowerCase())), [items,query, filter, language])
  return <section className="page section"><div className="container"><p className="kicker">{t("KHÁM PHÁ")}</p><h1 className="page-title">{t("Chiến dịch cộng đồng")}</h1><p className="page-intro">{t("Tìm các cơ hội phù hợp với đóng góp và mối quan tâm của bạn.")}</p>
    <div className="toolbar"><label className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t("Tìm theo tên, dự án hoặc loại...")}/></label><div className="filters">{[['all',t("Tất cả")],['active',t("Đang mở")],['upcoming',t("Sắp diễn ra")],['ended',t("Đã kết thúc")]].map(([v,l]) => <button className={filter === v ? 'active' : ''} onClick={() => setFilter(v)} key={v}>{l}</button>)}</div></div>
    {loading?<div className="loading-grid"><i/><i/><i/></div>:error?<div className="empty"><span>!</span><h3>{t("Chưa tải được dữ liệu")}</h3><p>{t(error || '')}</p></div>:campaigns.length ? <div className="card-grid">{campaigns.map(c => <CampaignCard key={c.id} campaign={c}/>)}</div> : <div className="empty"><span>—</span><h3>{t("Không tìm thấy chiến dịch")}</h3><p>{t("Thử thay đổi từ khóa hoặc bộ lọc. Chiến dịch bản nháp luôn được ẩn khỏi khu vực công khai.")}</p></div>}
  </div></section>
}
