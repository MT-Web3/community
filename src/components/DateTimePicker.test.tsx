import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { I18nProvider } from '../lib/i18n'
import { DateTimePicker } from './DateTimePicker'

afterEach(() => { cleanup(); localStorage.clear() })
describe('calendar control', () => {
  it('selects a date and time without typing date segments', () => {
    const onChange = vi.fn()
    render(<I18nProvider><DateTimePicker label="Bắt đầu" value="2026-10-14T10:00" required onChange={onChange}/></I18nProvider>)
    fireEvent.click(screen.getByRole('button', { name:'Bắt đầu' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    const date = new Intl.DateTimeFormat('vi-VN', { dateStyle:'full' }).format(new Date(2026,9,15))
    fireEvent.click(screen.getByRole('button', { name:date }))
    fireEvent.change(screen.getByLabelText('Giờ'), { target:{value:'17'} })
    fireEvent.change(screen.getByLabelText('Phút'), { target:{value:'30'} })
    fireEvent.click(screen.getByRole('button', { name:'Xác nhận ngày & giờ' }))
    expect(onChange).toHaveBeenCalledWith('2026-10-15T17:30')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.querySelector('input[type="datetime-local"]')).toBeNull()
  })
  it('supports English and closes with Escape', () => {
    localStorage.setItem('mt-language','en')
    render(<I18nProvider><DateTimePicker label="Start date" value="" required onChange={vi.fn()}/></I18nProvider>)
    fireEvent.click(screen.getByRole('button', { name:'Start date' }))
    expect(screen.getByRole('button',{name:'Confirm date & time'})).toBeTruthy()
    expect(screen.queryByRole('button',{name:'No end date'})).toBeNull()
    fireEvent.keyDown(document,{key:'Escape'})
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
