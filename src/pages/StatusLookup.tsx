import { Search, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { lookupApplication } from '../lib/supabase'

export function StatusLookup() {
  const [code,setCode]=useState(''); const [result,setResult]=useState<{status:string;campaign:string;updatedAt:string}|null>(null); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  async function lookup(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');setResult(null);try{setResult(await lookupApplication(code.trim()))}catch(err){setError(err instanceof Error?err.message:'Không thể tra cứu.')}finally{setBusy(false)}}
  return <section className="page section"><div className="container narrow"><p className="kicker">HỒ SƠ CỦA BẠN</p><h1 className="page-title">Tra cứu trạng thái</h1><p className="page-intro">Nhập mã riêng được cấp sau khi đăng ký. Kết quả không tiết lộ dữ liệu cá nhân.</p><form className="lookup-card" onSubmit={lookup}><ShieldCheck/><label>Mã tra cứu<input value={code} onChange={e=>setCode(e.target.value)} placeholder="MT-XXXX-XXXX" required minLength={8}/></label><button className="button primary" disabled={busy||!code.trim()}><Search size={18}/>{busy?'Đang tra cứu':'Tra cứu'}</button>{error&&<p className="error">{error}</p>}{result&&<div className="result"><span className={`status ${result.status.toLowerCase()}`}>{result.status}</span><h3>{result.campaign}</h3><p>Cập nhật: {new Date(result.updatedAt).toLocaleString('vi-VN')}</p></div>}<p className="fine">Để bảo vệ quyền riêng tư, hệ thống không cho phép tìm kiếm bằng username hoặc địa chỉ ví.</p></form></div></section>
}
