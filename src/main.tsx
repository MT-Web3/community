import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { I18nProvider } from './lib/i18n'
import './styles.css'
import './workspace.css'
import './experience.css'

const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  const target = new URL(redirect)
  history.replaceState(null, '', `${target.pathname}${target.search}${target.hash}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><I18nProvider><BrowserRouter basename="/community"><App /></BrowserRouter></I18nProvider></React.StrictMode>
)
