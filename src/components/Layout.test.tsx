import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen} from '@testing-library/react'
import {MemoryRouter,Route,Routes} from 'react-router-dom'
import {I18nProvider} from '../lib/i18n'
import {Layout} from './Layout'
vi.mock('./LiquidInteractions',()=>({LiquidInteractions:()=>null}))
afterEach(()=>{cleanup();localStorage.clear()})
it('shows the story directly in the main navigation',()=>{
  render(<I18nProvider><MemoryRouter><Routes><Route element={<Layout/>}><Route path="*" element={<p>Page</p>}/></Route></Routes></MemoryRouter></I18nProvider>)
  expect(screen.queryByRole('button',{name:'Góc nhỏ của TΛM'})).toBeNull()
  const story=screen.getByRole('link',{name:'Câu chuyện'})
  expect(story.getAttribute('href')).toBe('/story')
  fireEvent.click(story)
  expect(story.getAttribute('aria-current')).toBe('page')
})
