import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { normalizeUsername } from '../_shared/validation.ts'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } })
const sha256 = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))).map(b => b.toString(16).padStart(2, '0')).join('')
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await req.json()
    const handle = normalizeUsername(String(body.handle || ''))
    const code = String(body.code || '').trim().toUpperCase()
    if (handle ? !/^[a-z0-9_]{1,15}$/.test(handle) : !/^MT-[A-F0-9]{8}$/.test(code)) return json({ error: 'Handle X hoặc mã tra cứu không hợp lệ.' }, 400)
    const secret = Deno.env.get('HASH_SECRET')
    if (!secret) return json({ error: 'Hệ thống đang được cấu hình.' }, 503)
    const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || ''
    const key = await sha256(`${secret}:lookup:${ip || handle || code}`)
    const { data: allowed, error: rateError } = await client.rpc('consume_application_rate_limit', { key_hash: key, max_requests: 30, window_seconds: 900 })
    if (rateError) return json({ error: 'Hệ thống đang bận. Vui lòng thử lại sau.' }, 503)
    if (!allowed) return json({ error: 'Tra cứu quá nhiều lần. Vui lòng thử lại sau 15 phút.' }, 429)
    let query = client.from('applications').select('id,status,updated_at,campaigns!inner(name,status)').neq('campaigns.status', 'draft').order('submitted_at', { ascending: false }).limit(100)
    query = handle ? query.eq('x_username_normalized', handle) : query.eq('lookup_code_hash', await sha256(`${secret}:${code}`))
    const { data, error } = await query
    if (error) throw error
    const applications = (data || []).map(row => ({ id: row.id, status: row.status, campaign: (row.campaigns as unknown as { name: string }).name, updatedAt: row.updated_at }))
    // Keep old receipt codes working while clients move to handle lookup.
    if (!handle) return applications.length ? json(applications[0]) : json({ error: 'Không tìm thấy hồ sơ.' }, 404)
    return json({ applications })
  } catch { return json({ error: 'Không thể tra cứu.' }, 500) }
})
