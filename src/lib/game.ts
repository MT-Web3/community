export function within(value:number,maximum:number,radius=25){return Math.max(radius,Math.min(maximum-radius,value))}
export function hits(a:{x:number;y:number},b:{x:number;y:number},radius:number){return Math.hypot(a.x-b.x,a.y-b.y)<radius}
export function spawnAtEdge(edge:number,width:number,height:number,random=Math.random){return {x:edge===0?-20:edge===1?width+20:random()*width,y:edge===2?-20:edge===3?height+20:random()*height}}
