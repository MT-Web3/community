import { Check, Download, ExternalLink, Github, LockKeyhole, LogOut, Plus, RefreshCw, Users, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { CampaignCard } from '../components/CampaignCard'
import { campaignPayload, campaignTypes, toLocalDateTime, type CampaignForm } from '../lib/campaign-form'
import { downloadCsv } from '../lib/csv'
import { isBackendConfigured, mapCampaign, supabase, type CampaignRow } from '../lib/supabase'
import type { Campaign, CampaignType } from '../types'

function LoginForm() {
  const [email, setEmail] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false)
  async function githubLogin() {
    if (!supabase) return
    setBusy(true); setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: `${window.location.origin}/community/admin` } })
    if (error) { setMessage(error.message); setBusy(false) }
  }
  async function login(event: React.FormEvent) {
    event.preventDefault(); if (!supabase) return
    setBusy(true)
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/community/admin`, shouldCreateUser: false } })
    setMessage(error ? error.message : 'Đã gửi liên kết đăng nhập. Kiểm tra email của bạn.'); setBusy(false)
  }
  return <div className="admin-login auth-stack"><LockKeyhole/><h2>Không gian quản trị</h2><p>Đăng nhập để tạo chiến dịch và xét duyệt đóng góp.</p><button className="button primary full" disabled={busy} onClick={githubLogin}><Github size={20}/> Tiếp tục với GitHub</button><div className="auth-divider">hoặc magic link</div><form onSubmit={login}><input aria-label="Email quản trị" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="Email quản trị" required/><button className="button secondary full" disabled={busy}>Gửi liên kết đăng nhập</button></form>{message && <p className="form-message" role="status">{message}</p>}</div>
}

const emptyForm: CampaignForm = { slug: '', name: '', project: '', description: '', campaign_type: 'Giveaway', status: 'draft', reward: '', capacity: '', starts_at: '', ends_at: '', requirements: '', walletRequired: false }
function CampaignEditor({ slug }: { slug?: string }) {
  const navigate = useNavigate()
  const [form, setForm] = useState<CampaignForm>({ ...emptyForm })
  const [formConfig, setFormConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(Boolean(slug)); const [saving, setSaving] = useState(false); const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    if (!slug || !supabase) return
    supabase.from('campaigns').select('*').eq('slug', slug).single().then(({ data, error }) => {
      if (!active) return
      if (error) setMessage('Không thể tải chiến dịch: ' + error.message)
      else {
        setForm({ slug: data.slug, name: data.name, project: data.project, description: data.description, campaign_type: data.campaign_type as CampaignType, status: data.status, reward: data.reward || '', capacity: data.capacity?.toString() || '', starts_at: toLocalDateTime(data.starts_at), ends_at: toLocalDateTime(data.ends_at), requirements: (data.requirements as string[]).join('\n'), walletRequired: Boolean(data.form_config?.walletRequired) })
        setFormConfig(data.form_config || {})
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [slug])
  function update<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) { setForm(current => ({ ...current, [key]: value })) }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!supabase) return
    setMessage(''); setSaving(true)
    try {
      const payload = { ...campaignPayload(form), form_config: { ...formConfig, walletRequired: form.walletRequired, fields: ['xUsername', 'postUrl1', 'postUrl2', ...(form.walletRequired ? ['walletAddress'] : [])] } }
      const query = slug ? supabase.from('campaigns').update(payload).eq('slug', slug) : supabase.from('campaigns').insert(payload)
      const { data, error } = await query.select('slug').single()
      if (error) throw error
      if (!slug) navigate(`/admin/campaigns/${data.slug}`, { replace: true })
      setMessage('Đã lưu chiến dịch. Trạng thái và thời gian quyết định khi nào nhận đăng ký.')
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Không thể lưu chiến dịch. Kiểm tra đường dẫn có bị trùng không.') }
    finally { setSaving(false) }
  }
  const preview: Campaign = { id: 'preview', slug: form.slug, name: form.name || 'Tên chiến dịch của bạn', project: form.project || 'PROJECT', description: form.description || 'Mô tả ngắn về cơ hội dành cho cộng đồng.', longDescription: form.description, type: form.campaign_type, status: form.status, reward: form.reward || 'Quyền lợi đang cập nhật', capacity: Number(form.capacity) || null, startsAt: form.starts_at || null, endsAt: form.ends_at || null, requirements: form.requirements.split('\n').filter(Boolean), walletRequired: form.walletRequired, accent: '#ffd400' }
  return <section className="page section editor-page"><div className="container"><div className="workspace-heading"><Link className="back" to="/admin">← Dashboard</Link><span className={`status ${form.status}`}>{slug ? 'CHỈNH SỬA' : 'CHIẾN DỊCH MỚI'} · {form.status}</span></div><div className="detail-grid admin-detail-grid"><aside className="editor-preview"><p className="kicker">XEM TRƯỚC</p><CampaignCard campaign={preview}/><div className="privacy-note"><LockKeyhole size={20}/><p>Form cơ bản: handle X, hai link minh chứng và ví tùy chọn. Task được admin xét duyệt thủ công; không tự xác minh follow hoặc chọn người thắng.</p></div></aside>{loading ? <div className="empty"><h2>Đang tải…</h2></div> : <form className="form-panel admin-editor" onSubmit={save}><h2>{slug ? 'Cấu hình chiến dịch' : 'Tạo chiến dịch'}</h2><div className="editor-fields"><div className="editor-row"><label>Tên chiến dịch<input value={form.name} onChange={event => update('name', event.target.value)} required maxLength={160}/></label><label>Dự án<input value={form.project} onChange={event => update('project', event.target.value)} required maxLength={100}/></label></div><label>Đường dẫn<input value={form.slug} onChange={event => update('slug', event.target.value.toLowerCase())} placeholder="giveaway-community-2026" pattern="[a-z0-9]+(-[a-z0-9]+)*" required readOnly={Boolean(slug)}/></label><label>Mô tả<textarea rows={3} value={form.description} onChange={event => update('description', event.target.value)} required maxLength={5000}/></label><div className="editor-row"><label>Loại chiến dịch<select value={form.campaign_type} onChange={event => update('campaign_type', event.target.value as CampaignType)}>{campaignTypes.map(type => <option key={type}>{type}</option>)}</select></label><label>Trạng thái<select value={form.status} onChange={event => update('status', event.target.value as CampaignForm['status'])}><option value="draft">Bản nháp</option><option value="upcoming">Sắp diễn ra</option><option value="active">Đang mở</option><option value="ended">Đã kết thúc</option></select></label></div><div className="editor-row"><label>Quyền lợi / phần thưởng<input value={form.reward} onChange={event => update('reward', event.target.value)} maxLength={500}/></label><label>Số suất (để trống nếu chưa giới hạn)<input type="number" min="1" step="1" value={form.capacity} onChange={event => update('capacity', event.target.value)}/></label></div><div className="editor-row"><label>Bắt đầu · giờ máy của bạn<input type="datetime-local" value={form.starts_at} onChange={event => update('starts_at', event.target.value)}/></label><label>Kết thúc · giờ máy của bạn<input type="datetime-local" value={form.ends_at} onChange={event => update('ends_at', event.target.value)}/></label></div><label>Task / điều kiện — mỗi dòng một mục<textarea rows={4} value={form.requirements} onChange={event => update('requirements', event.target.value)} placeholder={'Theo dõi tài khoản X của dự án\nĐăng hai bài viết gốc và gửi link minh chứng'}/></label><label className="checkbox"><input type="checkbox" checked={form.walletRequired} onChange={event => update('walletRequired', event.target.checked)}/><span>Yêu cầu địa chỉ ví EVM</span></label></div><div className="editor-save">{message && <p className="form-message" role="status">{message}</p>}<button className="button primary full" disabled={saving}>{saving ? 'Đang lưu…' : slug ? 'Lưu thay đổi' : 'Tạo chiến dịch'}</button></div></form>}</div></div></section>
}

type ApplicationRow = { id: string; x_username: string; x_profile_url: string; post_url_1: string; post_url_2: string; wallet_address: string | null; status: 'pending' | 'approved' | 'rejected'; submitted_at: string; updated_at: string; campaigns: { name: string } | null }
const reviewLabels = { all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' }
function ApplicationManager() {
  const [items, setItems] = useState<ApplicationRow[]>([]); const [filter, setFilter] = useState<keyof typeof reviewLabels>('all')
  const [loading, setLoading] = useState(true); const [message, setMessage] = useState(''); const [busyId, setBusyId] = useState('')
  const load = useCallback(async () => {
    if (!supabase) return
    setLoading(true); setMessage('')
    try {
      // PostgREST caps each response; page through all rows so CSV is never silently truncated.
      const rows: ApplicationRow[] = []
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await supabase.from('applications').select('id,x_username,x_profile_url,post_url_1,post_url_2,wallet_address,status,submitted_at,updated_at,campaigns(name)').order('submitted_at', { ascending: false }).order('id').range(offset, offset + 499)
        if (error) throw error
        const page = (data || []) as unknown as ApplicationRow[]
        rows.push(...page); if (page.length < 500) break
      }
      setItems(rows)
    } catch { setMessage('Không thể tải hồ sơ. Vui lòng thử lại.'); setItems([]) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  async function review(id: string, status: 'approved' | 'rejected') {
    if (!supabase || busyId) return
    setBusyId(id); setMessage('')
    const { data, error } = await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('status', 'pending').select('id').maybeSingle()
    if (error || !data) setMessage('Hồ sơ chưa được cập nhật hoặc đã được xử lý. Hãy tải lại danh sách.')
    else setItems(current => current.map(item => item.id === id ? { ...item, status } : item))
    setBusyId('')
  }
  const visible = filter === 'all' ? items : items.filter(item => item.status === filter)
  function exportRows() {
    downloadCsv(`mt-web3-ho-so-${filter}-${new Date().toLocaleDateString('sv-SE')}.csv`, [['ID hồ sơ', 'Chiến dịch', 'X handle', 'Link X', 'Bài viết 1', 'Bài viết 2', 'Ví EVM', 'Trạng thái', 'Ngày gửi'], ...visible.map(item => [item.id, item.campaigns?.name, item.x_username, item.x_profile_url, item.post_url_1, item.post_url_2, item.wallet_address, item.status, item.submitted_at])])
    setMessage(`Đã xuất ${visible.length} hồ sơ theo bộ lọc hiện tại.`)
  }
  return <section className="review-section"><div className="admin-toolbar"><div className="review-filters">{(Object.keys(reviewLabels) as (keyof typeof reviewLabels)[]).map(value => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{reviewLabels[value]}</button>)}</div><div><button className="icon-button" onClick={load} aria-label="Tải lại hồ sơ" disabled={loading}><RefreshCw size={18}/></button><button className="button secondary" disabled={loading || !visible.length} onClick={exportRows}><Download size={18}/> Xuất CSV ({visible.length})</button></div></div>{message && <p className="form-message" role="status">{message}</p>}<div className="applications-list">{loading ? <div className="empty">Đang tải hồ sơ…</div> : visible.length ? visible.map(item => <article className="application-row" key={item.id}><div className="application-person"><span className={`status ${item.status}`}>{reviewLabels[item.status]}</span><h3>@{item.x_username}</h3><p>{item.campaigns?.name || 'Chiến dịch'}</p><small>{new Date(item.submitted_at).toLocaleString('vi-VN')}</small><code className="row-id">{item.id}</code></div><div className="evidence-links"><a href={`https://x.com/${item.x_username}`} target="_blank" rel="noreferrer">Hồ sơ X <ExternalLink size={14}/></a><a href={item.post_url_1} target="_blank" rel="noreferrer">Bài 1 <ExternalLink size={14}/></a><a href={item.post_url_2} target="_blank" rel="noreferrer">Bài 2 <ExternalLink size={14}/></a></div><div className="review-actions"><button className="button approve" disabled={Boolean(busyId) || item.status !== 'pending'} onClick={() => review(item.id, 'approved')}><Check size={18}/> Duyệt</button><button className="button reject" disabled={Boolean(busyId) || item.status !== 'pending'} onClick={() => review(item.id, 'rejected')}><XCircle size={18}/> Từ chối</button></div></article>) : <div className="empty"><Users/><h3>Chưa có hồ sơ</h3><p>Đổi bộ lọc hoặc chờ cộng đồng gửi minh chứng.</p></div>}</div></section>
}

function Dashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]); const [tab, setTab] = useState('campaigns'); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!supabase) return
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }).then(({ data, error }) => { if (error) setError('Không thể tải chiến dịch.'); else setCampaigns((data as CampaignRow[]).map(mapCampaign)); setLoading(false) })
  }, [])
  return <section className="page section dashboard-page"><div className="container"><div className="admin-head"><div><p className="kicker">MT-WEB3 · CONTROL CENTER</p><h1 className="page-title">Không gian quản trị</h1></div><div className="dashboard-actions"><button className="button secondary" onClick={() => supabase?.auth.signOut()}><LogOut size={18}/> Đăng xuất</button><Link className="button primary" to="/admin/new"><Plus size={20}/> Tạo chiến dịch</Link></div></div><div className="workspace-tabs" role="tablist" aria-label="Quản trị"><button role="tab" aria-selected={tab === 'campaigns'} onClick={() => setTab('campaigns')}>Chiến dịch <span>{campaigns.length}</span></button><button role="tab" aria-selected={tab === 'applications'} onClick={() => setTab('applications')}>Hồ sơ & xuất CSV</button></div><div className="dashboard-content" role="tabpanel">{tab === 'campaigns' ? loading ? <div className="empty">Đang tải chiến dịch…</div> : error ? <p role="alert">{error}</p> : campaigns.length ? <div className="card-grid">{campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} admin/>)}</div> : <div className="empty"><h3>Bắt đầu với chiến dịch đầu tiên</h3><Link className="button primary" to="/admin/new">Tạo chiến dịch</Link></div> : <ApplicationManager/>}</div></div></section>
}

export function Admin() {
  const [session, setSession] = useState<Session | null>(null); const [authorized, setAuthorized] = useState<boolean | null>(null); const [checking, setChecking] = useState(true); const [message, setMessage] = useState('')
  const location = useLocation()
  const slug = location.pathname.match(/\/admin\/campaigns\/([^/]+)$/)?.[1]
  useEffect(() => {
    if (!supabase) { setChecking(false); return }
    const client = supabase; let active = true
    const finish = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        if (params.get('error_description')) setMessage(params.get('error_description')!)
        // The Supabase client handles the PKCE callback; avoid exchanging the same code twice.
        const { data, error } = await client.auth.getSession()
        if (!active) return
        if (error) setMessage(error.message)
        setSession(data.session)
        if (data.session && params.has('code')) window.history.replaceState({}, document.title, window.location.pathname)
      } finally { if (active) setChecking(false) }
    }
    void finish()
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => { if (active) setSession(nextSession) })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])
  useEffect(() => {
    let active = true
    if (!supabase || !session) { setAuthorized(false); return }
    setAuthorized(null)
    supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle().then(({ data, error }) => { if (active) { setAuthorized(Boolean(data)); if (error) setMessage('Không thể kiểm tra quyền quản trị. Thử đăng nhập lại.') } })
    return () => { active = false }
  }, [session])
  if (!isBackendConfigured) return <section className="page section"><div className="container empty"><h2>Backend chưa được cấu hình</h2></div></section>
  if (checking || (session && authorized === null)) return <section className="page section"><div className="container empty"><h2>Đang kiểm tra đăng nhập…</h2></div></section>
  if (!session) return <section className="page section auth-page"><div className="container narrow">{message && <p className="form-message" role="alert">{message}</p>}<LoginForm/></div></section>
  if (!authorized) return <section className="page section auth-page"><div className="container narrow admin-login"><LockKeyhole/><h2>Tài khoản chưa được cấp quyền</h2><p>{message || 'Liên hệ người quản trị để cấp quyền cho tài khoản của bạn.'}</p><button className="button secondary" onClick={() => supabase?.auth.signOut()}>Đăng xuất</button></div></section>
  if (slug || location.pathname.endsWith('/admin/new')) return <CampaignEditor key={slug || 'new'} slug={slug}/>
  return <Dashboard/>
}
