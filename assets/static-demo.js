
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form.wizon-contact-form').forEach((form) => {
    form.removeAttribute('action');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let notice = form.querySelector('.wizon-static-form-notice');
      if (!notice) {
        notice = document.createElement('p');
        notice.className = 'wizon-static-form-notice';
        notice.setAttribute('role', 'status');
        form.appendChild(notice);
      }
      notice.textContent = document.documentElement.lang === 'en-US'
        ? 'This is a static preview. The form does not send or store your information.'
        : 'See on staatiline eelvaade. Vorm ei saada ega salvesta sisestatud andmeid.';
    });
  });
});
