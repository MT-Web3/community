import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function NotFound() {
  return <section className="page section not-found-page"><div className="container not-found-card"><div className="not-found-art"><div className="not-found-orbit" aria-hidden="true"/><img src="/community/assets/community-mascot.png" alt="MT-Web3 mascot"/></div><div className="not-found-copy"><p className="kicker">MT-WEB3 · ERROR</p><div className="not-found-code" aria-label="404">404</div><h1>Page not found</h1><p>This page does not exist or the corresponding tab has been hidden in the visibility settings.</p><Link className="button primary" to="/"><ArrowLeft size={17}/>Back to home</Link></div></div></section>
}
