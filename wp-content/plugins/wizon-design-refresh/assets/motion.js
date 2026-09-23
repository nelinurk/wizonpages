(() => {
 'use strict';
 if(!document.body.classList.contains('wizon-refresh'))return;
 const body=document.body;
 const header=document.querySelector('[data-wdr-header]');
 const burger=header?.querySelector('.burger');
 const menu=header?.querySelector('.menu');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const languageButton=header?.querySelector('.lang-toggle');
 const languageMenu=header?.querySelector('.lang-menu');
 const closeLanguage=()=>{if(languageMenu)languageMenu.hidden=true;languageButton?.setAttribute('aria-expanded','false');};
 languageButton?.addEventListener('click',()=>{languageMenu.hidden=!languageMenu.hidden;languageButton.setAttribute('aria-expanded',String(!languageMenu.hidden));});
 document.addEventListener('click',e=>{if(!e.target.closest('.lang'))closeLanguage();});
 // Existing announcement markup and its editable settings stay authoritative.
 const topbar=document.querySelector('.wp-site-blocks>.wp-block-template-part:not(header):not(footer)');
 if(topbar && topbar.textContent.trim())topbar.classList.add('wdr-notice');
 const measure=()=>{
  body.style.setProperty('--wdr-notice',`${topbar?.getBoundingClientRect().height||0}px`);
  body.style.setProperty('--wdr-nav',`${header?.getBoundingClientRect().height||76}px`);
  body.style.setProperty('--wdr-menu-top',`${header?.getBoundingClientRect().bottom||76}px`);
 };
 const closeMenu=(focus=false)=>{
  body.classList.remove('menu-open');burger?.setAttribute('aria-expanded','false');
  if(focus)burger?.focus();
 };
 burger?.addEventListener('click',()=>{
  const open=body.classList.toggle('menu-open');burger.setAttribute('aria-expanded',String(open));
  measure();if(open)menu?.querySelector('a')?.focus();
 });
 header?.addEventListener('keydown',e=>{
  if(e.key==='Escape'){const wasMenuOpen=body.classList.contains('menu-open');closeLanguage();closeMenu(wasMenuOpen);if(!wasMenuOpen)languageButton?.focus();}
  if(e.key!=='Tab'||!body.classList.contains('menu-open'))return;
  const focusable=[...header.querySelectorAll('a,button')].filter(el=>el.getBoundingClientRect().width>0);
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 });
 menu?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
 const onScroll=()=>{header?.classList.toggle('scrolled',window.scrollY>24);measure();};
 window.addEventListener('scroll',onScroll,{passive:true});
 window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu();measure();},{passive:true});
 if(window.ResizeObserver){const ro=new ResizeObserver(measure);if(header)ro.observe(header);if(topbar)ro.observe(topbar);}
 onScroll();measure();
 // Add an aria-hidden duplicate for the continuous logo strip, with no duplicate tab stops.
 document.querySelectorAll('[data-wdr-marquee] .marquee-track').forEach(track=>{
  if(reduced.matches)return;
  [...track.children].forEach(child=>{const clone=child.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.dataset.wdrClone='';clone.querySelectorAll('a').forEach(a=>a.tabIndex=-1);track.append(clone);});
 });
 const reveals=[...document.querySelectorAll('[data-wdr-reveal],[data-reveal],[data-inview]')];
 if('IntersectionObserver' in window){
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');io.unobserve(entry.target);}}),{threshold:.15});
  reveals.forEach(el=>io.observe(el));
 }else reveals.forEach(el=>el.classList.add('in'));
 // Keep administrator preview navigation in the same reversible mode.
 if(new URL(location.href).searchParams.get('wizon_design_preview')==='1'){
  document.querySelectorAll('main a[href],.site-header a[href],.site-footer a[href],.wizon-announcement a[href]').forEach(a=>{
   const url=new URL(a.href,location.href);
   if(url.origin===location.origin&&!url.pathname.includes('/wp-admin/')&&!url.pathname.includes('koolitus')&&!a.getAttribute('href').startsWith('#')){url.searchParams.set('wizon_design_preview','1');a.href=url.href;}
  });
 }
 const spyLinks=[...document.querySelectorAll('[data-spy] a[href^="#"]')];
 if('IntersectionObserver' in window&&spyLinks.length){
  const spy=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){spyLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id));}}),{rootMargin:'-20% 0px -60% 0px'});
  spyLinks.forEach(a=>{const target=document.getElementById(decodeURIComponent(a.hash.slice(1)));if(target)spy.observe(target);});
 }
 // Accessible photo enlargement, preserving the original editable photo sources.
 const photoButtons=[...document.querySelectorAll('[data-wdr-lightbox]')];
 if(photoButtons.length){
  const lightbox=document.createElement('div');lightbox.className='lightbox';lightbox.hidden=true;lightbox.setAttribute('role','dialog');lightbox.setAttribute('aria-modal','true');lightbox.setAttribute('aria-label',document.documentElement.lang.startsWith('en')?'Photo preview':'Pildi eelvaade');
  const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label',document.documentElement.lang.startsWith('en')?'Close':'Sulge');
  const large=document.createElement('img');lightbox.append(close,large);body.append(lightbox);let opener;
  const dismiss=()=>{lightbox.hidden=true;body.style.overflow='';opener?.focus();};
  photoButtons.forEach(btn=>btn.addEventListener('click',()=>{const img=btn.querySelector('img');if(!img)return;opener=btn;large.src=img.dataset.full||img.currentSrc||img.src;large.alt=img.alt;lightbox.hidden=false;body.style.overflow='hidden';close.focus();}));
  close.addEventListener('click',dismiss);lightbox.addEventListener('click',e=>{if(e.target===lightbox)dismiss();});lightbox.addEventListener('keydown',e=>{if(e.key==='Escape')dismiss();if(e.key==='Tab'){e.preventDefault();close.focus();}});
 }
 document.querySelectorAll('.wizon-registration-form__submit').forEach(button=>{
  if(button.querySelector('.arr'))return;
  const arrow=document.createElement('span');arrow.className='arr';arrow.setAttribute('aria-hidden','true');arrow.textContent='→';button.append(arrow);
 });
 // Flowing perspective mesh based on the approved visual. Decoration only, no tracking.
 const fields=[...document.querySelectorAll('.mini-dots')].map(canvas=>({canvas,ctx:canvas.getContext('2d'),mini:true,visible:true,w:0,h:0})).filter(f=>f.ctx);
 if(!fields.length)return;
 let frame=0,last=0;
 function draw(f,time){
  const {ctx,w,h,mini}=f;ctx.clearRect(0,0,w,h);if(!w||!h)return;
  const rows=mini?26:42,cols=mini?30:56,t=time*.00013;
  for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
   const u=col/(cols-1),v=row/(rows-1),depth=.48+v*.65;
   const edge=Math.sin(u*Math.PI)*Math.sin(v*Math.PI);
   const ripple=Math.sin(u*7.4+v*2.2+t)*.09+Math.cos(u*3.8-v*5.2+t*.6)*.045;
   const x=w*(.5+(u-.5)*depth*(mini?1.15:1.28)+Math.sin(v*4+t*.4)*.035);
   const y=h*((mini?.12:.1)+v*(mini?.8:.88)+ripple*(.4+v*.8));
   const accent=(row*37+col*19)%137===0;
   const alpha=Math.max(0,edge)*(accent?.6:(mini?.24:.28))*(.5+v*.5);
   ctx.fillStyle=accent?`rgba(190,30,45,${alpha})`:`rgba(115,117,120,${alpha})`;
   ctx.beginPath();ctx.arc(x,y,(accent?1.7:1.05)*depth,0,Math.PI*2);ctx.fill();
  }
 }
 const size=()=>fields.forEach(f=>{const r=f.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);f.w=r.width;f.h=r.height;f.canvas.width=Math.round(r.width*dpr);f.canvas.height=Math.round(r.height*dpr);f.ctx.setTransform(dpr,0,0,dpr,0,0);draw(f,0);});
 function tick(time){if(!document.hidden&&time-last>40){fields.forEach(f=>{if(f.visible)draw(f,time);});last=time;}frame=requestAnimationFrame(tick);}
 const run=()=>{cancelAnimationFrame(frame);if(!reduced.matches&&!document.hidden)frame=requestAnimationFrame(tick);else fields.forEach(f=>draw(f,0));};
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{const f=fields.find(f=>f.canvas===e.target);if(f)f.visible=e.isIntersecting;}));fields.forEach(f=>io.observe(f.canvas));}
 window.addEventListener('resize',size,{passive:true});document.addEventListener('visibilitychange',run);reduced.addEventListener('change',run);size();run();
})();
