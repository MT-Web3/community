import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n'

export function MotionStage() {
  const { t } = useI18n()
  const stage = useRef<HTMLDivElement>(null), canvas = useRef<HTMLCanvasElement>(null)
  const pointer = useRef({ x: 0, y: 0 }), [wave, setWave] = useState(false)
  useEffect(() => {
    const element = stage.current, surface = canvas.current
    if (!element || !surface) return
    const context = surface.getContext('2d'); if (!context) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, width = 0, height = 0, x = 0, y = 0, phase = 0, ink = '#171717'
    function resize() {
      const bounds = element!.getBoundingClientRect(); width = bounds.width; height = bounds.height
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      surface!.width = width * ratio; surface!.height = height * ratio
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
      ink = getComputedStyle(element!).getPropertyValue('--ink').trim() || '#171717'
    }
    function draw(time: number) {
      if (document.hidden) { frame = requestAnimationFrame(draw); return }
      phase = reduced.matches ? 0 : time * .00065
      x += (pointer.current.x - x) * .055; y += (pointer.current.y - y) * .055
      element!.style.setProperty('--look-x', `${reduced.matches ? 0 : x * 18}px`)
      element!.style.setProperty('--look-y', `${reduced.matches ? 0 : y * 12 + Math.sin(phase * 2) * 10}px`)
      element!.style.setProperty('--tilt', `${reduced.matches ? 0 : x * 6 + Math.sin(phase) * 1.5}deg`)
      context!.clearRect(0, 0, width, height)
      const radius = Math.min(width, height) * .36
      for (let ring = 0; ring < 3; ring++) {
        context!.beginPath()
        for (let i = 0; i <= 96; i++) {
          const angle = i / 96 * Math.PI * 2
          const ripple = Math.sin(angle * 3 + phase + ring) * .1 + Math.cos(angle * 5 - phase * 1.2) * .06
          const r = radius * (1 + ripple + ring * .12)
          const px = width * .5 + Math.cos(angle) * r + x * (20 + ring * 7)
          const py = height * .49 + Math.sin(angle) * r * .85 + y * 18
          if (i === 0) context!.moveTo(px, py); else context!.lineTo(px, py)
        }
        context!.closePath(); context!.strokeStyle = ink; context!.globalAlpha = .16 + ring * .09; context!.lineWidth = ring === 1 ? 2 : 1; context!.stroke()
      }
      context!.globalAlpha = .85
      for (let i = 0; i < 7; i++) {
        const angle = i / 7 * Math.PI * 2 + phase * (i % 2 ? -.2 : .25)
        const px = width * .5 + Math.cos(angle) * radius * 1.2, py = height * .5 + Math.sin(angle) * radius * .95
        context!.save(); context!.translate(px, py); context!.rotate(phase + i)
        context!.strokeStyle = ink; context!.lineWidth = 2
        context!.beginPath(); context!.moveTo(-5,0); context!.lineTo(5,0); context!.moveTo(0,-5); context!.lineTo(0,5); context!.stroke(); context!.restore()
      }
      if (!reduced.matches) frame = requestAnimationFrame(draw)
    }
    function refresh() { resize(); cancelAnimationFrame(frame); frame = requestAnimationFrame(draw) }
    const observer = new ResizeObserver(refresh); observer.observe(element)
    const theme = new MutationObserver(refresh); theme.observe(document.documentElement, { attributes:true,attributeFilter:['data-theme'] })
    reduced.addEventListener('change', refresh)
    refresh()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); theme.disconnect(); reduced.removeEventListener('change',refresh) }
  }, [])
  useEffect(() => { if (!wave) return; const timer = setTimeout(() => setWave(false), 900); return () => clearTimeout(timer) }, [wave])
  return <div ref={stage} className={`motion-stage${wave ? ' is-waving' : ''}`} onPointerMove={event => { const bounds = event.currentTarget.getBoundingClientRect(); pointer.current = { x:(event.clientX-bounds.left)/bounds.width*2-1, y:(event.clientY-bounds.top)/bounds.height*2-1 } }} onPointerLeave={() => { pointer.current = {x:0,y:0} }}><div className="stage-blob"/><canvas ref={canvas} aria-hidden="true"/><button className="mascot-interaction" type="button" onClick={() => setWave(true)} aria-label={t('Chạm để chào')}><img src="/community/assets/community-mascot.png" alt={t('Nhân vật MT-Web3')} draggable={false}/></button><span className="stage-sticker">HELLO,<br/>WEB3!</span><span className="stage-caption">{t('Chạm để chào')} ↗</span></div>
}
