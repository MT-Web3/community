import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'

export const playSites = [
  { slug:'gm-radio',vi:'Đài GM',en:'GM radio',symbol:'☀',color:'#f7bd78' },
  { slug:'gas-cloud',vi:'Mây hết gas',en:'Out-of-gas cloud',symbol:'☁',color:'#9fd8bf' },
  { slug:'hodl-potato',vi:'Khoai HODL',en:'HODL potato',symbol:'🥔',color:'#edbda3' },
]
const jokes = {
  'gm-radio': {vi:['GM cả vũ trụ. Trừ cái đồng hồ báo thức.','Tin nóng: cà phê đã nguội.','Dự báo hôm nay: 99% khả năng cần ngủ thêm.','Alo? Sao Hỏa có nghe rõ không?'],en:['GM, universe. Except my alarm clock.','Breaking: the coffee is cold.','Forecast: 99% chance of another nap.','Hello? Can Mars hear me?']},
  'gas-cloud': {vi:['Mây này chạy bằng hơi thở dài.','Không đủ gas. Hãy thở dài thêm lần nữa.','Đang đồng bộ với… một con vịt.','Đã lên mây. Quên mang sạc.'],en:['This cloud runs on dramatic sighs.','Not enough gas. Please sigh again.','Synchronizing with… a duck.','Reached the cloud. Forgot the charger.']},
  'hodl-potato': {vi:['Khoai không nhìn chart. Khoai nhìn bạn.','Đừng FOMO. Hãy FÔ MAI.','Diamond hands. Mashed potato thoughts.','Khoai đã stake vào… nồi chiên.'],en:['Potato watches you. Not the chart.','Less FOMO. More cheese.','Diamond hands. Mashed potato thoughts.','Staked into… the air fryer.']},
}
export function Playground({ slug }: {slug: keyof typeof jokes}) {
  const {language} = useI18n()
  const site = playSites.find(item => item.slug === slug)!
  const [count,setCount] = useState(0)
  useEffect(() => { document.title = `${site[language]} • TΛM`; return () => { document.title = 'MT-Web3 Community' } },[site,language])
  return <section className={`play-page container play-${slug}`} style={{'--play-color':site.color} as React.CSSProperties}>
    <div className="play-heading"><p className="kicker">TΛM / {language === 'vi' ? 'PHÒNG THÍ NGHIỆM XÀM' : 'THE NONSENSE LAB'}</p><nav aria-label={language === 'vi' ? 'Các trang vui' : 'Play sites'}>{playSites.map(item => <Link key={item.slug} className={item.slug === slug ? 'selected' : ''} to={`/play/${item.slug}`}>{item.symbol} {item[language]}</Link>)}</nav></div>
    <div className="play-surface"><div className="play-text"><h1>{site[language]}<span>.</span></h1><p role="status" key={count}>{jokes[slug][language][count % 4]}</p><button className="button primary" onClick={() => setCount(count + 1)}>{language === 'vi' ? slug === 'gm-radio' ? 'Bắt sóng vũ trụ' : slug === 'gas-cloud' ? 'Thở dài một cái' : 'Chọc khoai' : slug === 'gm-radio' ? 'Tune into the universe' : slug === 'gas-cloud' ? 'Let out a sigh' : 'Poke the potato'} ↗</button><small>{language === 'vi' ? 'Chỉ để vui. Vũ trụ không tính phí.' : 'Just for fun. The universe charges no fee.'}</small></div><button className="play-object" aria-label={language === 'vi' ? 'Chạm nhân vật' : 'Tap character'} onClick={() => setCount(count + 1)} key={count}><span>{site.symbol}</span><i>{count % 2 ? '?!' : 'GM'}</i><b>{slug === 'hodl-potato' ? 'HODL ME' : 'NO SERIOUS BUSINESS'}</b></button></div>
    <div className="play-footer"><Link to="/story">← {language === 'vi' ? 'Về TΛMVERSE' : 'Back to TΛMVERSE'}</Link><span>{language === 'vi' ? 'Một chạm. Một chút vô tri.' : 'One tap. A little nonsense.'}</span></div>
  </section>
}
