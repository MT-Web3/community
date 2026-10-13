import { Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HandleInput } from '../components/HandleInput'
import { lookupApplication, type ApplicationResult } from '../lib/supabase'

export function StatusLookup() {
  const [params] = useSearchParams()
  const [handle, setHandle] = useState(params.get('handle') || '')
  const [results, setResults] = useState<ApplicationResult[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [searched, setSearched] = useState(false)
  async function lookup(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setResults([]); setSearched(false)
    try { setResults(await lookupApplication(handle)); setSearched(true) }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể tra cứu.') }
    finally { setBusy(false) }
  }
  const labels: Record<string, string> = { pending: 'Đang chờ duyệt', approved: 'Đã được duyệt', rejected: 'Chưa được chọn' }
  return <section className="page section status-page"><div className="container lookup-grid">
    <div><p className="kicker">THEO DÕI ĐÓNG GÓP</p><h1 className="page-title">Một handle.<br/><em>Mọi hồ sơ.</em></h1><p className="page-intro">Tra cứu bằng tài khoản X đã đăng ký. Bạn không cần nhớ mã hồ sơ.</p><div className="privacy-note"><ShieldCheck size={22}/><p>Chỉ hiển thị chiến dịch, trạng thái và ID hồ sơ. Liên kết minh chứng, địa chỉ ví và ghi chú xét duyệt được giữ riêng tư.</p></div></div>
    <div className="lookup-workspace"><form className="lookup-card" onSubmit={lookup}><label htmlFor="x-handle">X handle<HandleInput value={handle} onChange={setHandle}/></label><button className="button primary full" disabled={busy || !handle}><Search size={19}/>{busy ? 'Đang tra cứu…' : 'Tra cứu hồ sơ'}</button><p className="fine">Trạng thái có thể được tra cứu bởi bất kỳ ai biết handle X. Handle không xác minh quyền sở hữu tài khoản.</p></form>
    <div className="lookup-results" aria-live="polite">{error && <p className="error result-alert" role="alert">{error}</p>}{searched && !results.length && <div className="empty"><Search/><h3>Chưa tìm thấy hồ sơ</h3><p>Kiểm tra handle X hoặc đăng ký một chiến dịch trước.</p></div>}{results.map(result => <article className={`result result-${result.status}`} key={result.id}><span className={`status ${result.status}`}>{labels[result.status] || result.status}</span><h3>{result.campaign}</h3><p className="application-id">ID hồ sơ <code>{result.id}</code></p><p className="fine">Cập nhật {new Date(result.updatedAt).toLocaleString('vi-VN')}</p></article>)}{!searched && !error && <div className="lookup-placeholder"><Search size={48}/><p>Kết quả sẽ xuất hiện tại đây</p></div>}</div></div>
  </div></section>
}
