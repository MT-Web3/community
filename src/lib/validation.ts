import type { SubmissionInput } from '../types'

export type ValidationErrors = Partial<Record<keyof SubmissionInput, string>>

const X_HOSTS = new Set(['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'])

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, '').toLowerCase()
}

export function isXUrl(value: string, requireStatus = false) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !X_HOSTS.has(url.hostname.toLowerCase())) return false
    const segments = url.pathname.split('/').filter(Boolean)
    return requireStatus ? segments.length >= 3 && segments[1] === 'status' && /^\d+$/.test(segments[2]) : segments.length >= 1
  } catch { return false }
}

export function validateSubmission(input: SubmissionInput, walletRequired = false): ValidationErrors {
  const errors: ValidationErrors = {}
  const username = normalizeUsername(input.xUsername)
  if (!/^[a-z0-9_]{1,15}$/.test(username)) errors.xUsername = 'Username X không hợp lệ.'
  if (!isXUrl(input.xProfileUrl)) errors.xProfileUrl = 'Nhập URL hồ sơ X hợp lệ (https://x.com/...).'
  if (!isXUrl(input.postUrl1, true)) errors.postUrl1 = 'Nhập URL bài đăng X hợp lệ.'
  if (!isXUrl(input.postUrl2, true)) errors.postUrl2 = 'Nhập URL bài đăng X hợp lệ.'
  if (input.postUrl1 && input.postUrl2 && input.postUrl1.replace(/\/$/, '') === input.postUrl2.replace(/\/$/, '')) errors.postUrl2 = 'Hai bài đăng phải khác nhau.'
  const profileHandle = (() => { try { return new URL(input.xProfileUrl).pathname.split('/').filter(Boolean)[0]?.toLowerCase() } catch { return '' } })()
  if (username && profileHandle && username !== profileHandle) errors.xProfileUrl = 'Username và URL hồ sơ chưa khớp.'
  if (walletRequired && !/^0x[a-fA-F0-9]{40}$/.test(input.walletAddress || '')) errors.walletAddress = 'Địa chỉ ví EVM không hợp lệ.'
  if (!input.consent) errors.consent = 'Bạn cần đồng ý với thể lệ và chính sách dữ liệu.'
  return errors
}
