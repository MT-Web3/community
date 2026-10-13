import { Moon, Sun, Menu, X, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Logo } from './Logo'

export function Layout() {
  const [theme, setTheme] = useState(() => localStorage.getItem('mt-theme') || 'dark')
  const [open, setOpen] = useState(false)
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('mt-theme', theme) }, [theme])
  return <div className="app-shell">
    <header className="header"><div className="container nav-wrap">
      <Link to="/" onClick={() => setOpen(false)}><Logo /></Link>
      <nav className={open ? 'nav open' : 'nav'} aria-label="Điều hướng chính">
        <NavLink to="/" onClick={() => setOpen(false)}>Trang chủ</NavLink>
        <NavLink to="/campaigns" onClick={() => setOpen(false)}>Chiến dịch</NavLink>
        <NavLink to="/status" onClick={() => setOpen(false)}>Tra cứu</NavLink>
        <NavLink to="/admin" onClick={() => setOpen(false)}>Quản trị</NavLink>
      </nav>
      <div className="nav-actions">
        <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Đổi giao diện">{theme === 'dark' ? <Sun /> : <Moon />}</button>
        <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-label="Mở menu">{open ? <X /> : <Menu />}</button>
      </div>
    </div></header>
    <main><Outlet /></main>
    <footer><div className="container footer-grid"><Logo /><p>Nền tảng chiến dịch cộng đồng Web3 minh bạch, bảo mật và có trách nhiệm.</p><div className="footer-owner"><a href="https://x.com/daomintam" target="_blank" rel="noreferrer" aria-label="X của TAM"><span className="x-icon">X</span> @daomintam <ExternalLink size={13}/></a><p className="fine">© 2026 MT-Web3 Community</p></div></div></footer>
  </div>
}
