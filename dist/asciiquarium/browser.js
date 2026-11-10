/* Browser terminal adapter only. Simulation rules live in engine.js (GPL-2.0-or-later). */
import {Aquarium} from './engine.js';
import {DEFAULT_SIZE,TERMINAL_SIZES,terminalSize} from './display.js';
const canvas=document.getElementById('terminal'),ctx=canvas.getContext('2d');
const pauseButton=document.getElementById('pause'),state=document.getElementById('state');
const sizeSelect=document.getElementById('terminal-size');
const requestedSize=new URLSearchParams(location.search).get('size');
sizeSelect.value=Object.hasOwn(TERMINAL_SIZES,requestedSize)?requestedSize:DEFAULT_SIZE;
// Maintenance previews replay one official event. Normal URLs use original random selection.
const preview=new URLSearchParams(location.search).get('preview');
const previewFn=preview==='monster'?'add_monster':preview==='fishhook'?'add_fishhook':null;
const colors={k:'#000000',r:'#aa0000',g:'#00aa00',y:'#aa5500',b:'#0000aa',m:'#aa00aa',c:'#00aaaa',w:'#aaaaaa',K:'#555555',R:'#ff5555',G:'#55ff55',Y:'#ffff55',B:'#5555ff',M:'#ff55ff',C:'#55ffff',W:'#ffffff'};
let aquarium,width,height,timer=null,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,stopped=false;
function resizeCanvas(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);if(aquarium)render(aquarium.screen());}
function redraw(){resizeCanvas();const {cols,rows}=terminalSize(sizeSelect.value);aquarium=new Aquarium(cols,rows);if(previewFn)aquarium.random_object=()=>aquarium[previewFn]();aquarium.reset();stopped=false;render(aquarium.screen());sync();}
function render(screen){const cw=width/screen.width,ch=height/screen.height;ctx.fillStyle='#000';ctx.fillRect(0,0,width,height);ctx.textBaseline='top';ctx.font=`${Math.min(ch-1,cw/.6001)}px "Courier New",monospace`;for(let y=0;y<screen.height;y++)for(let x=0;x<screen.width;x++){const i=y*screen.width+x,c=screen.chars[i];if(c===' ')continue;ctx.fillStyle=colors[screen.colors[i]]||colors.w;ctx.fillText(c,x*cw,y*ch);}}
function loop(){timer=null;if(stopped)return;if(!paused)render(aquarium.animate());timer=setTimeout(loop,100);}
function sync(){pauseButton.textContent=paused?'p · resume':'p · pause';pauseButton.setAttribute('aria-pressed',String(paused));state.textContent=(previewFn?' / preview: '+preview:'')+(stopped?' / stopped':paused?' / paused':'');if(stopped){if(timer)clearTimeout(timer);timer=null;}else if(!timer)timer=setTimeout(loop,100);}
function key(value){if(value==='p'){paused=!paused;sync();}else if(value==='r')redraw();else if(value==='q'){stopped=true;sync();}}
pauseButton.addEventListener('click',()=>key('p'));document.getElementById('redraw').addEventListener('click',()=>key('r'));
sizeSelect.addEventListener('change',redraw);
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey)return;const k=e.key.toLowerCase();if(['p','r','q'].includes(k)){e.preventDefault();key(k);}});
new ResizeObserver(resizeCanvas).observe(canvas);redraw();
// Browser lifecycle only: don't leave timers behind when the iframe is removed.
window.addEventListener('pagehide',()=>{if(timer)clearTimeout(timer);timer=null;});
