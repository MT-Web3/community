import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import {I18nProvider} from '../lib/i18n'
import {Layout} from './Layout'
vi.mock('./LiquidInteractions',()=>({LiquidInteractions:()=>null}))
afterEach(()=>{cleanup();localStorage.clear()})
it('groups personal pages in a separate menu and closes it on navigation',()=>{
  render(<I18nProvider><MemoryRouter><Routes><Route element={<Layout/>}><Route path="*" element={<p>Page</p>}/></Route></Routes></MemoryRouter></I18nProvider>)
  expect(screen.queryByRole('link',{name:'TΛM diệt zombie'})).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:'Góc nhỏ của TΛM'}))
  expect(screen.getByRole('link',{name:'10 truyện hư cấu'})).toBeTruthy()
  fireEvent.click(screen.getByRole('link',{name:'TΛM diệt zombie'}))
  expect(screen.getByRole('button',{name:'Góc nhỏ của TΛM'}).getAttribute('aria-expanded')).toBe('false')
})
