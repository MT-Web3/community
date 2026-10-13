import {afterEach,expect,it,vi} from 'vitest'
import {act,cleanup,fireEvent,render,screen} from '@testing-library/react'
import {I18nProvider} from '../lib/i18n'
import {Chill} from './Chill'
afterEach(()=>{cleanup();vi.unstubAllGlobals();localStorage.clear()})
it('starts audio only on a tap, controls volume, pauses and releases the audio context',async()=>{
  const resume=vi.fn().mockResolvedValue(undefined),suspend=vi.fn().mockResolvedValue(undefined),close=vi.fn().mockResolvedValue(undefined),volume=vi.fn()
  const gain=()=>({gain:{value:0,setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn(),setTargetAtTime:volume},connect:vi.fn()})
  class FakeAudio{currentTime=0;destination={};resume=resume;suspend=suspend;close=close;createGain=gain;createOscillator=()=>({type:'sine',frequency:{value:0},connect:vi.fn(),start:vi.fn(),stop:vi.fn()})}
  vi.stubGlobal('AudioContext',FakeAudio)
  const {unmount}=render(<I18nProvider><Chill/></I18nProvider>)
  fireEvent.click(screen.getByRole('button',{name:'Ambient'}))
  expect(resume).not.toHaveBeenCalled()
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'▶ Nghe cùng TΛM'})))
  expect(resume).toHaveBeenCalledOnce()
  fireEvent.change(screen.getByRole('slider',{name:'Âm lượng'}),{target:{value:'0'}})
  expect(volume).toHaveBeenCalledWith(0,0,.1)
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Ⅱ Tạm dừng'})))
  expect(suspend).toHaveBeenCalledOnce()
  unmount();expect(close).toHaveBeenCalledOnce()
})
it('loads the official player only on request and removes it when switching to ambient',()=>{
  render(<I18nProvider><Chill/></I18nProvider>)
  expect(document.querySelector('iframe')).toBeNull()
  fireEvent.click(screen.getByRole('button',{name:'Phát trong trang'}))
  expect(screen.getByTitle('Mr. Siro — Một Bước Yêu, Vạn Dặm Đau').getAttribute('src')).toBe('https://www.youtube.com/embed/GwCUbhE0TY0?autoplay=1&rel=0')
  expect(screen.getByRole('link',{name:'Mở trên YouTube ↗'}).getAttribute('href')).toBe('https://www.youtube.com/watch?v=GwCUbhE0TY0')
  fireEvent.click(screen.getByRole('button',{name:'Ambient'}))
  expect(document.querySelector('iframe')).toBeNull()
})
