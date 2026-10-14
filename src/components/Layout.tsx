import { useI18n } from '../lib/i18n'
import { Moon, Sun, Menu, X, ExternalLink, BadgeCheck } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { LiquidInteractions } from './LiquidInteractions'
import { XLogo } from './XLogo'

export function Layout() {
  const { pathname } = useLocation()
  const { t, language, setLanguage } = useI18n()

  const [theme, setTheme] = useState(() => localStorage.getItem('mt-theme') || 'light')
  const [open, setOpen] = useState(false)
  useEffect(()=>{setOpen(false)},[pathname])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('mt-theme', theme) }, [theme])
  return <div className="app-shell">
    <LiquidInteractions />
    <header className="header"><div className="container nav-wrap">
      <Link to="/" onClick={() => setOpen(false)}><Logo /></Link>
      <nav className={open ? 'nav open' : 'nav'} aria-label={t("Điều hướng chính")}>
        <NavLink to="/" end onClick={() => setOpen(false)}>{t("Trang chủ")}</NavLink>
        <NavLink to="/campaigns" onClick={() => setOpen(false)}>{t("Chiến dịch")}</NavLink>
        <NavLink to="/story" onClick={() => setOpen(false)}>{language === 'vi' ? 'Câu chuyện' : 'Story'}</NavLink>
      </nav>
      <div className="nav-actions">
        <div className="language-buttons" role="group" aria-label={t('Ngôn ngữ')}>{(['vi','en'] as const).map(item => <button key={item} aria-pressed={language === item} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div>
        <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={t("Đổi giao diện")}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
        <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label={t("Mở menu")}>{open ? <X /> : <Menu />}</button>
      </div>
    </div></header>
    <main><div className="view-transition" key={pathname}><Suspense fallback={<div className="empty"><h2>{t("Đang tải…")}</h2></div>}><Outlet /></Suspense></div></main>
    <footer className="profile-footer"><a className="x-profile-card footer-profile-card" href="https://x.com/daomintam" target="_blank" rel="noreferrer" aria-label={t("Mở hồ sơ TΛM trên X")}><img className="x-profile-card-avatar" src="/community/assets/tam-profile.png" alt="TΛM"/><span className="x-profile-card-body"><span className="x-profile-card-name">TΛM <img className="diamond-emoji" src="https://abs.twimg.com/emoji/v2/svg/1f536.svg" alt="" aria-hidden="true"/> <BadgeCheck className="verified-badge" size={15} fill="currentColor"/></span><span className="x-profile-card-handle">@daomintam</span><span className="x-profile-card-bio">{t("Dev · Web3 & Crypto · Creator")}</span><span className="x-profile-card-meta"><span><b>9.295</b> {t("Đang theo dõi")}</span><span><b>9.339</b> {t("Người theo dõi")}</span></span></span><span className="x-profile-card-action"><XLogo size={15}/><ExternalLink size={13}/></span></a></footer>
  </div>
}
