import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import english from '../locales/en.json'
import type { Campaign } from '../types'

export type Language = 'vi' | 'en'
const dictionary: Record<string, string> = english
export function translate(text: string, language: Language): string {
  if (language === 'vi') return ({ 'Community Nomination':'Đề cử cộng đồng', 'Early Access':'Truy cập sớm', 'Community Campaign':'Chiến dịch cộng đồng' } as Record<string,string>)[text] || text
  const exported = /^Đã xuất (\d+) hồ sơ theo bộ lọc hiện tại\.$/.exec(text)
  if (exported) return `Exported ${exported[1]} applications with the current filter.`
  const loadErrorPrefix = 'Không thể tải chiến dịch:'
  if (text.startsWith(loadErrorPrefix)) return `Could not load the campaign:${text.slice(loadErrorPrefix.length)}`
  return dictionary[text.trim()] || text
}
export function localizeCampaign(campaign: Campaign, language: Language): Campaign {
  if (language === 'vi') return campaign
  const en = campaign.translations?.en
  return { ...campaign, name: en?.name || translate(campaign.name, language), description: en?.description || translate(campaign.description, language), longDescription: en?.description || translate(campaign.longDescription, language), reward: en?.reward || translate(campaign.reward, language), requirements: en?.requirements?.length ? en.requirements : campaign.requirements.map(item => translate(item, language)) }
}
const Context = createContext({ language: 'vi' as Language, locale: 'vi-VN', setLanguage: (_language: Language) => {}, t: (text: string) => text })
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('mt-language') === 'en' ? 'en' : 'vi')
  useEffect(() => { localStorage.setItem('mt-language', language); document.documentElement.lang = language }, [language])
  const context = useMemo(() => ({ language, locale: language === 'vi' ? 'vi-VN' : 'en-GB', setLanguage, t: (text: string) => translate(text, language) }), [language])
  return <Context.Provider value={context}>{children}</Context.Provider>
}
export const useI18n = () => useContext(Context)
