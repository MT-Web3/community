import { useI18n } from '../lib/i18n'
import { Moon, Sun, Menu, X, ExternalLink } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'
import { LiquidInteractions } from './LiquidInteractions'
import { XLogo } from './XLogo'

export function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t, language, setLanguage } = useI18n()

  const [theme, setTheme] = useState(() => localStorage.getItem('mt-theme') || 'light')
  const [open, setOpen] = useState(false)
  const [holdingAvatar, setHoldingAvatar] = useState(false)
  const holdTimer = useRef<number | null>(null); const feedbackTimer = useRef<number | null>(null)
  const startSecretHold = () => { setHoldingAvatar(false); feedbackTimer.current = window.setTimeout(() => setHoldingAvatar(true), 2000); holdTimer.current = window.setTimeout(() => { holdTimer.current = null; setHoldingAvatar(false); const next = { ...menuConfig, admin: true }; localStorage.setItem('mt-menu-config', JSON.stringify(next)); setMenuConfig(next) }, 3000) }
  const cancelSecretHold = () => { if (holdTimer.current !== null) window.clearTimeout(holdTimer.current); if (feedbackTimer.current !== null) window.clearTimeout(feedbackTimer.current); holdTimer.current = null; feedbackTimer.current = null; setHoldingAvatar(false) }
  const [menuConfig, setMenuConfig] = useState<Record<string, boolean>>(() => JSON.parse(localStorage.getItem('mt-menu-config') || '{}'))
  useEffect(() => { const sync = () => setMenuConfig(JSON.parse(localStorage.getItem('mt-menu-config') || '{}')); window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync) }, [])
  useEffect(()=>{setOpen(false)},[pathname])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('mt-theme', theme) }, [theme])
  const isHome = pathname === '/'
  return <div className={`app-shell${isHome ? ' has-profile-footer' : ''}`}>
    <LiquidInteractions />
    <header className="header"><div className="container nav-wrap">
      <Link className={holdingAvatar ? 'secret-hold-active' : ''} to="/" onClick={() => { cancelSecretHold(); setOpen(false) }} onPointerDown={startSecretHold} onPointerUp={cancelSecretHold} onPointerCancel={cancelSecretHold} onPointerLeave={cancelSecretHold} onContextMenu={event => event.preventDefault()}><Logo /></Link>
      <nav className={open ? 'nav open' : 'nav'} aria-label={t("Điều hướng chính")}>
        <NavLink to="/" end onClick={() => setOpen(false)}>{t("Trang chủ")}</NavLink>
        <NavLink to="/campaigns" onClick={() => setOpen(false)}>{t("Chiến dịch")}</NavLink>
        {menuConfig.about !== false && <NavLink to="/about" onClick={() => setOpen(false)}>{language === 'vi' ? 'Giới thiệu' : 'About'}</NavLink>}
        {menuConfig.story !== false && <NavLink to="/story" onClick={() => setOpen(false)}>{language === 'vi' ? 'Câu chuyện' : 'Story'}</NavLink>}
        {menuConfig.admin === true && <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>}
      </nav>
      <div className="nav-actions">
        <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={t("Đổi giao diện")}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
        <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label={t("Mở menu")}>{open ? <X /> : <Menu />}</button>
      </div>
    </div></header>
    <main><div className="view-transition" key={pathname}><Suspense fallback={<div className="empty"><h2>{t("Đang tải…")}</h2></div>}><Outlet /></Suspense></div></main>
    <footer className="profile-footer"><a className="x-profile-card footer-profile-card" href="https://x.com/daomintam" target="_blank" rel="noreferrer" aria-label={t("Mở hồ sơ TΛM trên X")}><img className="x-profile-card-avatar" src="/community/assets/ava.png" alt="TΛM"/><span className="avatar-sticker">HELLO<br/>WEB3!</span><span className="x-profile-card-body"><span className="x-profile-card-name">TΛM <img className="diamond-emoji" src="https://abs.twimg.com/emoji/v2/svg/1f536.svg" alt="" aria-hidden="true"/><svg className="verified-badge" viewBox="0 0 22 22" aria-label="Tài khoản đã xác nhận" role="img"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg></span><span className="x-profile-card-handle">@daomintam</span><span className="x-profile-card-bio">{t("Dev · Web3 & Crypto · Creator")}</span><span className="x-profile-card-meta"><span><b>9.295</b> {t("Đang theo dõi")}</span><span><b>9.339</b> {t("Người theo dõi")}</span></span></span><span className="x-profile-card-action"><XLogo size={19}/><ExternalLink size={15}/></span></a></footer>
  </div>
}
