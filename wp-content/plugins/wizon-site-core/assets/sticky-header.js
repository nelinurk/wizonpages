(() => {
 'use strict';
 const header = document.querySelector('.wp-site-blocks > header.wp-block-template-part:has(.wizon-header)');
 if (!header) return;
 const root = document.documentElement;
 const toolbar = document.getElementById('wpadminbar');
 let previousHeight = -1;
 let previousToolbar = -1;
 function measure() {
  const height = Math.ceil(header.getBoundingClientRect().height);
  const toolbarHeight = toolbar ? Math.max(0, Math.ceil(toolbar.getBoundingClientRect().bottom)) : 0;
  if (height !== previousHeight) {
   root.style.setProperty('--wizon-nav-height', `${height}px`);
   previousHeight = height;
  }
  if (toolbarHeight !== previousToolbar) {
   root.style.setProperty('--wizon-toolbar-height', `${toolbarHeight}px`);
   previousToolbar = toolbarHeight;
  }
 }
 if ('ResizeObserver' in window) new ResizeObserver(measure).observe(header);
 window.addEventListener('resize', measure, {passive: true});
 if (toolbar) window.addEventListener('scroll', measure, {passive: true});
 measure();
})();
