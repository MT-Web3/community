import { useI18n } from '../lib/i18n'
import { Moon, Sun, Menu, X, ExternalLink } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { LiquidInteractions } from './LiquidInteractions'

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
        <NavLink to="/status" onClick={() => setOpen(false)}>{t("Tra cứu")}</NavLink>
        <NavLink to="/story" onClick={() => setOpen(false)}>{language === 'vi' ? 'Câu chuyện' : 'Story'}</NavLink>
      </nav>
      <div className="nav-actions">
        <div className="language-buttons" role="group" aria-label={t('Ngôn ngữ')}>{(['vi','en'] as const).map(item => <button key={item} aria-pressed={language === item} onClick={() => setLanguage(item)}>{item.toUpperCase()}</button>)}</div>
        <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={t("Đổi giao diện")}>{theme === 'dark' ? <Sun /> : <Moon />}</button>
        <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label={t("Mở menu")}>{open ? <X /> : <Menu />}</button>
      </div>
    </div></header>
    <main><div className="view-transition" key={pathname}><Suspense fallback={<div className="empty"><h2>{t("Đang tải…")}</h2></div>}><Outlet /></Suspense></div></main>
    <footer><div className="container footer-grid"><Logo /><p>{t("Nền tảng chiến dịch cộng đồng Web3 minh bạch, bảo mật và có trách nhiệm.")}</p><div className="footer-owner"><a href="https://x.com/daomintam" target="_blank" rel="noreferrer" aria-label={language === 'vi' ? 'Theo dõi MT-Web3 trên X' : 'Follow MT-Web3 on X'} title="X · MT-Web3"><span className="x-icon" aria-hidden="true">𝕏</span><span>{language === 'vi' ? 'Theo dõi MT-Web3' : 'Follow MT-Web3'}</span><ExternalLink size={13}/></a><p className="dev-sign">{language === 'vi' ? 'Thiết kế & phát triển bởi MT-Web3' : 'Designed & built by MT-Web3'}</p><p className="fine">© 2026 MT-Web3 Community</p></div></div></footer>
  </div>
}
