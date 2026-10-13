import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type':'application/json' } })
const sha256 = async (value:string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('')
const xUrl = (value:string,post=false) => { try { const u=new URL(value); const parts=u.pathname.split('/').filter(Boolean); return u.protocol==='https:'&&['x.com','www.x.com','twitter.com','www.twitter.com'].includes(u.hostname.toLowerCase())&&parts.length>=(post?3:1)&&(!post||(parts[1]==='status'&&/^\d+$/.test(parts[2]))) } catch { return false } }

Deno.serve(async req => {
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders}); if(req.method!=='POST')return json({error:'Method not allowed'},405)
  try {
    const body=await req.json(); const username=String(body.xUsername||'').trim().replace(/^@/,'').toLowerCase();
    if(!/^[a-z0-9_]{1,15}$/.test(username)||!xUrl(body.xProfileUrl)||!xUrl(body.postUrl1,true)||!xUrl(body.postUrl2,true)||body.postUrl1===body.postUrl2||body.consent!==true)return json({error:'Dữ liệu không hợp lệ.'},400)
    const secret=Deno.env.get('HASH_SECRET')!; const ip=req.headers.get('cf-connecting-ip')||'unknown'; const ipHash=await sha256(`${secret}:${ip}`)
    const turnstileSecret=Deno.env.get('TURNSTILE_SECRET_KEY'); if(turnstileSecret){const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:turnstileSecret,response:String(body.turnstileToken||''),remoteip:ip})}).then(r=>r.json());if(!check.success)return json({error:'Xác minh chống bot thất bại.'},403)}
    const supabase=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!); const since=new Date(Date.now()-15*60_000).toISOString(); const {count}=await supabase.from('applications').select('*',{count:'exact',head:true}).eq('ip_hash',ipHash).gte('submitted_at',since);if((count||0)>=3)return json({error:'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.'},429)
    const {data:campaign}=await supabase.from('campaigns').select('id,status,starts_at,ends_at').eq('id',body.campaignId).single(); const now=Date.now(); if(!campaign||campaign.status!=='active'||(campaign.starts_at&&Date.parse(campaign.starts_at)>now)||(campaign.ends_at&&Date.parse(campaign.ends_at)<now))return json({error:'Chiến dịch hiện không nhận đăng ký.'},409)
    const code=`MT-${crypto.randomUUID().replaceAll('-','').slice(0,8).toUpperCase()}`; const lookupHash=await sha256(`${secret}:${code}`); const userAgentHash=await sha256(`${secret}:${req.headers.get('user-agent')||''}`)
    const {error}=await supabase.from('applications').insert({campaign_id:campaign.id,x_username:username,x_profile_url:body.xProfileUrl,post_url_1:body.postUrl1,post_url_2:body.postUrl2,wallet_address:body.walletAddress||null,lookup_code_hash:lookupHash,ip_hash:ipHash,user_agent_hash:userAgentHash,consented_at:new Date().toISOString()});if(error?.code==='23505')return json({error:'Tài khoản này đã đăng ký chiến dịch.'},409);if(error)throw error
    return json({code,status:'pending'},201)
  } catch { return json({error:'Không thể xử lý yêu cầu.'},500) }
})
