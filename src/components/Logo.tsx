export function Logo({ compact = false }: { compact?: boolean }) {
  return <span className="brand" aria-label="MT-Web3 Community">
    <img src="/community/assets/mt-web3-avatar.png" alt="" aria-hidden="true" />
    {!compact && <span><b>MT-WEB3</b><small>COMMUNITY</small></span>}
  </span>
}
