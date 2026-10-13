const X_HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'])

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, '').toLowerCase()
}

export function normalizeXUrl(value: string): string {
  try {
    const trimmed = value.trim()
    const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    if (!['https:', 'http:'].includes(url.protocol) || !X_HOSTS.has(url.hostname.toLowerCase()) || url.username || url.password || url.port) return ''
    url.protocol = 'https:'; url.hostname = 'x.com'; url.search = ''; url.hash = ''
    url.pathname = url.pathname.replace(/\/+$/, '')
    return url.toString()
  } catch { return '' }
}

export function xPostId(value: string): string | null {
  try {
    const parts = new URL(normalizeXUrl(value)).pathname.split('/').filter(Boolean)
    if (parts.length >= 3 && parts[1] === 'status' && /^[a-z0-9_]{1,15}$/i.test(parts[0]) && /^\d+$/.test(parts[2])) return parts[2]
    if (parts.length >= 4 && parts[0] === 'i' && parts[1] === 'web' && parts[2] === 'status' && /^\d+$/.test(parts[3])) return parts[3]
    return null
  } catch { return null }
}
