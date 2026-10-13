import { describe, expect, it } from 'vitest'
import { isXUrl, validateSubmission } from './validation'

const valid = { campaignId:'one', xUsername:'mt_web3', xProfileUrl:'https://x.com/mt_web3', postUrl1:'https://x.com/mt_web3/status/123', postUrl2:'https://x.com/mt_web3/status/456', consent:true }
describe('submission validation',()=>{
  it('accepts valid X links',()=>expect(isXUrl(valid.postUrl1,true)).toBe(true))
  it('rejects duplicate posts',()=>expect(validateSubmission({...valid,postUrl2:valid.postUrl1}).postUrl2).toBeTruthy())
  it('rejects username mismatch',()=>expect(validateSubmission({...valid,xProfileUrl:'https://x.com/other'}).xProfileUrl).toBeTruthy())
  it('requires a valid wallet when configured',()=>expect(validateSubmission(valid,true).walletAddress).toBeTruthy())
})
