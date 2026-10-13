import { describe, expect, it } from 'vitest'
import { isXUrl, normalizeXUrl, normalizeUsername, validateSubmission } from './validation'

const valid = { campaignId:'one', xUsername:'mt_web3', xProfileUrl:'https://x.com/mt_web3', postUrl1:'https://x.com/mt_web3/status/123', postUrl2:'https://x.com/mt_web3/status/456', consent:true }
describe('submission validation',()=>{
  it('accepts valid X links',()=>expect(isXUrl(valid.postUrl1,true)).toBe(true))
  it('rejects duplicate posts',()=>expect(validateSubmission({...valid,postUrl2:valid.postUrl1}).postUrl2).toBeTruthy())
  it('does not require a profile link',()=>expect(validateSubmission({...valid,xProfileUrl:undefined})).toEqual({}))
  it('requires a valid wallet when configured',()=>expect(validateSubmission(valid,true).walletAddress).toBeTruthy())
  it('accepts the supplied scheme-less post example', () => {
    const link = 'x.com/daomintam/status/2108877056608219217'
    expect(isXUrl(link, true)).toBe(true)
    expect(normalizeXUrl(link)).toBe(`https://${link}`)
  })
  it('canonicalizes Twitter, tracking parameters and http links', () => expect(normalizeXUrl(' http://www.twitter.com/mt_web3/status/123/?s=20#test ')).toBe('https://x.com/mt_web3/status/123'))
  it('rejects duplicate post IDs across hosts and handles', () => expect(validateSubmission({...valid, postUrl2:'twitter.com/other/status/123?s=20'}).postUrl2).toBeTruthy())
  it.each(['https://x.com.evil.test/user/status/1','javascript:alert(1)','https://evil.test@x.com/user/status/1','https://x.com:8080/user/status/1','https://x.com/user/status/nope'])('rejects unsafe or invalid post %s', link => expect(isXUrl(link,true)).toBe(false))
  it('normalizes an already prefixed handle', () => expect(normalizeUsername(' @DaoMinTam ')).toBe('daomintam'))
  it.each(['x.com/daomintam/status/123/photo/1','x.com/i/web/status/123','x.com/i/status/123'])('accepts share and media link %s', link => expect(isXUrl(link,true)).toBe(true))
})
