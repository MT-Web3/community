import {afterEach,expect,it} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {I18nProvider} from '../lib/i18n'
import {CryptoHub} from './CryptoHub'
afterEach(()=>{cleanup();localStorage.clear()})
it('filters topics and opens official security resources without requesting a wallet',()=>{render(<I18nProvider><CryptoHub/></I18nProvider>);fireEvent.change(screen.getByRole('textbox',{name:'Tìm chủ đề'}),{target:{value:'bảo mật'}});fireEvent.click(screen.getByRole('button',{name:'⌁ Ví & bảo mật'}));expect(screen.getByRole('link',{name:'Security & scam prevention ↗'}).getAttribute('href')).toBe('https://ethereum.org/security/');expect(screen.queryByRole('button',{name:/kết nối ví/i})).toBeNull();fireEvent.change(screen.getByRole('textbox'),{target:{value:'not-a-topic'}});expect(screen.getByText('Không có chủ đề phù hợp.')).toBeTruthy()})
