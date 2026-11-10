/*
 * Browser translation of asciiquarium 1.1 and Term::Animation 2.6.
 * Official release: robobunny.com/projects/asciiquarium/asciiquarium.tar.gz
 * Copyright (C) 2013 Kirk Baucom; Term::Animation Copyright (C) 2003 Kirk Baucom.
 * GPL-2.0-or-later. See COPYING, NOTICE.md and the bundled upstream source.
 * Function names intentionally track upstream for review and differential tests.
 */
import {ASSETS} from './assets.js';
const clone=value=>JSON.parse(JSON.stringify(value));
const int=Math.trunc;
const split=value=>{const lines=value.split('\n');while(lines.at(-1)==='')lines.pop();return lines;};
const COLORS=['c','C','r','R','y','Y','b','B','g','G','m','M'];
const NAMES={black:'k',white:'w',red:'r',green:'g',blue:'b',cyan:'c',magenta:'m',yellow:'y'};
const colorId=c=>c.length===1?c:(c===c.toUpperCase()?NAMES[c.toLowerCase()]?.toUpperCase():NAMES[c]);
export function buildShape(value,auto=false,transparent='?'){
  const strings=Array.isArray(value)?value:[value];
  let width=0,height=0;
  const frames=strings.map(value=>{
    if(auto)value=split(value).map(line=>line.replace(/^\s*/,s=>transparent.repeat(s.length))).join('\n')+'\n';
    value=value.replace(/^\n/,'');
    const lines=split(value);height=Math.max(height,lines.length);
    return lines.map(line=>{width=Math.max(width,line.length);return [...line];});
  });
  return {frames,width,height};
}
export class Entity{
  constructor(a,p={}){
    this.NAME=p.name??a.rand();
    this.TRANSPARENT=p.transparent??'?';this.AUTO_TRANS=p.auto_trans??0;
    const s=buildShape(p.shape??'*',this.AUTO_TRANS,this.TRANSPARENT);
    this.SHAPE=s.frames;this.WIDTH=s.width;this.HEIGHT=s.height;
    [this.X,this.Y,this.Z]=p.position??[0,0,0];
    this.DEF_COLOR=colorId(p.default_color??'w');
    const supplied=p.color!==undefined?buildShape(p.color).frames:[];
    const masks=s.frames.map((_,i)=>supplied.length?supplied[i%supplied.length]:[]);
    this.COLOR=[];this.ATTR=[];
    s.frames.forEach((_,f)=>{this.COLOR[f]=[];this.ATTR[f]=[];for(let y=0;y<s.height;y++){this.COLOR[f][y]=[];for(let x=0;x<s.width;x++){let c=masks[f]?.[y]?.[x];if(!c||c===' ')c=this.DEF_COLOR;this.COLOR[f][y][x]=c.toLowerCase();if(/[A-Z]/.test(c)){this.ATTR[f][y]??=[];this.ATTR[f][y][x]=256;}}}});
    this.DEPTH=p.depth??1;this.PHYSICAL=p.physical??0;this.TYPE=p.type??'self';
    this.CALLBACK_ARGS=p.callback_args??null;this.CALLBACK=p.callback??(p.callback_args?'move_entity':null);
    this.COLL_HANDLER=p.coll_handler??null;this.CURR_FRAME=p.curr_frame??0;
    this.DIE_OFFSCREEN=p.die_offscreen??0;this.DIE_FRAME=p.die_frame??null;this.DIE_TIME=p.die_time??null;this.DEATH_CB=p.death_cb??null;
    this.COLLISIONS=[];this.animation=a;
  }
  move_entity(){let b=this.CALLBACK_ARGS,f;if(Array.isArray(b[1])){const path=b[1];const index=b[0];b[0]++;if(b[0]>=path.length)b[0]=0;b=path[index];f=b[3];}else if(b[3]){f=this.CURR_FRAME+b[3];f=(f-int(f))+(int(f)%this.SHAPE.length);}return[this.X+b[0],this.Y+b[1],this.Z+b[2],f];}
  kill(){this.animation.del_entity(this);}
}
export class Aquarium{
  constructor(width=120,height=40,{random=Math.random,now=()=>Math.floor(Date.now()/1000)}={}){
    this.WIDTH=width;this.HEIGHT=height;this.random=random;this.now=now;
    this.entities=new Map();this.deleteQueue=[];
  }
  rand(n=1){return this.random()*n;}
  add_entity(e){this.entities.set(e.NAME,e);return e;}
  new_entity(p){return this.add_entity(new Entity(this,p));}
  del_entity(e){if(this.entities.has(e.NAME))this.deleteQueue.push(e.NAME);}
  template(fn,dir=0,index=0){return clone(ASSETS[fn][dir][index]);}
  rand_color(mask){for(let i=1;i<=9;i++){const color=COLORS[int(this.rand(COLORS.length-1))];mask=mask.replaceAll(String(i),color);}return mask;}
  reset(){this.entities.clear();this.deleteQueue=[];this.add_environment();this.add_castle();this.add_all_seaweed();this.add_all_fish();this.random_object();}
  add_environment(){const depths=[8,6,4,2];for(let i=0;i<4;i++){const p=this.template('add_environment',0,i);const segment=p.shape.slice(0,33);p.shape=segment.repeat(int(this.WIDTH/33)+1);p.position=[0,i+5,depths[i]];this.new_entity(p);}}
  add_castle(){const p=this.template('add_castle');p.position=[this.WIDTH-32,this.HEIGHT-13,22];this.new_entity(p);}
  add_all_seaweed(){for(let i=0;i<int(this.WIDTH/15);i++)this.add_seaweed();}
  add_seaweed(){const shape=['',''];const height=int(this.rand(4))+3;for(let i=1;i<=height;i++){const left=i%2,right=1-left;shape[left]+='(\n';shape[right]+=' )\n';}
    const x=int(this.rand(this.WIDTH-2))+1,y=this.HEIGHT-height,speed=this.rand(.05)+.25;
    // Keep Perl argument evaluation order: name, then die_time, then constructor.
    const name='seaweed'+this.rand(),die=this.now()+int(this.rand(240))+480;
    this.new_entity({name,shape,position:[x,y,21],callback_args:[0,0,0,speed],die_time:die,death_cb:'add_seaweed',default_color:'green'});
  }
  add_all_fish(){for(let i=0;i<int(((this.HEIGHT-9)*this.WIDTH)/350);i++)this.add_fish();}
  add_fish(){return this.add_fish_entity(ASSETS.fish);}
  add_fish_entity(images){const num=int(this.rand((images.length-1)/2)),index=num*2;
    let speed=this.rand(2)+.25;const z=int(this.rand(17))+3;
    const color=this.rand_color(images[index+1].replaceAll('4','W'));if(num%2)speed*=-1;
    const e=new Entity(this,{type:'fish',shape:images[index],auto_trans:1,color,position:[0,0,z],callback:'fish_callback',callback_args:[speed,0,0],die_offscreen:1,death_cb:'add_fish',physical:1,coll_handler:'fish_collision'});
    e.Y=int(this.rand(this.HEIGHT-e.HEIGHT-9))+9;e.X=num%2?this.WIDTH-2:1-e.WIDTH;
    this.add_entity(e);return e;
  }
  fish_callback(e){if(int(this.rand(100))>97)this.add_bubble(e);return e.move_entity();}
  add_bubble(e){let x=e.X;if(e.CALLBACK_ARGS[0]>0)x+=e.WIDTH;this.new_entity({shape:['.','o','O','O','O'],type:'bubble',position:[x,e.Y+int(e.HEIGHT/2),e.Z-1],callback_args:[0,-1,0,.1],die_offscreen:1,physical:1,coll_handler:'bubble_collision',default_color:'CYAN'});}
  bubble_collision(e){for(const other of e.COLLISIONS)if(other.TYPE==='waterline'){e.kill();break;}}
  fish_collision(e){for(const other of e.COLLISIONS){if(other.TYPE==='teeth'){this.add_splat(other.X,other.Y,other.Z);e.kill();break;}else if(other.TYPE==='hook_point'){this.retract(other);this.retract(e);this.retract([...this.entities.values()].find(e=>e.TYPE==='fishhook'));this.retract([...this.entities.values()].find(e=>e.TYPE==='fishline'));break;}}}
  add_splat(x,y,z){const p=this.template('add_splat');p.position=[x-4,y-2,z-2];this.new_entity(p);}
  add_shark(){const dir=int(this.rand(2));let x=-53;const y=int(this.rand(this.HEIGHT-19))+9;let teethX=-9,speed=2;if(dir){speed*=-1;x=this.WIDTH-2;teethX=x+9;}
    this.new_entity({type:'teeth',shape:'*',position:[teethX,y+7,3],depth:17,callback_args:[speed,0,0],physical:1});
    const p=this.template('add_shark',dir,1);Object.assign(p,{position:[x,y,2],callback_args:[speed,0,0],death_cb:'shark_death'});this.new_entity(p);
  }
  shark_death(){this.group_death('teeth');}
  group_death(...types){for(const type of types)for(const e of this.entities.values())if(e.TYPE===type)this.del_entity(e);this.random_object();}
  hook_death(){this.group_death('teeth','fishline');}
  retract(e){e.PHYSICAL=0;if(e.TYPE==='fish'){e.Z=5;e.CALLBACK='fishhook_cb';}else e.CALLBACK_ARGS='hooked';}
  fishhook_cb(e){let y=e.Y;if(e.CALLBACK_ARGS!==null)y--;else if(y+e.HEIGHT<this.HEIGHT*.75)y++;return[e.X,y,e.Z];}
  add_fishhook(){const x=10+int(this.rand(this.WIDTH-20)),y=-4;for(let i=0;i<3;i++){const p=this.template('add_fishhook',0,i);p.position=i===0?[x+7,y-50,6]:i===1?[x,y,6]:[x+1,y+2,3];p.callback='fishhook_cb';if(i===1)p.death_cb='hook_death';this.new_entity(p);}}
  add_ship(){const dir=int(this.rand(2));const p=this.template('add_ship',dir);p.position=[dir?this.WIDTH-2:-24,0,7];p.callback_args=[dir?-1:1,0,0];p.death_cb='random_object';this.new_entity(p);}
  add_whale(){const dir=int(this.rand(2));const p=this.template('add_whale',dir);p.position=[dir?this.WIDTH-2:-18,0,5];p.callback_args=[dir?-1:1,0,0,1];p.death_cb='random_object';this.new_entity(p);}
  add_monster(){const dir=int(this.rand(2)),p=this.template('add_monster',dir);p.position=[dir?this.WIDTH-2:-64,2,5];p.callback_args=[dir?-2:2,0,0,.25];p.death_cb='random_object';return this.new_entity(p);}
  add_big_fish(){const dir=int(this.rand(2));const x=dir?this.WIDTH-1:-34,speed=3*(dir?-1:1);
    const y=int(this.rand(this.HEIGHT-15-9))+9;
    const p=this.template('add_big_fish',dir);p.color=this.rand_color(p.color);p.position=[x,y,2];p.callback_args=[speed,0,0];p.death_cb='random_object';this.new_entity(p);
  }
  add_swan(){const dir=int(this.rand(2)),p=this.template('add_swan',dir);p.position=[dir?this.WIDTH-2:-10,1,3];p.callback_args=[dir?-1:1,0,0,.25];p.death_cb='random_object';this.new_entity(p);}
  add_ducks(){const dir=int(this.rand(2)),p=this.template('add_ducks',dir);p.position=[dir?this.WIDTH-2:-30,5,3];p.callback_args=[dir?-1:1,0,0,.25];p.death_cb='random_object';this.new_entity(p);}
  add_dolphins(){const dir=int(this.rand(2)),x=dir?this.WIDTH-2:-13;const distance=dir?-15:15;const es=[];for(let i=0;i<3;i++){const p=this.template('add_dolphins',dir,i);p.position=[x-(2-i)*distance,[8,2,5][i],3];if(i===0)p.death_cb='random_object';if(i===2)p.death_cb='dolphin_lead_death';es.push(this.new_entity(p));}es[2].BOUND=[es[1],es[0]];}
  dolphin_lead_death(e){for(const other of e.BOUND)other.DIE_OFFSCREEN=1;}
  random_object(){const fn=['add_ship','add_whale','add_monster','add_big_fish','add_shark','add_fishhook','add_swan','add_ducks','add_dolphins'][int(this.rand(9))];this[fn]();}
  _do_callbacks(){
    for(const e of [...this.entities.values()]){
      if(e.DIE_TIME!==null&&e.DIE_TIME<=this.now()){this.del_entity(e);continue;}
      if(e.DIE_FRAME!==null&&e.DIE_FRAME--<=0){this.del_entity(e);continue;}
      if(e.DIE_OFFSCREEN&&(e.X>=this.WIDTH||e.Y>=this.HEIGHT||e.X<-e.WIDTH||e.Y<-e.HEIGHT)){this.del_entity(e);continue;}
      if(e.CALLBACK){const [x,y,z,f]=e.CALLBACK==='move_entity'?e.move_entity():this[e.CALLBACK](e);if(x!==undefined)e.X=x;if(y!==undefined)e.Y=y;if(z!==undefined)e.Z=z;if(f!==undefined)e.CURR_FRAME=f;}
    }
  }
  _find_collisions(){const physical=[...this.entities.values()].filter(e=>e.PHYSICAL);for(let j=0;j<physical.length;j++){const e=physical[j];for(let i=0;i<j;i++){const b=physical[i];if(e.X<b.X+b.WIDTH&&b.X<e.X+e.WIDTH&&e.Y<b.Y+b.HEIGHT&&b.Y<e.Y+e.HEIGHT&&e.Z<b.Z+b.DEPTH&&b.Z<e.Z+e.DEPTH){e.COLLISIONS.push(b);b.COLLISIONS.push(e);}}}}
  _collision_handlers(){for(const e of this.entities.values()){if(e.COLL_HANDLER&&e.COLLISIONS.length)this[e.COLL_HANDLER](e);e.COLLISIONS=[];}}
  _remove_deleted_entities(){while(this.deleteQueue.length){const name=this.deleteQueue.shift(),e=this.entities.get(name);if(!e)continue;if(e.DEATH_CB)this[e.DEATH_CB](e);this.entities.delete(name);}}
  animate(){this._do_callbacks();this._find_collisions();this._collision_handlers();this._remove_deleted_entities();return this.screen();}
  screen(){const chars=Array(this.WIDTH*this.HEIGHT).fill(' '),colors=Array(chars.length).fill('w');
    for(const e of [...this.entities.values()].sort((a,b)=>b.Z-a.Z)){
      const f=int(e.CURR_FRAME),shape=e.SHAPE[f];
      for(let i=0;i<shape.length;i++)for(let j=0;j<shape[i].length;j++){
        const c=shape[i][j];if(c===e.TRANSPARENT)continue;
        const x=e.X+j,y=e.Y+i;if(x<0||y<0||x>=this.WIDTH||y>=this.HEIGHT)continue;
        const at=int(y)*this.WIDTH+int(x);chars[at]=c;
        const color=e.COLOR[f][i][j];colors[at]=e.ATTR[f]?.[i]?.[j]?color.toUpperCase():color;
      }
    }
    return {chars,colors,width:this.WIDTH,height:this.HEIGHT};
  }
}
