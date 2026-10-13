export function Logo({ compact = false }: { compact?: boolean }) {
  return <span className="brand" aria-label="MT-Web3 Community">
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4 41 14v20L24 44 7 34V14L24 4Z"/><path d="m16 19 8-5 8 5v10l-8 5-8-5V19Z"/></svg>
    {!compact && <span><b>MT-WEB3</b><small>COMMUNITY</small></span>}
  </span>
}
