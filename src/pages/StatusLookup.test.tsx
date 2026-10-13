import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../lib/i18n'
import { StatusLookup } from './StatusLookup'

vi.mock('../lib/supabase', () => ({ lookupApplication: vi.fn(async () => [{id:'18f46712-1212-4242-8888-123456789abc',status:'approved',campaign:'Test campaign',updatedAt:'2026-10-14T10:00:00Z'}]) }))
afterEach(() => { cleanup(); localStorage.clear() })
describe('handle lookup UI', () => {
  it.each(['vi','en'])('never shows application IDs in %s', async language => {
    localStorage.setItem('mt-language',language)
    render(<I18nProvider><MemoryRouter><StatusLookup/></MemoryRouter></I18nProvider>)
    fireEvent.change(screen.getByRole('textbox',{name:'X handle'}),{target:{value:'@daomintam'}})
    fireEvent.click(screen.getByRole('button',{name:language==='vi'?'Tra cứu hồ sơ':'Track applications'}))
    expect(await screen.findByText('Test campaign')).toBeTruthy()
    expect(document.body.textContent).not.toContain('18f46712-1212-4242-8888-123456789abc')
    expect(document.body.textContent).not.toContain('ID hồ sơ')
    expect(screen.getByText(language==='vi'?'Đã được duyệt':'Approved')).toBeTruthy()
  })
})
