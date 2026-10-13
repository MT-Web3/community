import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './workspace.css'

const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  const target = new URL(redirect)
  history.replaceState(null, '', `${target.pathname}${target.search}${target.hash}`)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter basename="/community"><App /></BrowserRouter></React.StrictMode>
)
