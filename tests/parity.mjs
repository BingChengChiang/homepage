import fs from 'node:fs';
import assert from 'node:assert/strict';
import {Aquarium,Entity,buildShape} from '../dist/asciiquarium/engine.js';
const fixtures=JSON.parse(fs.readFileSync(new URL('./fixtures.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const normalize=e=>{
 const out={};for(const key of ['X','Y','Z','WIDTH','HEIGHT','DEPTH','TYPE','PHYSICAL','CALLBACK_ARGS','SHAPE','COLOR','CURR_FRAME','DIE_OFFSCREEN','DIE_FRAME','TRANSPARENT'])out[key]=e[key]??null;
 out.ATTR=e.SHAPE.map((_,f)=>Array.from({length:e.HEIGHT},(_,y)=>Array.from({length:e.WIDTH},(_,x)=>e.ATTR?.[f]?.[y]?.[x]??null)));
 // JSON::PP emits fewer significant digits than JS; normalize only serialization noise.
 return JSON.parse(JSON.stringify(out,(_,v)=>typeof v==='number'?Number(v.toPrecision(12)):v));
};
function canonical(entities){return entities.map(normalize).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));}
for(const f of fixtures){let seed=f.seed,calls=0;const random=()=>{calls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const a=new Aquarium(120,40,{random,now:()=>0});if(f.fn==='add_splat')a.add_splat(20,20,3);else a[f.fn]();
 assert.equal(calls,f.calls,`${f.fn} seed ${f.seed}: random call sequence`);
 try{assert.deepEqual(canonical([...a.entities.values()]),canonical(f.entities));}catch(error){console.error(`FAIL ${f.fn} seed ${f.seed}`);throw error;}
}
console.log(`PASS ${fixtures.length} upstream Perl spawn fixtures: exact shapes, masks, positions, speeds, depths, frame sequences and RNG call counts`);
// Opaque spaces inside a foreground sprite MUST erase fish behind it.
const a=new Aquarium(12,4);a.new_entity({shape:'ABCDE',position:[1,1,8]});a.new_entity({shape:'X X',position:[2,1,3]});assert.equal(a.screen().chars.slice(12,24).join(''),' AX XE      ');
// '?' stays transparent. A leading blank with auto_trans also stays transparent.
const b=new Aquarium(12,4);b.new_entity({shape:'ABCDE',position:[1,1,8]});b.new_entity({shape:' X?X',auto_trans:1,position:[1,1,3]});assert.equal(b.screen().chars.slice(12,24).join(''),' AXCXE      ');
const c=new Aquarium(120,40);const left=c.new_entity({shape:'<o)',position:[30,10,4],callback_args:[-1.25,0,0]});const right=c.new_entity({shape:'(o>',position:[10,20,5],callback_args:[1.25,0,0]});c.animate();assert.equal(left.X,28.75);assert.equal(right.X,11.25);
const bg=c.new_entity({type:'fish',shape:'abc',position:[50,12,19],physical:1});const teeth=c.new_entity({type:'teeth',shape:'*',position:[51,12,3],physical:1,depth:17});c._find_collisions();assert.ok(bg.COLLISIONS.includes(teeth));
console.log('PASS regression cases: opaque interior spaces, transparent exterior, front/back depth, direction and 3D collision');
// Every special object must finish and hand control to another upstream event.
for(const fn of ['add_ship','add_whale','add_monster','add_big_fish','add_shark','add_swan','add_ducks','add_dolphins']){let seed=44;const a=new Aquarium(80,30,{random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},now:()=>0});a[fn]();for(let i=0;i<500;i++)a.animate();assert.ok(a.entities.size>0);}
console.log('PASS special-object lifecycle simulation');
for(const random of [()=>0,()=>.9]){const a=new Aquarium(160,48,{random});const e=a.add_monster();assert.equal(e.SHAPE.length,4);assert.equal(Math.abs(e.CALLBACK_ARGS[0]),2);assert.equal(e.CALLBACK_ARGS[3],.25);for(let i=0;i<16;i++){const [x,y,z,f]=e.move_entity();Object.assign(e,{X:x,Y:y,Z:z,CURR_FRAME:f});}assert.equal(e.CURR_FRAME,0);}
console.log('PASS official sea serpent: four frames, 16 ticks per cycle, unchanged horizontal speed');
