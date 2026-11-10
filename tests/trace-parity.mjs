import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {Aquarium} from '../dist/asciiquarium/engine.js';
const traces=JSON.parse(fs.readFileSync(new URL('./trace.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
for(const trace of traces){let seed=trace.seed,calls=0,id=0;
 const a=new Aquarium(120,40,{random:()=>{calls++;seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}});
 const add=a.add_entity.bind(a);a.add_entity=e=>{e.TEST_ID=id++;return add(e);};
 a.add_environment();a.add_castle();a.add_all_seaweed();a.add_all_fish();
 if(trace.special)a[trace.special]();else a.random_object();
 if(trace.special==='add_fishhook'){const es=[...a.entities.values()],point=es.find(e=>e.TYPE==='hook_point'),fish=es.filter(e=>e.TYPE==='fish').sort((a,b)=>a.TEST_ID-b.TEST_ID)[0];fish.X=point.X;fish.Y=12;fish.Z=4;fish.CALLBACK_ARGS[0]=0;}
 // Perl deliberately randomizes hash iteration. Supply its recorded iteration
 // order to compare the exact same execution, without changing port behavior.
 function order(ids){const objects=[...a.entities.values()],map=new Map(objects.map(e=>[e.TEST_ID,e]));assert.deepEqual([...map.keys()].sort((a,b)=>a-b),[...ids].sort((a,b)=>a-b));a.entities=new Map(ids.map(id=>{const e=map.get(id);return[e.NAME,e];}));}
 let caught=false;
 const dolphinFollowers=trace.special==='add_dolphins'?[...a.entities.values()].find(e=>e.BOUND).BOUND:[];
 for(let f=0;f<trace.frames.length;f++){const t=trace.frames[f];order(t.callbacks);a._do_callbacks();order(t.physics);a._find_collisions();a._collision_handlers();a._remove_deleted_entities();order(t.draw);const screen=a.screen();
  if([...a.entities.values()].some(e=>e.TYPE==='fish'&&e.CALLBACK==='fishhook_cb'))caught=true;
  assert.equal(calls,t.calls,`seed ${trace.seed}, frame ${f}: random calls`);
  const hash=crypto.createHash('sha256').update(screen.chars.join('')+screen.colors.join('')).digest('hex');
  assert.equal(hash,t.hash,`seed ${trace.seed}, frame ${f}: original Perl character/color buffer`);
 }
 if(trace.special==='add_fishhook')assert.ok(caught,'Official hook scenario must actually catch a fish');
 if(dolphinFollowers.length)assert.ok(dolphinFollowers.every(e=>e.DIE_OFFSCREEN===1),'Lead dolphin must release follower offscreen lifecycle');
}
console.log(`PASS ${traces.reduce((n,t)=>n+t.frames.length,0)} complete frames against unchanged Perl scene and Term::Animation: character + color buffers, event creation, movement, transparency, depth and collision lifecycle`);
