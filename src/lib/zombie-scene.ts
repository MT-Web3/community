import * as THREE from 'three'

type Point={x:number;y:number}
export function createZombieScene(host:HTMLElement){
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25
  host.appendChild(renderer.domElement);renderer.domElement.className='game-three-surface'
  const scene=new THREE.Scene();scene.background=new THREE.Color('#18232a')
  const camera=new THREE.OrthographicCamera(-12,12,6.87,-6.87,.1,100);camera.position.set(0,32,14);camera.up.set(0,0,-1);camera.lookAt(0,0,0)
  scene.add(new THREE.HemisphereLight('#cbdedc','#263932',1.5))
  const moon=new THREE.DirectionalLight('#9cbdcc',2.2);moon.position.set(-8,18,-5);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);moon.shadow.camera.left=-16;moon.shadow.camera.right=16;moon.shadow.camera.top=12;moon.shadow.camera.bottom=-12;moon.shadow.bias=-.0005;scene.add(moon)
  const warm=new THREE.PointLight('#ffb265',25,12,2);warm.position.set(6,3,3);scene.add(warm)
  const material=(color:string,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness})
  const concrete=material('#48514c'),black=material('#182027'),skin=material('#d1aa88'),pants=material('#405064'),boots=material('#151619'),metal=material('#313c42',.35)
  function box(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
  function ellipsoid(parent:THREE.Object3D,x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:THREE.Material){const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),mat);mesh.scale.set(sx,sy,sz);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh}
  // Locally drawn surface texture; no external model or texture dependency.
  const textureCanvas=document.createElement('canvas');textureCanvas.width=256;textureCanvas.height=256
  const paint=textureCanvas.getContext('2d')!;paint.fillStyle='#404b46';paint.fillRect(0,0,256,256)
  for(let i=0;i<8000;i++){const gray=40+Math.random()*70;paint.fillStyle=`rgba(${gray},${gray+5},${gray},.22)`;paint.fillRect(Math.random()*256,Math.random()*256,2,2)}
  paint.strokeStyle='#28352e';paint.lineWidth=2;paint.strokeRect(1,1,254,254)
  const texture=new THREE.CanvasTexture(textureCanvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(12,8);texture.colorSpace=THREE.SRGBColorSpace
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,15),new THREE.MeshStandardMaterial({map:texture,roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor)
  const wall=material('#39413d');box(scene,24,1,.3,0,.5,-7.5,wall);box(scene,.3,1,15,-12,.5,0,wall);box(scene,.3,1,15,12,.5,0,wall)
  const wood=material('#705845');for(const [x,z] of [[-9,-5],[9,-4],[-8,5],[8,5]]){box(scene,1.1,.8,.8,x,.4,z,wood);box(scene,1.2,.05,.9,x,.82,z,concrete)}
  const markings=material('#b2a780');for(let i=0;i<8;i++)box(scene,.08,.008,.4,-10+i*2.7,.01,6.4,markings)
  function human(zombie=false){
    const root=new THREE.Group(),body=new THREE.Group();root.add(body)
    const shirt=zombie?material('#63734e'):black,face=zombie?material('#9aa38b'):skin
    ellipsoid(body,0,1.25,0,.3,.4,.21,shirt)
    box(body,.46,.23,.32,0,.91,0,zombie?shirt:metal)
    const left=new THREE.Group(),right=new THREE.Group();left.position.set(-.13,.8,0);right.position.set(.13,.8,0);body.add(left,right)
    box(left,.19,.52,.21,0,-.25,0,zombie?shirt:pants);box(right,.19,.52,.21,0,-.25,0,zombie?shirt:pants)
    box(left,.21,.18,.34,0,-.57,-.07,boots);box(right,.21,.18,.34,0,-.57,-.07,boots)
    const head=ellipsoid(body,0,1.85,0,.23,.27,.22,face)
    if(!zombie){ellipsoid(body,0,1.94,.055,.24,.2,.23,black);box(body,.31,.1,.08,0,1.81,-.2,black);box(body,.06,.28,.04,-.21,1.3,-.2,markings);box(body,.06,.28,.04,.21,1.3,-.2,markings)}
    const arms=new THREE.Group();arms.position.set(0,1.5,0);body.add(arms)
    box(arms,.16,.17,.5,-.3,-.08,-.27,shirt);box(arms,.16,.17,.5,.3,-.08,-.27,shirt)
    ellipsoid(arms,-.29,-.07,-.54,.09,.09,.12,face);ellipsoid(arms,.29,-.07,-.54,.09,.09,.12,face)
    if(!zombie){box(arms,.14,.18,.75,.19,-.03,-.66,metal);box(arms,.09,.07,.2,.19,.09,-.75,black)}
    else{head.rotation.z=.15;box(body,.08,.03,.02,-.09,1.91,-.21,material('#ba583f'));box(body,.08,.03,.02,.09,1.91,-.21,material('#ba583f'))}
    root.scale.setScalar(1.4);scene.add(root);return {root,left,right,arms}
  }
  const player=human(),enemies:ReturnType<typeof human>[]=[]
  const flash=new THREE.PointLight('#ffce78',0,5);scene.add(flash)
  const bulletMaterial=new THREE.MeshBasicMaterial({color:'#ffd589'}),bulletPool:THREE.Mesh[]=[]
  const glow=new THREE.Mesh(new THREE.RingGeometry(.22,.25,32),new THREE.MeshBasicMaterial({color:'#fed496',transparent:true,opacity:.7,side:THREE.DoubleSide}));glow.rotation.x=-Math.PI/2;glow.position.y=.02;scene.add(glow)
  function resize(){renderer.setSize(host.clientWidth,host.clientHeight,false)}const observer=new ResizeObserver(resize);observer.observe(host);resize()
  let previousX=0,previousZ=0
  function draw(position:Point,aim:Point,zombies:Point[],bullets:Point[],time:number,firing:boolean,hurt:boolean){
    const x=position.x/40-12,z=position.y/40-7.5,angle=Math.atan2(aim.x-position.x,aim.y-position.y)+Math.PI
    player.root.position.set(x,0,z);player.root.rotation.y=angle;const walking=Math.hypot(x-previousX,z-previousZ)>.001;player.left.rotation.x=walking?Math.sin(time*9)*.35:0;player.right.rotation.x=walking?-Math.sin(time*9)*.35:0;previousX=x;previousZ=z
    flash.position.set(x+Math.sin(angle)*-.8,1.3,z+Math.cos(angle)*-.8);flash.intensity=firing?14:0;player.root.visible=true
    for(let i=enemies.length;i<zombies.length;i++)enemies.push(human(true))
    enemies.forEach((enemy,i)=>{const zombie=zombies[i];enemy.root.visible=Boolean(zombie);if(!zombie)return;enemy.root.position.set(zombie.x/40-12,0,zombie.y/40-7.5);enemy.root.rotation.y=Math.atan2(position.x-zombie.x,position.y-zombie.y)+Math.PI;enemy.left.rotation.x=Math.sin(time*7+i)*.35;enemy.right.rotation.x=-Math.sin(time*7+i)*.35;enemy.arms.rotation.z=Math.sin(time*3+i)*.12})
    for(let i=bulletPool.length;i<bullets.length;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.07,6,4),bulletMaterial);scene.add(b);bulletPool.push(b)}
    bulletPool.forEach((bullet,i)=>{const b=bullets[i];bullet.visible=Boolean(b);if(b)bullet.position.set(b.x/40-12,1.15,b.y/40-7.5)})
    glow.position.set(aim.x/40-12,.02,aim.y/40-7.5);warm.intensity=hurt?40:25;renderer.render(scene,camera)
  }
  return {draw,dispose(){observer.disconnect();scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach(m=>m.dispose())}});texture.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove()}}
}
