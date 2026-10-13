import type { SubmissionInput } from '../types'
import { normalizeUsername, normalizeXUrl, xPostId } from '../../supabase/functions/_shared/validation'
export { normalizeUsername, normalizeXUrl } from '../../supabase/functions/_shared/validation'

export type ValidationErrors = Partial<Record<keyof SubmissionInput, string>>
export function isXUrl(value: string, requireStatus = false) {
  if (requireStatus) return Boolean(xPostId(value))
  try { return new URL(normalizeXUrl(value)).pathname.split('/').filter(Boolean).length >= 1 }
  catch { return false }
}
export function validateSubmission(input: SubmissionInput, walletRequired = false): ValidationErrors {
  const errors: ValidationErrors = {}
  if (!/^[a-z0-9_]{1,15}$/.test(normalizeUsername(input.xUsername))) errors.xUsername = 'Handle X không hợp lệ.'
  const first = xPostId(input.postUrl1), second = xPostId(input.postUrl2)
  if (!first) errors.postUrl1 = 'Nhập link bài đăng X hợp lệ.'
  if (!second) errors.postUrl2 = 'Nhập link bài đăng X hợp lệ.'
  if (first && first === second) errors.postUrl2 = 'Hai bài đăng phải khác nhau.'
  if (walletRequired && !/^0x[a-fA-F0-9]{40}$/.test(input.walletAddress?.trim() || '')) errors.walletAddress = 'Địa chỉ ví EVM không hợp lệ.'
  if (!input.consent) errors.consent = 'Bạn cần đồng ý với thể lệ và chính sách dữ liệu.'
  return errors
}
