import { afterEach, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from '../lib/i18n'
import { Story } from './Story'

afterEach(() => { cleanup(); localStorage.clear() })
it('lets readers jump chapters and reveal a joke with one tap', () => {
  render(<I18nProvider><Story/></I18nProvider>)
  expect(screen.getByText('Một câu chuyện hư cấu • TΛMVERSE')).toBeTruthy()
  expect(screen.getAllByRole('button',{name:/^Chương \d+$/})).toHaveLength(4)
  fireEvent.click(screen.getByRole('button', {name:'Chương 2'}))
  fireEvent.click(screen.getByRole('button', {name:'Kể thêm một câu ✦'}))
  expect(screen.getByRole('status').textContent).toContain('Ví tôi rất phi tập trung')
  fireEvent.click(screen.getByRole('button', {name:'Chương 4'}))
  expect(screen.getByRole('status').textContent?.trim()).toBe('')
  fireEvent.click(screen.getByRole('button', {name:'Đọc lại'}))
  expect(screen.getByRole('heading', {name:'TΛM và chiếc block đi lạc.'})).toBeTruthy()
})
it('renders the fictional story in English', () => {
  localStorage.setItem('mt-language','en')
  render(<I18nProvider><Story/></I18nProvider>)
  expect(screen.getByText('A fictional story • TΛMVERSE')).toBeTruthy()
  fireEvent.click(screen.getByRole('button', {name:'Next chapter'}))
  expect(screen.getByRole('heading', {name:'Pay the toll in giggles.'})).toBeTruthy()
})
