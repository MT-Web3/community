import { useEffect, useRef } from 'react'

/** Pointer animation stays outside React rendering so forms remain responsive. */
export function LiquidInteractions() {
  const cursor = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const media = matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)')
    let frame = 0, target: HTMLElement | null = null
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
    function leave() { visible = false; document.documentElement.classList.remove('custom-pointer'); release() }
    function tick() {
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
    return () => { cancelAnimationFrame(frame); release(); document.removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); window.removeEventListener('blur', leave); media.removeEventListener('change', preference) }
  }, [])
  return <div ref={cursor} className="liquid-cursor" aria-hidden="true"><span>↗</span></div>
}
