import {Aquarium} from '../dist/asciiquarium/engine.js';
const names=['ship','whale','monster','big_fish','shark','fishhook','swan','ducks','dolphins'];
const runs=[];
for(const initial of [1,7,17,42,99,12345,2026,9001]){
 let seed=initial,tick=0;
 const a=new Aquarium(160,48,{random:()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},now:()=>Math.floor(tick/10)});
 const events=[];
 for(const name of names){const fn=a['add_'+name].bind(a);a['add_'+name]=(...args)=>{events.push({name,seconds:tick/10});return fn(...args);};}
 a.reset();
 for(tick=0;tick<9000;tick++){a._do_callbacks();a._find_collisions();a._collision_handlers();a._remove_deleted_entities();}
 runs.push({seed:initial,totalEvents:events.length,counts:Object.fromEntries(names.map(n=>[n,events.filter(e=>e.name===n).length])),firstMonster:events.find(e=>e.name==='monster')?.seconds??null,firstHook:events.find(e=>e.name==='fishhook')?.seconds??null,longestEventSeconds:Math.max(...events.map((e,i)=>(events[i+1]?.seconds??900)-e.seconds))});
}
console.log(JSON.stringify(runs,null,2));
