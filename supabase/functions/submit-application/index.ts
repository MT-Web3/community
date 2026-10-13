import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { normalizeUsername, normalizeXUrl, xPostId } from '../_shared/validation.ts'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
const sha256 = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(b => b.toString(16).padStart(2, '0')).join('')

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await req.json()
    const username = normalizeUsername(String(body.xUsername || ''))
    const post1 = normalizeXUrl(String(body.postUrl1 || '')), post2 = normalizeXUrl(String(body.postUrl2 || ''))
    const firstId = xPostId(post1), secondId = xPostId(post2)
    if (!/^[a-z0-9_]{1,15}$/.test(username) || !firstId || !secondId || firstId === secondId || body.consent !== true) return json({ error: 'Handle hoặc minh chứng không hợp lệ. Hai bài đăng phải khác nhau.' }, 400)
    const secret = Deno.env.get('HASH_SECRET')
    if (!secret) return json({ error: 'Hệ thống đang được cấu hình. Vui lòng thử lại sau.' }, 503)
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
    const ipHash = await sha256(`${secret}:submit:${ip || username}`)
    const { data: allowed, error: limitError } = await supabase.rpc('consume_application_rate_limit', { key_hash: ipHash, max_requests: 5, window_seconds: 900 })
    if (limitError) return json({ error: 'Hệ thống đang bận. Vui lòng thử lại sau.' }, 503)
    if (!allowed) return json({ error: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' }, 429)
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (turnstileSecret) {
      const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret: turnstileSecret, response: String(body.turnstileToken || ''), ...(ip ? { remoteip: ip } : {}) }) }).then(response => response.json())
      if (!check.success) return json({ error: 'Xác minh chống bot thất bại.' }, 403)
    }
    const { data: campaign, error: campaignError } = await supabase.from('campaigns').select('id,status,starts_at,ends_at,form_config').eq('id', body.campaignId).single()
    if (campaignError || !campaign) return json({ error: 'Không tìm thấy chiến dịch.' }, 404)
    const now = Date.now()
    if (campaign.status !== 'active' || (campaign.starts_at && Date.parse(campaign.starts_at) > now) || (campaign.ends_at && Date.parse(campaign.ends_at) < now)) return json({ error: 'Chiến dịch hiện không nhận đăng ký.' }, 409)
    const wallet = String(body.walletAddress || '').trim() || null
    if ((wallet && !/^0x[a-fA-F0-9]{40}$/.test(wallet)) || (campaign.form_config?.walletRequired && !wallet)) return json({ error: 'Chiến dịch yêu cầu địa chỉ ví EVM hợp lệ.' }, 400)
    const id = crypto.randomUUID()
    const code = `MT-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`
    const { error } = await supabase.from('applications').insert({ id, campaign_id: campaign.id, x_username: username, x_profile_url: `https://x.com/${username}`, post_url_1: post1, post_url_2: post2, wallet_address: wallet, lookup_code_hash: await sha256(`${secret}:${code}`), ip_hash: ipHash, user_agent_hash: await sha256(`${secret}:${req.headers.get('user-agent') || ''}`), consented_at: new Date().toISOString() })
    if (error?.code === '23505') return json({ error: 'Handle này đã đăng ký chiến dịch. Dùng handle X để tra cứu hồ sơ.' }, 409)
    if (error) throw error
    return json({ id, code, status: 'pending' }, 201)
  } catch { return json({ error: 'Không thể xử lý yêu cầu.' }, 500) }
})
