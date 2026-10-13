import { ArrowLeft, CalendarDays, Check, Gift, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HandleInput } from '../components/HandleInput'
import { getPublicCampaign, submitApplication } from '../lib/supabase'
import { normalizeXUrl, validateSubmission, type ValidationErrors } from '../lib/validation'
import type { Campaign, SubmissionInput } from '../types'

const labels = { draft: 'Bản nháp', upcoming: 'Sắp diễn ra', active: 'Đang mở', ended: 'Đã kết thúc' }
export function CampaignDetail() {
  const { slug } = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState<SubmissionInput>({ campaignId: '', xUsername: '', postUrl1: '', postUrl2: '', walletAddress: '', consent: false })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [message, setMessage] = useState('')
  const [receipt, setReceipt] = useState<{ id: string; handle: string } | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    setLoading(true); setCampaign(null); setLoadError(''); setReceipt(null)
    getPublicCampaign(slug || '').then(value => { if (active) { setCampaign(value); if (value) setForm(current => ({ ...current, campaignId: value.id })) } })
      .catch(() => { if (active) setLoadError('Không thể tải chiến dịch. Vui lòng thử lại.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [slug])
  if (loading) return <section className="page section"><div className="container empty"><h2>Đang tải chiến dịch…</h2></div></section>
  if (!campaign) return <section className="page section"><div className="container narrow"><Link className="back" to="/campaigns"><ArrowLeft size={18}/> Quay lại</Link><div className="empty"><ShieldAlert/><h2>{loadError || 'Chiến dịch chưa công khai'}</h2><p>Bản nháp chỉ hiển thị trong trang quản trị.</p></div></div></section>
  const accepts = campaign.status === 'active' && (!campaign.startsAt || Date.parse(campaign.startsAt) <= Date.now()) && (!campaign.endsAt || Date.parse(campaign.endsAt) >= Date.now())
  const update = (name: keyof SubmissionInput, value: string | boolean) => setForm(current => ({ ...current, [name]: value }))
  async function submit(event: React.FormEvent) {
    event.preventDefault(); const next = validateSubmission(form, campaign!.walletRequired); setErrors(next); setMessage('')
    if (Object.keys(next).length || !accepts) return
    setBusy(true)
    try { const result = await submitApplication(form as unknown as Record<string, unknown>); setReceipt({ id: result.id || result.code, handle: form.xUsername }) }
    catch (err) { setMessage(err instanceof Error ? err.message : 'Không thể gửi hồ sơ.') }
    finally { setBusy(false) }
  }
  return <section className="page section detail-page"><div className="container"><Link className="back" to="/campaigns"><ArrowLeft size={18}/> Tất cả chiến dịch</Link><div className="detail-grid">
    <article className="detail-content"><div className="campaign-hero"><span className={`status ${campaign.status}`}>{labels[campaign.status]}</span><p>{campaign.type} · {campaign.project}</p><h1>{campaign.name}</h1><p>{campaign.longDescription}</p></div><div className="info-grid"><div><Gift/><span>Quyền lợi</span><strong>{campaign.reward}</strong></div><div><CalendarDays/><span>Kết thúc</span><strong>{campaign.endsAt ? new Date(campaign.endsAt).toLocaleString('vi-VN') : 'Chưa ấn định'}</strong></div><div><Check/><span>Số suất</span><strong>{campaign.capacity ?? 'Theo xét duyệt'}</strong></div></div><div className="requirements"><h2>Task & điều kiện</h2>{campaign.requirements.map((item, index) => <p key={index}><Check size={18}/><span>{item}</span></p>)}</div></article>
    <aside className="form-panel application-panel">{receipt ? <div className="receipt" role="status"><Check size={44}/><h2>Đã nhận hồ sơ</h2><p>Hồ sơ của <strong>@{receipt.handle}</strong> đang chờ xét duyệt.</p><p className="application-id">ID hồ sơ <code>{receipt.id}</code></p><Link className="button primary full" to={`/status?handle=${encodeURIComponent(receipt.handle)}`}>Tra cứu bằng @{receipt.handle}</Link><p className="fine">Không cần ghi nhớ ID. Dùng handle X để xem trạng thái bất cứ lúc nào.</p></div> : <><div className="step-chip">ĐÓNG GÓP · MINH CHỨNG · XÉT DUYỆT</div><h2>Tham gia chiến dịch</h2><p>Handle X và hai bài viết là đủ để gửi hồ sơ.</p>{!accepts ? <div className="empty"><ShieldAlert/><h3>Chưa nhận đăng ký</h3><p>Chiến dịch đang ngoài thời gian nhận hồ sơ.</p></div> : <form onSubmit={submit} noValidate><label htmlFor="x-handle">X handle<HandleInput value={form.xUsername} onChange={value => update('xUsername', value)}/>{errors.xUsername && <small className="error">{errors.xUsername}</small>}</label>{(['postUrl1', 'postUrl2'] as const).map((name, index) => <label key={name}>Bài viết {index + 1}<input value={form[name]} onChange={event => update(name, event.target.value)} onBlur={() => { const normalized = normalizeXUrl(form[name]); if (normalized) update(name, normalized) }} placeholder="x.com/handle/status/…" inputMode="url"/>{errors[name] && <small className="error">{errors[name]}</small>}</label>)}<p className="fine">Có thể dán link không có https://. Hệ thống tự chuẩn hóa trước khi lưu.</p>{campaign.walletRequired && <label>Địa chỉ ví EVM<input value={form.walletAddress} onChange={event => update('walletAddress', event.target.value)} placeholder="0x…"/>{errors.walletAddress && <small className="error">{errors.walletAddress}</small>}</label>}<label className="checkbox"><input type="checkbox" checked={form.consent} onChange={event => update('consent', event.target.checked)}/><span>Tôi đồng ý với thể lệ và chính sách dữ liệu. Trạng thái hồ sơ có thể được tra cứu bằng handle X.</span></label>{errors.consent && <small className="error">{errors.consent}</small>}<button className="button primary full" disabled={busy}>{busy ? 'Đang gửi…' : 'Gửi hồ sơ'}</button>{message && <p className="error form-message" role="alert">{message}</p>}<p className="fine">Không cung cấp private key hoặc seed phrase. Liên kết bài viết không xác minh quyền sở hữu tài khoản X.</p></form>}</>}</aside>
  </div></div></section>
}
