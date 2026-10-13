import {createZombieScene} from '../lib/zombie-scene'
import { within, hits, spawnAtEdge } from '../lib/game'
import {usePageTitle} from '../lib/usePageTitle'
import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { gunshot, tone } from '../lib/sound'
type Body = {x:number;y:number;vx:number;vy:number;life:number}
export function ZombieGame() {
  const {language} = useI18n(), vi = language === 'vi'
  usePageTitle('TΛM / LAST LIGHT')
  const world=useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null), audio = useRef<AudioContext>(), keys = useRef(new Set<string>())
  const control = useRef({aimX:600,aimY:300,fire:false,fireUntil:0,muted:false,paused:false})
  const [playing,setPlaying] = useState(false), [run,setRun] = useState(0), [muted,setMuted] = useState(false), [paused,setPaused] = useState(false)
  const [hud,setHud] = useState({health:100,kills:0,wave:1}), [over,setOver] = useState(false)
  useEffect(() => () => { void audio.current?.close() },[])
  useEffect(() => {
    const element = canvas.current, context = element?.getContext('2d'); if (!element || !context) return
    let scene:ReturnType<typeof createZombieScene>|undefined
    try{if(world.current){scene=createZombieScene(world.current);element.style.opacity='0'}}catch{element.style.opacity='1'}
    let frame=0,last=0,time=0,spawn=0,shot=0,hudTime=0,health=100,kills=0,damage=0,shake=0
    const player={x:480,y:300}, zombies:Body[]=[], bullets:Body[]=[], particles:Body[]=[]
    const width=960,height=600; element.width=width; element.height=height
    const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches
    function burst(x:number,y:number) { for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2;particles.push({x,y,vx:Math.cos(a)*100,vy:Math.sin(a)*100,life:.6})} }
    function draw(now:number) {
      const dt=Math.min((now-last)/1000 || .016,.035);last=now
      const active=playing && !control.current.paused && !document.hidden && health>0
      if(active){
        time+=dt;shot-=dt;spawn-=dt;damage-=dt;shake=Math.max(0,shake-dt*20)
        let dx=Number(keys.current.has('d')||keys.current.has('arrowright'))-Number(keys.current.has('a')||keys.current.has('arrowleft'))
        let dy=Number(keys.current.has('s')||keys.current.has('arrowdown'))-Number(keys.current.has('w')||keys.current.has('arrowup'))
        const magnitude=Math.hypot(dx,dy)||1;dx/=magnitude;dy/=magnitude
        player.x=within(player.x+dx*220*dt,width);player.y=within(player.y+dy*220*dt,height)
        if(spawn<=0){const edge=Math.floor(Math.random()*4);zombies.push({...spawnAtEdge(edge,width,height),vx:0,vy:0,life:1});spawn=Math.max(.22,1-time/160)}
        if((control.current.fire||now<control.current.fireUntil||keys.current.has(' '))&&shot<=0){const angle=Math.atan2(control.current.aimY-player.y,control.current.aimX-player.x);bullets.push({x:player.x+Math.cos(angle)*28,y:player.y+Math.sin(angle)*28,vx:Math.cos(angle)*700,vy:Math.sin(angle)*700,life:1.5});shot=.16;shake=2;if(audio.current&&!control.current.muted)gunshot(audio.current)}
        bullets.forEach(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt})
        zombies.forEach(z=>{const a=Math.atan2(player.y-z.y,player.x-z.x);z.x+=Math.cos(a)*(35+time*.3)*dt;z.y+=Math.sin(a)*(35+time*.3)*dt;if(hits(z,player,28)&&damage<=0){health=Math.max(0,health-12);damage=.7;shake=6;if(audio.current&&!control.current.muted)tone(audio.current,45,.2,.12,'triangle')}for(const b of bullets){if(z.life>0&&b.life>0&&hits(z,b,22)){z.life=0;b.life=0;kills++;burst(z.x,z.y);if(audio.current&&!control.current.muted)tone(audio.current,180,.09,.05,'triangle')}}})
        particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt})
        for(const list of [zombies,bullets,particles])for(let i=list.length-1;i>=0;i--)if(list[i].life<=0)list.splice(i,1)
        if(now-hudTime>150){setHud({health,kills,wave:1+Math.floor(time/25)});hudTime=now}
        if(health<=0){setOver(true);setHud({health:0,kills,wave:1+Math.floor(time/25)})}
      }
      if(scene){scene.draw(player,{x:control.current.aimX,y:control.current.aimY},zombies,bullets,time,shot>.12,damage>0);frame=requestAnimationFrame(draw);return}
      context!.save();context!.clearRect(0,0,width,height);if(!reduced)context!.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake)
      context!.fillStyle='#182825';context!.fillRect(0,0,width,height)
      context!.strokeStyle='#32423b';context!.lineWidth=1;for(let x=0;x<width;x+=60){context!.beginPath();context!.moveTo(x,0);context!.lineTo(x,height);context!.stroke()}for(let y=0;y<height;y+=60){context!.beginPath();context!.moveTo(0,y);context!.lineTo(width,y);context!.stroke()}
      for(let i=0;i<28;i++){const x=(i*167)%width,y=(i*113)%height;context!.fillStyle='#253730';context!.fillRect(x,y,30,20);context!.fillStyle='#405347';context!.fillRect(x,y,30,3)}
      const angle=Math.atan2(control.current.aimY-player.y,control.current.aimX-player.x)
      const light=context!.createRadialGradient(player.x,player.y,30,player.x,player.y,330);light.addColorStop(0,'#ffeeae18');light.addColorStop(1,'#080e0d88');context!.fillStyle=light;context!.fillRect(0,0,width,height)
      zombies.forEach(z=>{const a=Math.atan2(player.y-z.y,player.x-z.x);context!.save();context!.translate(z.x,z.y);context!.rotate(a);context!.shadowColor='#000';context!.shadowBlur=12;context!.fillStyle='#384a2c';context!.fillRect(-17,-16,17,6);context!.fillRect(-17,10,17,6);context!.fillStyle='#748c57';context!.fillRect(6,-19,21,6);context!.fillRect(6,13,21,6);context!.fillStyle='#526b3b';context!.beginPath();context!.ellipse(0,0,18,12,0,0,Math.PI*2);context!.fill();context!.fillStyle='#90a971';context!.beginPath();context!.arc(7,0,9,0,Math.PI*2);context!.fill();context!.fillStyle='#cb7d5a';context!.fillRect(12,-5,4,3);context!.fillRect(12,3,4,3);context!.restore()})
      context!.save();context!.translate(player.x,player.y);context!.rotate(angle);context!.shadowColor='#f8bd66';context!.shadowBlur=damage>0?25:8;context!.fillStyle='#313c39';context!.fillRect(-19,-13,15,7);context!.fillRect(-19,6,15,7);context!.fillStyle='#f1c69f';context!.fillRect(6,-17,18,6);context!.fillRect(6,11,18,6);context!.fillStyle=damage>0?'#f8a469':'#121718';context!.beginPath();context!.ellipse(0,0,18,14,0,0,Math.PI*2);context!.fill();context!.fillStyle='#eac49e';context!.beginPath();context!.arc(3,0,10,0,Math.PI*2);context!.fill();context!.fillStyle='#343b3c';context!.fillRect(10,-4,26,8);context!.fillStyle='#d8c49f';context!.fillRect(18,-8,8,5);if(shot>.12){context!.fillStyle='#ffdc88';context!.beginPath();context!.moveTo(35,-10);context!.lineTo(62,0);context!.lineTo(35,10);context!.fill()}context!.restore()
      context!.fillStyle='#f7d57a';bullets.forEach(b=>context!.fillRect(b.x,b.y,6,3));particles.forEach(p=>{context!.globalAlpha=p.life/.6;context!.fillStyle='#99b674';context!.fillRect(p.x,p.y,4,4)});context!.globalAlpha=1
      context!.strokeStyle='#ffdf9c';context!.beginPath();context!.arc(control.current.aimX,control.current.aimY,10,0,Math.PI*2);context!.stroke();context!.fillStyle='#fff';context!.font='bold 15px Segoe UI';context!.fillText('TΛM',player.x-17,player.y-28);context!.restore()
      frame=requestAnimationFrame(draw)
    }
    const down=(e:KeyboardEvent)=>{if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())){e.preventDefault();keys.current.add(e.key.toLowerCase());if(e.key===' ')control.current.fireUntil=performance.now()+180}}
    const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase())
    const blur=()=>{keys.current.clear();control.current.fire=false;control.current.paused=true;setPaused(true)}
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur)
    frame=requestAnimationFrame(draw)
    return()=>{cancelAnimationFrame(frame);scene?.dispose();element.style.opacity='1';keys.current.clear();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)}
  },[playing,run])
  async function start(){audio.current??=new AudioContext();await audio.current.resume();setOver(false);setHud({health:100,kills:0,wave:1});control.current.paused=false;setPaused(false);setPlaying(true);setRun(n=>n+1)}
  return <section className="game-page container"><div className="hub-heading"><div><p className="kicker">TΛM / LAST LIGHT</p><h1>{vi?'Đêm của zombie.':'Zombie night.'}</h1></div><div className="game-hud"><span>♥ {hud.health}</span><span>☠ {hud.kills}</span><span>{vi?'Đợt':'Wave'} {hud.wave}</span><button onClick={()=>{control.current.muted=!muted;setMuted(!muted)}} aria-pressed={muted}>{muted?'🔇':'🔊'} {vi?'Âm thanh':'Sound'}</button><button disabled={!playing||over} onClick={()=>{control.current.paused=!paused;setPaused(!paused)}}>{paused?(vi?'Tiếp tục':'Resume'):(vi?'Tạm dừng':'Pause')}</button></div></div><div className="game-arena"><div ref={world} className="game-three-host" aria-hidden="true"/><canvas ref={canvas} aria-label={vi?'Đấu trường zombie góc nhìn từ trên xuống':'Top-down zombie arena'} onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();control.current.aimX=(e.clientX-r.left)/r.width*960;control.current.aimY=(e.clientY-r.top)/r.height*600}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);control.current.fire=true;control.current.fireUntil=performance.now()+180}} onPointerUp={()=>control.current.fire=false} onPointerCancel={()=>control.current.fire=false}/>{(!playing||over)&&<div className="game-overlay"><img src={`${import.meta.env.BASE_URL}assets/community-mascot.png`} alt="TΛM"/><h2>{over?(vi?'Bình minh chưa tới. Thử lại?':'Try surviving another night?'):(vi?'Sống sót cùng TΛM':'Survive with TΛM')}</h2><p>{vi?'WASD / phím mũi tên để đi · Rê chuột để ngắm · Giữ chuột hoặc Space để bắn.':'WASD / arrows to move · Mouse to aim · Hold mouse or Space to fire.'}</p><button className="button primary" onClick={()=>void start()}>{vi?'Vào trận':'Start game'}</button></div>}</div><div className="game-controls"><span>{vi?'WASD để đi · Chuột để ngắm · Giữ để bắn':'WASD to move · Mouse to aim · Hold to fire'}</span><div className="touch-pad">{[['a','←'],['w','↑'],['s','↓'],['d','→']].map(([key,label])=><button key={key} aria-label={`${vi?'Di chuyển':'Move'} ${label}`} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);keys.current.add(key)}} onPointerUp={()=>keys.current.delete(key)} onPointerCancel={()=>keys.current.delete(key)}>{label}</button>)}<button onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);control.current.fire=true;control.current.fireUntil=performance.now()+180}} onPointerUp={()=>control.current.fire=false} onPointerCancel={()=>control.current.fire=false}>{vi?'Bắn':'Fire'}</button></div></div></section>
}
