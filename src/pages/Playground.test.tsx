import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nProvider } from '../lib/i18n'
import { Playground } from './Playground'
afterEach(() => { cleanup(); localStorage.clear() })
it('cycles jokes through the button and character and links all three sites', () => {
  render(<I18nProvider><MemoryRouter><Playground slug="hodl-potato"/></MemoryRouter></I18nProvider>)
  fireEvent.click(screen.getByRole('button',{name:'Chọc khoai ↗'}))
  expect(screen.getByRole('status').textContent).toContain('FÔ MAI')
  fireEvent.click(screen.getByRole('button',{name:'Chạm nhân vật'}))
  expect(screen.getByRole('status').textContent).toContain('Diamond hands')
  expect(screen.getByRole('link',{name:'☁ Mây hết gas'}).getAttribute('href')).toBe('/play/gas-cloud')
  expect(document.title).toContain('TΛM')
})
