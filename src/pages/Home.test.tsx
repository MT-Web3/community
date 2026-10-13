import {afterEach,expect,it,vi} from 'vitest'
import {act,cleanup,render} from '@testing-library/react'
import {MemoryRouter} from 'react-router-dom'
import {I18nProvider} from '../lib/i18n'
import {Home} from './Home'
vi.mock('../lib/supabase',()=>({getPublicCampaigns:()=>Promise.resolve([])}))
vi.mock('../components/MotionStage',()=>({MotionStage:()=>null}))
afterEach(()=>{vi.useRealTimers();cleanup();vi.unstubAllGlobals();localStorage.clear()})
it('renders Kết nối as a complete normalized Vietnamese word',async()=>{
  vi.useFakeTimers({toFake:['setInterval','clearInterval']});vi.stubGlobal('matchMedia',()=>({matches:false}))
  const {container}=render(<I18nProvider><MemoryRouter><Home/></MemoryRouter></I18nProvider>)
  await act(async()=>{await Promise.resolve();vi.advanceTimersByTime(3400)})
  const word=container.querySelector('.kinetic-word span')!.textContent
  expect(word).toBe('Kết nối.');expect(word).toBe(word?.normalize('NFC'))
})
