import { useEffect, useRef } from 'react'

/** Pointer animation stays outside React rendering so forms remain responsive. */
export function LiquidInteractions() {
  const cursor = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const media = matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)')
    let frame = 0, target: HTMLElement | null = null
    const nearby = new Set<HTMLElement>()
    let lastScan = 0
    let x = 0, y = 0, px = 0, py = 0, visible = false
    function release() {
      if (target) { target.classList.remove('liquid-hover'); for (const name of ['--soft-x','--soft-y','--soft-turn','--hit-x','--hit-y']) target.style.removeProperty(name); target = null }
    }
    function move(event: PointerEvent) {
      if (!media.matches || event.pointerType === 'touch') return
      x = event.clientX; y = event.clientY
      if (!visible) { px = x; py = y }
      visible = true
      document.documentElement.classList.add('custom-pointer')
      const element = (event.target as Element).closest<HTMLElement>('button:not(:disabled),a,.campaign-card,.form-panel,.story-art,.motion-stage,.play-object,.play-surface,img')
      if (element !== target) { release(); target = element }
      if (target) {
        const rect = target.getBoundingClientRect()
        const dx = Math.max(-1, Math.min(1, (x - rect.left - rect.width / 2) / (rect.width / 2)))
        const dy = Math.max(-1, Math.min(1, (y - rect.top - rect.height / 2) / (rect.height / 2)))
        target.classList.add('liquid-hover')
        target.style.setProperty('--soft-x', `${dx * 5}px`)
        target.style.setProperty('--soft-y', `${dy * 4}px`)
        target.style.setProperty('--soft-turn', `${dx * 2}deg`)
        target.style.setProperty('--hit-x', `${(dx + 1) * 50}%`)
        target.style.setProperty('--hit-y', `${(dy + 1) * 50}%`)
      }
    }
    function clearNearby() { nearby.forEach(node => { node.classList.remove('liquid-near'); for (const key of ['--bend','--squeeze','--stretch','--liquid-skew']) node.style.removeProperty(key) }); nearby.clear() }
    function leave() { clearNearby(); visible = false; document.documentElement.classList.remove('custom-pointer'); release() }
    function tick(time: number) {
      if (visible && time - lastScan > 32) {
        lastScan = time
        const next = new Set<HTMLElement>()
        document.querySelectorAll<HTMLElement>('button:not(:disabled),a.button,.nav a,.campaign-card,.form-panel,.story-art img,.stage-blob,.story-orbit,.story-floating-block,.stage-sticker,.ribbon-link').forEach(element => {
          const r = element.getBoundingClientRect()
          if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) return
          const distance = Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom))
          if (distance > 110) return
          const strength = 1-distance/110
          const direction = Math.max(-1,Math.min(1,(x-r.left-r.width/2)/(r.width/2)))
          element.classList.add('liquid-near')
          element.style.setProperty('--bend',String(strength))
          element.style.setProperty('--squeeze',String(1-strength*.06))
          element.style.setProperty('--stretch',String(1+strength*.08))
          element.style.setProperty('--liquid-skew',direction*strength*7+'deg')
          next.add(element)
        })
        nearby.forEach(element => { if (!next.has(element)) { element.classList.remove('liquid-near'); for (const key of ['--bend','--squeeze','--stretch','--liquid-skew']) element.style.removeProperty(key) } })
        nearby.clear(); next.forEach(element => nearby.add(element))
      }
      const node = cursor.current
      if (node) {
        const dx = x - px, dy = y - py
        px += dx * .24; py += dy * .24
        const stretch = Math.min(.65, Math.hypot(dx, dy) / 120)
        node.style.transform = `translate3d(${px}px,${py}px,0) rotate(${Math.atan2(dy,dx)}rad) scale(${1 + stretch},${1 - stretch * .4})`
        node.dataset.visible = String(visible && media.matches)
        node.dataset.active = String(Boolean(target))
      }
      if (media.matches) frame = requestAnimationFrame(tick)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    function preference() { leave(); cancelAnimationFrame(frame); if (media.matches) frame = requestAnimationFrame(tick) }
    media.addEventListener('change', preference)
    if (media.matches) frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); leave(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); window.removeEventListener('blur', leave); media.removeEventListener('change', preference) }
  }, [])
  return <><svg className="liquid-filter-definitions" aria-hidden="true"><defs><filter id="liquid-surface" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency=".012 .025" numOctaves="2" seed="8"/><feDisplacementMap in="SourceGraphic" scale="13" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg><div ref={cursor} className="liquid-cursor" aria-hidden="true"><span>↗</span></div></>
}
