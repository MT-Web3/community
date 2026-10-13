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
  expect(resume).not.toHaveBeenCalled()
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'▶ Nghe cùng TΛM'})))
  expect(resume).toHaveBeenCalledOnce()
  fireEvent.change(screen.getByRole('slider',{name:'Âm lượng'}),{target:{value:'0'}})
  expect(volume).toHaveBeenCalledWith(0,0,.1)
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'Ⅱ Tạm dừng'})))
  expect(suspend).toHaveBeenCalledOnce()
  unmount();expect(close).toHaveBeenCalledOnce()
})
