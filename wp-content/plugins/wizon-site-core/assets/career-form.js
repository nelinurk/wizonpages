/* Career-only progressive enhancement. No applicant data is stored in browser storage. */
(() => {
  'use strict';

  function init() {
    document.querySelectorAll('form.wizon-career-form').forEach((form) => {
      if (form.dataset.careerReady === '1') return;
      form.dataset.careerReady = '1';
      const slot = form.closest('.wizon-career-form-slot');
      const status = slot?.querySelector('.wizon-career-status');
      const submit = form.querySelector('button[type="submit"]');
      if (!status || !submit) return;

      const openForm = () => {
        let ancestor = form.parentElement;
        while (ancestor) {
          if (ancestor.tagName === 'DETAILS') ancestor.open = true;
          ancestor = ancestor.parentElement;
        }
      };
      const showNotice = (message, success = false, focus = true) => {
        openForm();
        const notice = document.createElement('div');
        notice.className = `wizon-registration-notice ${success ? 'is-success' : 'is-error'}`;
        notice.setAttribute('role', success ? 'status' : 'alert');
        notice.setAttribute('aria-live', success ? 'polite' : 'assertive');
        notice.tabIndex = -1;
        notice.textContent = message;
        status.replaceChildren(notice);
        if (focus) {
          notice.focus({ preventScroll: true });
          notice.scrollIntoView({ block: 'center', behavior: 'auto' });
        }
      };

      form.addEventListener('invalid', openForm, true);
      form.querySelectorAll('input[type="file"]').forEach((field) => {
        const error = document.createElement('span');
        error.id = `${field.id}-error`;
        error.className = 'wizon-career-file-error wizon-registration-notice is-error';
        error.setAttribute('role', 'alert');
        error.setAttribute('aria-atomic', 'true');
        // This inline message lives inside the field label, so reset inherited label styling.
        Object.assign(error.style, {
          display: 'none', margin: '8px 0 0', padding: '10px 12px',
          fontSize: '14px', lineHeight: '1.45', fontWeight: '400',
          textTransform: 'none', overflowWrap: 'anywhere',
        });
        error.hidden = true;
        field.insertAdjacentElement('afterend', error);
        const describedBy = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
        describedBy.add(error.id);
        field.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
        const validate = () => {
          const files = Array.from(field.files || []);
          const invalid = files.length > 1 || files.some((file) =>
            !/\.(pdf|doc|docx)$/i.test(file.name) || file.size === 0 || file.size > 5 * 1024 * 1024);
          field.setCustomValidity(invalid ? form.dataset.fileInvalid : '');
          error.textContent = invalid ? form.dataset.fileInvalid : '';
          error.hidden = !invalid;
          error.style.display = invalid ? 'block' : 'none';
          if (invalid) {
            field.setAttribute('aria-invalid', 'true');
            field.setAttribute('aria-errormessage', error.id);
          } else {
            field.removeAttribute('aria-invalid');
            field.removeAttribute('aria-errormessage');
          }
          return !invalid;
        };
        field.addEventListener('change', () => {
          if (!validate()) {
            openForm();
            field.focus({ preventScroll: true });
          }
        });
        field.addEventListener('invalid', (event) => {
          if (error.hidden) return;
          // Keep the persistent inline error; native file tooltips can overlap labels on mobile.
          event.preventDefault();
          openForm();
          field.focus({ preventScroll: true });
          field.scrollIntoView({ block: 'center', behavior: 'auto' });
        });
      });

      // The native POST fallback returns to the page with an outcome query.
      const existingNotice = status.querySelector('.wizon-registration-notice');
      if (existingNotice) {
        openForm();
        requestAnimationFrame(() => {
          existingNotice.focus({ preventScroll: true });
          existingNotice.scrollIntoView({ block: 'center', behavior: 'auto' });
        });
      }

      if (!window.fetch || !window.FormData || !form.dataset.ajaxUrl) return;
      let sending = false;
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (sending || !form.reportValidity()) return;
        openForm();
        sending = true;
        const buttonText = submit.textContent;
        const data = new FormData(form);
        submit.disabled = true;
        submit.textContent = form.dataset.sending;
        form.setAttribute('aria-busy', 'true');
        status.replaceChildren();
        try {
          const response = await fetch(form.dataset.ajaxUrl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
            body: data,
          });
          if (!response.ok) throw new Error('Unconfirmed response');
          const result = await response.json();
          if (!result || typeof result.success !== 'boolean' || typeof result.message !== 'string' ||
              !['success', 'invalid', 'too_fast', 'mail_failed'].includes(result.code) ||
              result.success !== (result.code === 'success')) throw new Error('Unconfirmed response');
          // Keep every field and attachment in place after an error. Only reset on confirmed success.
          if (result.success) form.reset();
          showNotice(result.message, result.success);
        } catch (_) {
          // A lost response does not prove mail failed. Never retry automatically.
          showNotice(form.dataset.networkError);
        } finally {
          sending = false;
          submit.disabled = false;
          submit.textContent = buttonText;
          form.removeAttribute('aria-busy');
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
