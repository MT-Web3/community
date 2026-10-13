import { useI18n } from '../lib/i18n'
import { Check, Download, ExternalLink, Github, LockKeyhole, LogOut, Plus, RefreshCw, Users, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { CampaignCard } from '../components/CampaignCard'
import { DateTimePicker } from '../components/DateTimePicker'
import { campaignPayload, campaignTypes, toLocalDateTime, type CampaignForm } from '../lib/campaign-form'
import { downloadCsv } from '../lib/csv'
import { isBackendConfigured, mapCampaign, supabase, type CampaignRow } from '../lib/supabase'
import type { Campaign, CampaignType } from '../types'

function LoginForm() {
  const { t } = useI18n()

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
    setMessage(error ? error.message : "Đã gửi liên kết đăng nhập. Kiểm tra email của bạn."); setBusy(false)
  }
  return <div className="admin-login auth-stack"><LockKeyhole/><h2>{t("Không gian quản trị")}</h2><p>{t("Đăng nhập để tạo chiến dịch và xét duyệt đóng góp.")}</p><button className="button primary full" disabled={busy} onClick={githubLogin}><Github size={20}/>{" " + t("Tiếp tục với GitHub")}</button><div className="auth-divider">{t("hoặc magic link")}</div><form onSubmit={login}><input aria-label={t("Email quản trị")} type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={t("Email quản trị")} required/><button className="button secondary full" disabled={busy}>{t("Gửi liên kết đăng nhập")}</button></form>{message && <p className="form-message" role="status">{t(message || '')}</p>}</div>
}

const emptyForm: CampaignForm = { slug: '', name: '', project: '', description: '', campaign_type: 'Giveaway', status: 'draft', reward: '', capacity: '', starts_at: '', ends_at: '', requirements: '', walletRequired: false }
function CampaignEditor({ slug }: { slug?: string }) {
  const { t } = useI18n()

  const navigate = useNavigate()
  const [form, setForm] = useState<CampaignForm>({ ...emptyForm })
  const [formConfig, setFormConfig] = useState<Record<string, unknown>>({})
  const [enContent, setEnContent] = useState({ name: '', description: '', reward: '', requirements: '' })
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
        const en = data.form_config?.translations?.en || {}
        setEnContent({ name: en.name || '', description: en.description || '', reward: en.reward || '', requirements: (en.requirements || []).join('\n') })
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [slug])
  function update<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) { setForm(current => ({ ...current, [key]: value, ...(!slug && key === 'name' ? { slug: String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80).replace(/-$/,'') } : {}) })) }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!supabase) return
    setMessage(''); setSaving(true)
    try {
      const payload = { ...campaignPayload(form), form_config: { ...formConfig, translations: { ...((formConfig.translations || {}) as object), en: { name: enContent.name.trim(), description: enContent.description.trim(), reward: enContent.reward.trim(), requirements: enContent.requirements.split('\n').map(item => item.trim()).filter(Boolean) } }, walletRequired: form.walletRequired, fields: ['xUsername', 'postUrl1', 'postUrl2', ...(form.walletRequired ? ['walletAddress'] : [])] } }
      const query = slug ? supabase.from('campaigns').update(payload).eq('slug', slug) : supabase.from('campaigns').insert(payload)
      const { data, error } = await query.select('slug').single()
      if (error) throw error
      if (!slug) navigate(`/admin/campaigns/${data.slug}`, { replace: true })
      setMessage("Đã lưu chiến dịch. Trạng thái và thời gian quyết định khi nào nhận đăng ký.")
    } catch (err) { setMessage(err instanceof Error ? err.message : "Không thể lưu chiến dịch. Kiểm tra đường dẫn có bị trùng không.") }
    finally { setSaving(false) }
  }
  const preview: Campaign = { translations: { en: { name: enContent.name, description: enContent.description, reward: enContent.reward, requirements: enContent.requirements.split('\n').filter(Boolean) } }, id: 'preview', slug: form.slug, name: form.name || t("Tên chiến dịch của bạn"), project: form.project || 'PROJECT', description: form.description || t("Mô tả ngắn về cơ hội dành cho cộng đồng."), longDescription: form.description, type: form.campaign_type, status: form.status, reward: form.reward || t("Quyền lợi đang cập nhật"), capacity: Number(form.capacity) || null, startsAt: form.starts_at || null, endsAt: form.ends_at || null, requirements: form.requirements.split('\n').filter(Boolean), walletRequired: form.walletRequired, accent: '#ffd400' }
  return <section className="page section editor-page"><div className="container"><div className="workspace-heading"><Link className="back" to="/admin">{t("← Dashboard")}</Link><span className={`status ${form.status}`}>{slug ? t("CHỈNH SỬA") : t("CHIẾN DỊCH MỚI")} · {t({draft: 'Bản nháp', upcoming: 'Sắp diễn ra', active: 'Đang mở', ended: 'Đã kết thúc'}[form.status])}</span></div><div className="detail-grid admin-detail-grid"><aside className="editor-preview"><p className="kicker">{t("XEM TRƯỚC")}</p><CampaignCard campaign={preview}/><div className="privacy-note"><LockKeyhole size={20}/><p>{t("Form cơ bản: handle X, hai link minh chứng và ví tùy chọn. Task được admin xét duyệt thủ công; không tự xác minh follow hoặc chọn người thắng.")}</p></div></aside>{loading ? <div className="empty"><h2>{t("Đang tải…")}</h2></div> : <form className="form-panel admin-editor" onSubmit={save}><h2>{slug ? t("Cấu hình chiến dịch") : t("Tạo chiến dịch")}</h2><div className="editor-fields"><div className="editor-row"><label>{t("Tên chiến dịch")}<input value={form.name} onChange={event => update('name', event.target.value)} required maxLength={160}/></label><label>{t("Dự án")}<input value={form.project} onChange={event => update('project', event.target.value)} required maxLength={100}/></label></div><label>{t("Mô tả")}<textarea rows={3} value={form.description} onChange={event => update('description', event.target.value)} required maxLength={5000}/></label><div className="editor-row"><label>{t("Loại chiến dịch")}<select value={form.campaign_type} onChange={event => update('campaign_type', event.target.value as CampaignType)}>{campaignTypes.map(type => <option key={type} value={type}>{t(type)}</option>)}</select></label><label>{t("Trạng thái")}<select value={form.status} onChange={event => update('status', event.target.value as CampaignForm['status'])}><option value="draft">{t("Bản nháp")}</option><option value="upcoming">{t("Sắp diễn ra")}</option><option value="active">{t("Đang mở")}</option><option value="ended">{t("Đã kết thúc")}</option></select></label></div><div className="editor-row"><label>{t("Quyền lợi / phần thưởng")}<input value={form.reward} onChange={event => update('reward', event.target.value)} maxLength={500}/></label><label>{t("Số suất (để trống nếu chưa giới hạn)")}<input type="number" min="1" step="1" value={form.capacity} onChange={event => update('capacity', event.target.value)}/></label></div><p className="fine">{t("Ngày bắt đầu là bắt buộc. Hạn kết thúc có thể để mở.")}</p><div className="editor-row"><DateTimePicker label={t("Bắt đầu")} value={form.starts_at} onChange={value => update('starts_at', value)} required/><DateTimePicker label={t("Kết thúc")} value={form.ends_at} onChange={value => update('ends_at', value)}/></div><label>{t("Task / điều kiện — mỗi dòng một mục")}<textarea rows={4} value={form.requirements} onChange={event => update('requirements', event.target.value)} placeholder={t("Theo dõi tài khoản X của dự án\nĐăng hai bài viết gốc và gửi link minh chứng")}/></label><details className="translation-editor"><summary>{t("Bản tiếng Anh (tùy chọn)")}</summary><p className="fine">{t("Nội dung chưa có bản dịch sẽ hiển thị theo bản gốc.")}</p><label>{t("Tên tiếng Anh")}<input value={enContent.name} onChange={event => setEnContent(current => ({ ...current, name: event.target.value }))}/></label><label>{t("Mô tả tiếng Anh")}<textarea rows={3} value={enContent.description} onChange={event => setEnContent(current => ({ ...current, description: event.target.value }))}/></label><label>{t("Quyền lợi tiếng Anh")}<input value={enContent.reward} onChange={event => setEnContent(current => ({ ...current, reward: event.target.value }))}/></label><label>{t("Task tiếng Anh — mỗi dòng một mục")}<textarea rows={3} value={enContent.requirements} onChange={event => setEnContent(current => ({ ...current, requirements: event.target.value }))}/></label></details><label className="checkbox"><input type="checkbox" checked={form.walletRequired} onChange={event => update('walletRequired', event.target.checked)}/><span>{t("Yêu cầu địa chỉ ví EVM")}</span></label></div><div className="editor-save">{message && <p className="form-message" role="status">{t(message || '')}</p>}<button className="button primary full" disabled={saving}>{saving ? t("Đang lưu…") : slug ? t("Lưu thay đổi") : t("Tạo chiến dịch")}</button></div></form>}</div></div></section>
}

type ApplicationRow = { id: string; x_username: string; x_profile_url: string; post_url_1: string; post_url_2: string; wallet_address: string | null; status: 'pending' | 'approved' | 'rejected'; submitted_at: string; updated_at: string; campaigns: { name: string } | null }
const reviewLabels = { all: 'Tất cả', pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Từ chối' }
function ApplicationManager() {
  const { t, locale } = useI18n()

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
    } catch { setMessage("Không thể tải hồ sơ. Vui lòng thử lại."); setItems([]) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  async function review(id: string, status: 'approved' | 'rejected') {
    if (!supabase || busyId) return
    setBusyId(id); setMessage('')
    const { data, error } = await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id).eq('status', 'pending').select('id').maybeSingle()
    if (error || !data) setMessage("Hồ sơ chưa được cập nhật hoặc đã được xử lý. Hãy tải lại danh sách.")
    else setItems(current => current.map(item => item.id === id ? { ...item, status } : item))
    setBusyId('')
  }
  const visible = filter === 'all' ? items : items.filter(item => item.status === filter)
  function exportRows() {
    downloadCsv(`mt-web3-ho-so-${filter}-${new Date().toLocaleDateString('sv-SE')}.csv`, [[t("Chiến dịch"), 'X handle', t("Link X"), t("Bài viết 1"), t("Bài viết 2"), t("Ví EVM"), t("Trạng thái"), t("Ngày gửi")], ...visible.map(item => [item.campaigns?.name, item.x_username, item.x_profile_url, item.post_url_1, item.post_url_2, item.wallet_address, item.status, item.submitted_at])])
    setMessage(`Đã xuất ${visible.length} hồ sơ theo bộ lọc hiện tại.`)
  }
  return <section className="review-section"><div className="admin-toolbar"><div className="review-filters">{(Object.keys(reviewLabels) as (keyof typeof reviewLabels)[]).map(value => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{t(reviewLabels[value])}</button>)}</div><div><button className="icon-button" onClick={load} aria-label={t("Tải lại hồ sơ")} disabled={loading}><RefreshCw size={18}/></button><button className="button secondary" disabled={loading || !visible.length} onClick={exportRows}><Download size={18}/>{" " + t("Xuất CSV (")}{visible.length})</button></div></div>{message && <p className="form-message" role="status">{t(message || '')}</p>}<div className="applications-list">{loading ? <div className="empty">Đang tải hồ sơ…</div> : visible.length ? visible.map(item => <article className="application-row" key={item.id}><div className="application-person"><span className={`status ${item.status}`}>{t(reviewLabels[item.status])}</span><h3>@{item.x_username}</h3><p>{item.campaigns?.name || t("Chiến dịch")}</p><small>{new Date(item.submitted_at).toLocaleString(locale)}</small></div><div className="evidence-links"><a href={`https://x.com/${item.x_username}`} target="_blank" rel="noreferrer">{t("Hồ sơ X") + " "}<ExternalLink size={14}/></a><a href={item.post_url_1} target="_blank" rel="noreferrer">{t("Bài 1") + " "}<ExternalLink size={14}/></a><a href={item.post_url_2} target="_blank" rel="noreferrer">{t("Bài 2") + " "}<ExternalLink size={14}/></a></div><div className="review-actions"><button className="button approve" disabled={Boolean(busyId) || item.status !== 'pending'} onClick={() => review(item.id, 'approved')}><Check size={18}/>{" " + t("Duyệt")}</button><button className="button reject" disabled={Boolean(busyId) || item.status !== 'pending'} onClick={() => review(item.id, 'rejected')}><XCircle size={18}/>{" " + t("Từ chối")}</button></div></article>) : <div className="empty"><Users/><h3>{t("Chưa có hồ sơ")}</h3><p>{t("Đổi bộ lọc hoặc chờ cộng đồng gửi minh chứng.")}</p></div>}</div></section>
}

function Dashboard() {
  const { t } = useI18n()

  const [campaigns, setCampaigns] = useState<Campaign[]>([]); const [tab, setTab] = useState('campaigns'); const [error, setError] = useState(''); const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!supabase) return
    supabase.from('campaigns').select('*').order('created_at', { ascending: false }).then(({ data, error }) => { if (error) setError("Không thể tải chiến dịch."); else setCampaigns((data as CampaignRow[]).map(mapCampaign)); setLoading(false) })
  }, [])
  return <section className="page section dashboard-page"><div className="container"><div className="admin-head"><div><p className="kicker">MT-WEB3 · {t('QUẢN TRỊ')}</p><h1 className="page-title">{t("Không gian quản trị")}</h1></div><div className="dashboard-actions"><button className="button secondary" onClick={() => supabase?.auth.signOut()}><LogOut size={18}/>{" " + t("Đăng xuất")}</button><Link className="button primary" to="/admin/new"><Plus size={20}/>{" " + t("Tạo chiến dịch")}</Link></div></div><div className="workspace-tabs" role="tablist" aria-label={t("Quản trị")}><button role="tab" aria-selected={tab === 'campaigns'} onClick={() => setTab('campaigns')}>{t("Chiến dịch") + " "}<span>{campaigns.length}</span></button><button role="tab" aria-selected={tab === 'applications'} onClick={() => setTab('applications')}>{t("Hồ sơ & xuất CSV")}</button></div><div className="dashboard-content" role="tabpanel">{tab === 'campaigns' ? loading ? <div className="empty">{t("Đang tải chiến dịch…")}</div> : error ? <p role="alert">{t(error || '')}</p> : campaigns.length ? <div className="card-grid">{campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} admin/>)}</div> : <div className="empty"><h3>{t("Bắt đầu với chiến dịch đầu tiên")}</h3><Link className="button primary" to="/admin/new">{t("Tạo chiến dịch")}</Link></div> : <ApplicationManager/>}</div></div></section>
}

export function Admin() {
  const { t } = useI18n()

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
    supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle().then(({ data, error }) => { if (active) { setAuthorized(Boolean(data)); if (error) setMessage("Không thể kiểm tra quyền quản trị. Thử đăng nhập lại.") } })
    return () => { active = false }
  }, [session])
  if (!isBackendConfigured) return <section className="page section"><div className="container empty"><h2>{t("Backend chưa được cấu hình")}</h2></div></section>
  if (checking || (session && authorized === null)) return <section className="page section"><div className="container empty"><h2>{t("Đang kiểm tra đăng nhập…")}</h2></div></section>
  if (!session) return <section className="page section auth-page"><div className="container narrow">{message && <p className="form-message" role="alert">{t(message || '')}</p>}<LoginForm/></div></section>
  if (!authorized) return <section className="page section auth-page"><div className="container narrow admin-login"><LockKeyhole/><h2>{t("Tài khoản chưa được cấp quyền")}</h2><p>{message || t("Liên hệ người quản trị để cấp quyền cho tài khoản của bạn.")}</p><button className="button secondary" onClick={() => supabase?.auth.signOut()}>{t("Đăng xuất")}</button></div></section>
  if (slug || location.pathname.endsWith('/admin/new')) return <CampaignEditor key={slug || 'new'} slug={slug}/>
  return <Dashboard/>
}
