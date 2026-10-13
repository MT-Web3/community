import { CalendarDays, ChevronLeft, ChevronRight, Clock3, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { toLocalDateTime } from '../lib/campaign-form'
import { useI18n } from '../lib/i18n'

export function DateTimePicker({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  const { t, locale } = useI18n()
  const id = useId(), trigger = useRef<HTMLButtonElement>(null), dialog = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(() => value ? new Date(value) : new Date())
  const [month, setMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1))
  function show() {
    const date = value ? new Date(value) : new Date()
    date.setSeconds(0, 0); setSelected(date); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); setOpen(true)
  }
  function close() { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()) }
  useEffect(() => {
    if (!open) return
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus()
    function keys(event: KeyboardEvent) {
      if (event.key === 'Escape') { event.preventDefault(); close() }
      if (event.key === 'Tab') {
        const items = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select')
        if (!items?.length) return
        const first = items[0], last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keys)
    return () => document.removeEventListener('keydown', keys)
  }, [open])
  const firstDay = (month.getDay() + 6) % 7
  const days = Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - firstDay + 1))
  const today = new Date()
  function pick(date: Date) { const next = new Date(date); next.setHours(selected.getHours(), selected.getMinutes(), 0, 0); setSelected(next) }
  function setTime(hours: number, minutes: number) { const next = new Date(selected); next.setHours(hours, minutes, 0, 0); setSelected(next) }
  const years = Array.from(new Set([...Array.from({ length: 11 }, (_, i) => today.getFullYear() - 3 + i), month.getFullYear()])).sort((a, b) => a - b)
  return <div className="date-control"><span id={id}>{label}{required && <b aria-hidden="true"> *</b>}</span><button ref={trigger} type="button" className={`date-trigger ${!value ? 'unselected' : ''}`} aria-labelledby={id} aria-haspopup="dialog" aria-expanded={open} onClick={show}><CalendarDays size={22}/><span>{value ? new Intl.DateTimeFormat(locale, { day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false }).format(new Date(value)) : t(required ? 'Chọn ngày & giờ bắt đầu' : 'Không đặt hạn kết thúc')}</span><ChevronRight size={18}/></button>
  {open && createPortal(<div className="calendar-backdrop" onPointerDown={event => { if (event.target === event.currentTarget) close() }}><div ref={dialog} className="calendar-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}><div className="calendar-title"><h2 id={`${id}-title`}>{label}</h2><button type="button" className="icon-button" onClick={close} aria-label={t('Đóng lịch')}><X size={20}/></button></div><div className="calendar-navigation"><button type="button" className="icon-button" aria-label={t('Tháng trước')} onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}><ChevronLeft size={20}/></button><select aria-label={t('Tháng')} value={month.getMonth()} onChange={event => setMonth(new Date(month.getFullYear(), Number(event.target.value), 1))}>{Array.from({length:12},(_,index) => <option key={index} value={index}>{new Intl.DateTimeFormat(locale,{month:'long'}).format(new Date(2026,index,1))}</option>)}</select><select aria-label={t('Năm')} value={month.getFullYear()} onChange={event => setMonth(new Date(Number(event.target.value),month.getMonth(),1))}>{years.map(year => <option key={year}>{year}</option>)}</select><button type="button" className="icon-button" aria-label={t('Tháng sau')} onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}><ChevronRight size={20}/></button></div><div className="calendar-weekdays">{Array.from({length:7},(_,i) => <span key={i}>{new Intl.DateTimeFormat(locale,{weekday:'short'}).format(new Date(2026,0,5+i))}</span>)}</div><div className="calendar-days">{days.map(date => <button key={date.toISOString()} type="button" className={`${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${date.toDateString() === selected.toDateString() ? 'selected' : ''} ${date.toDateString() === today.toDateString() ? 'today' : ''}`} aria-label={new Intl.DateTimeFormat(locale,{dateStyle:'full'}).format(date)} aria-pressed={date.toDateString() === selected.toDateString()} onClick={() => pick(date)}>{date.getDate()}</button>)}</div><div className="calendar-time"><Clock3 size={21}/><label>{t('Giờ')}<select value={selected.getHours()} onChange={event => setTime(Number(event.target.value),selected.getMinutes())}>{Array.from({length:24},(_,i) => <option key={i} value={i}>{String(i).padStart(2,'0')}</option>)}</select></label><span>:</span><label>{t('Phút')}<select value={selected.getMinutes()} onChange={event => setTime(selected.getHours(),Number(event.target.value))}>{Array.from({length:60},(_,i) => <option key={i} value={i}>{String(i).padStart(2,'0')}</option>)}</select></label></div><div className="calendar-shortcuts"><button type="button" onClick={() => { const now = new Date(); setSelected(now); setMonth(new Date(now.getFullYear(),now.getMonth(),1)) }}>{t('Bây giờ')}</button>{!required && <button type="button" onClick={() => { onChange(''); close() }}>{t('Không đặt hạn')}</button>}</div><p className="fine">{t('Theo múi giờ của bạn')}: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p><button type="button" className="button primary full" onClick={() => { onChange(toLocalDateTime(selected.toISOString())); close() }}>{t('Xác nhận ngày & giờ')}</button></div></div>,document.body)}</div>
}
