/* Original browser animation inspired by asciiquarium; no upstream code or sprites copied. */
(() => {
  'use strict';
  const p = window.PROFILE;
  for (const [id,key] of [['name','name'],['eyebrow','eyebrow'],['intro','intro'],['about-copy','about'],['note','note']]) document.getElementById(id).textContent = p[key] || '';
  document.title = p.name === 'Hello, stranger.' ? 'A little corner of the internet' : `${p.name} — Home`;
  const safeURL = value => { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : null; } catch { return null; } };
  function link(label,url){const a=document.createElement('a');a.textContent=label+' ↗';a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
  for(const item of p.links || []) { const url=safeURL(item.url);if(url)document.getElementById('links').append(link(item.label,url)); }
  if(p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)){const a=document.createElement('a');a.textContent='Say hello ↗';a.href='mailto:'+p.email;document.getElementById('links').append(a);}
  const projects=document.getElementById('projects');
  if(!p.projects?.length){const box=document.createElement('div');box.className='empty-work';const copy=document.createElement('p');copy.textContent='A space for projects, experiments, and interesting detours. The workbench is still being set up.';const tag=document.createElement('p');tag.className='mono';tag.textContent='[ a work in progress, like most good things ]';box.append(copy,tag);projects.append(box);}
  for(const item of p.projects || []){const box=document.createElement('article');box.className='project';const title=document.createElement('h3');const url=safeURL(item.url);if(url)title.append(link(item.title,url));else title.textContent=item.title;const desc=document.createElement('p');desc.textContent=item.description;box.append(title,desc);projects.append(box);}
  function clock(){document.getElementById('clock').textContent=new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit'}).format(new Date())+' / your local time';}clock();setInterval(clock,30000);
})();
