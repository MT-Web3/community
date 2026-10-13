import { describe, expect, it } from 'vitest'
import { localizeCampaign, translate } from './i18n'
import { seedCampaigns } from '../data'

describe('localization', () => {
  it('translates interface text and preserves Vietnamese', () => {
    expect(translate('Tạo chiến dịch','en')).toBe('Create campaign')
    expect(translate('Tạo chiến dịch','vi')).toBe('Tạo chiến dịch')
  })
  it('supports English campaign content with original content fallback', () => {
    const campaign = {...seedCampaigns[0],translations:{en:{name:'English name',requirements:['English task']}}}
    expect(localizeCampaign(campaign,'en')).toMatchObject({name:'English name',requirements:['English task']})
    expect(localizeCampaign(campaign,'vi').name).toBe(seedCampaigns[0].name)
  })
})
