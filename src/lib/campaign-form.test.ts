import { describe, expect, it } from 'vitest'
import { campaignPayload, toLocalDateTime, type CampaignForm } from './campaign-form'

const form: CampaignForm = { slug:'test-giveaway',name:' Giveaway ',project:'MT',description:'Test campaign',campaign_type:'Giveaway',status:'draft',reward:'',capacity:'',starts_at:'2026-10-14T10:00',ends_at:'2026-10-14T12:00',requirements:' Task one \n\nTask two',walletRequired:false }
describe('campaign editor', () => {
  it('serializes tasks and optional fields', () => expect(campaignPayload(form)).toMatchObject({name:'Giveaway',requirements:['Task one','Task two'],reward:null,capacity:null}))
  it('roundtrips local date/time without shifting the displayed time', () => expect(toLocalDateTime(campaignPayload(form).starts_at)).toBe(form.starts_at))
  it('rejects an end before the start', () => expect(() => campaignPayload({...form,ends_at:'2026-10-14T09:00'})).toThrow('kết thúc'))
  it.each(['-1','0','1.5','NaN'])('rejects invalid capacity %s', capacity => expect(() => campaignPayload({...form,capacity})).toThrow('Số suất'))
  it('rejects invalid slugs', () => expect(() => campaignPayload({...form,slug:'Bad slug'})).toThrow('Đường dẫn'))
})
