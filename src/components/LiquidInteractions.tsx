import {useEffect,useRef} from 'react'

export function LiquidInteractions(){
  const cursor=useRef<HTMLDivElement>(null)
  useEffect(()=>{
    const media=matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)')
    let target:HTMLElement|null=null
    function clear(){target?.classList.remove('pointer-highlight');target?.style.removeProperty('--pointer-x');target?.style.removeProperty('--pointer-y');target=null}
    function move(event:PointerEvent){
      if(!media.matches||event.pointerType==='touch')return
      document.documentElement.classList.add('custom-pointer')
      if(cursor.current){cursor.current.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;cursor.current.dataset.visible='true'}
      const next=(event.target as Element).closest<HTMLElement>('button:not(:disabled),a.button,.campaign-card,.crypto-panel,.form-panel')
      if(next!==target){clear();target=next}
      if(target){const r=target.getBoundingClientRect();target.classList.add('pointer-highlight');target.style.setProperty('--pointer-x',`${event.clientX-r.left}px`);target.style.setProperty('--pointer-y',`${event.clientY-r.top}px`)}
      if(cursor.current)cursor.current.dataset.active=String(Boolean(target))
    }
    function leave(){clear();document.documentElement.classList.remove('custom-pointer');if(cursor.current)cursor.current.dataset.visible='false'}
    document.addEventListener('pointermove',move);document.addEventListener('pointerleave',leave);window.addEventListener('blur',leave);media.addEventListener('change',leave)
    return()=>{leave();document.removeEventListener('pointermove',move);document.removeEventListener('pointerleave',leave);window.removeEventListener('blur',leave);media.removeEventListener('change',leave)}
  },[])
  return <div ref={cursor} className="refined-cursor" aria-hidden="true"/>
}
