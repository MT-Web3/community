import {expect,it} from 'vitest'
import {hits,spawnAtEdge,within} from './game'
it('keeps the player inside the arena including diagonal edge movement',()=>{expect(within(-100,960)).toBe(25);expect(within(1000,960)).toBe(935);expect(within(500,960)).toBe(500)})
it('detects projectile hits and rejects distant targets',()=>{expect(hits({x:10,y:10},{x:20,y:20},22)).toBe(true);expect(hits({x:10,y:10},{x:40,y:40},22)).toBe(false)})
it('always spawns enemies outside one of the four arena edges',()=>{const sample=()=>.5;expect(spawnAtEdge(0,960,600,sample)).toEqual({x:-20,y:300});expect(spawnAtEdge(1,960,600,sample)).toEqual({x:980,y:300});expect(spawnAtEdge(2,960,600,sample)).toEqual({x:480,y:-20});expect(spawnAtEdge(3,960,600,sample)).toEqual({x:480,y:620})})
