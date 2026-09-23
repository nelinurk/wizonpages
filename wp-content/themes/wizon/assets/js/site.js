(() => {
  'use strict';

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }

    callback();
  };

  ready(() => {
    document.querySelectorAll('.wizon-skip-link[href^="#"]').forEach((skipLink) => {
      skipLink.addEventListener('click', (event) => {
        const targetId = skipLink.getAttribute('href')?.slice(1);
        const target = targetId ? document.getElementById(targetId) : null;

        if (!target) {
          return;
        }

        event.preventDefault();

        const hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) {
          target.setAttribute('tabindex', '-1');
        }

        try {
          target.focus({ preventScroll: true });
        } catch (error) {
          target.focus();
        }

        target.scrollIntoView({ block: 'start' });

        if (!hadTabindex) {
          target.addEventListener('blur', () => {
            target.removeAttribute('tabindex');
          }, { once: true });
        }
      });
    });

    document.querySelectorAll('[data-wizon-menu-toggle]').forEach((toggle) => {
      const targetId = toggle.getAttribute('aria-controls');
      const target = targetId ? document.getElementById(targetId) : null;

      if (!target) {
        return;
      }

      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        target.hidden = expanded;
      });

      target.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
          return;
        }

        toggle.setAttribute('aria-expanded', 'false');
        target.hidden = true;
        toggle.focus();
      });
    });

    /*
     * WordPress owns the production navigation overlay. The dependency-free
     * preview intentionally has no block-navigation runtime, so provide a
     * small fallback only when the WordPress dialog/close controls are absent.
     * This keeps the preview keyboard-testable without double-binding the live
     * Gutenberg menu.
     */
    document.querySelectorAll('.wizon-header__navigation').forEach((navigation, navigationIndex) => {
      const toggle = navigation.querySelector('.wp-block-navigation__responsive-container-open');
      const target = navigation.querySelector('.wp-block-navigation__responsive-container');
      const wordpressOwnsMenu = target?.querySelector(
        '.wp-block-navigation__responsive-container-close, .wp-block-navigation__responsive-dialog'
      );

      if (!toggle || !target || wordpressOwnsMenu) {
        return;
      }

      const targetId = target.id || `wizon-preview-menu-${navigationIndex + 1}`;
      target.id = targetId;
      toggle.setAttribute('aria-controls', targetId);
      toggle.setAttribute('aria-expanded', 'false');

      const setOpen = (open, restoreFocus = false) => {
        target.classList.toggle('is-menu-open', open);
        toggle.setAttribute('aria-expanded', String(open));

        if (open) {
          target.querySelector('a, button')?.focus();
        } else if (restoreFocus) {
          toggle.focus();
        }
      };

      toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });

      navigation.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          event.preventDefault();
          setOpen(false, true);
        }
      });
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    document.querySelectorAll('[data-wizon-logo-marquee]').forEach((marquee, marqueeIndex) => {
      const track = marquee.querySelector('[data-wizon-logo-marquee-track]');
      const viewport = marquee.querySelector('[data-wizon-logo-marquee-viewport]');
      const toggle = marquee.closest('.wizon-logo-wall')?.querySelector('[data-wizon-logo-marquee-toggle]');

      if (!track || track.dataset.wizonMarqueeReady === 'true') {
        return;
      }

      const originalItems = Array.from(track.children);

      if (originalItems.length < 2) {
        return;
      }

      originalItems.forEach((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.setAttribute('data-wizon-logo-clone', '');
        clone.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach((control) => {
          control.setAttribute('tabindex', '-1');
        });
        track.appendChild(clone);
      });

      const setDuration = () => {
        const firstOriginal = originalItems[0];
        const firstClone = track.querySelector('[data-wizon-logo-clone]');

        if (!firstOriginal || !firstClone) {
          return;
        }

        const loopDistance = Math.abs(firstClone.offsetLeft - firstOriginal.offsetLeft);
        const duration = Math.max(24, loopDistance / 58);
        track.style.setProperty('--wizon-logo-marquee-duration', `${duration.toFixed(2)}s`);
      };

      track.dataset.wizonMarqueeReady = 'true';
      setDuration();
      track.classList.add('is-marquee-ready');

      if (toggle) {
        let isPaused = reducedMotion.matches;
        let userHasChosen = false;

        const pauseLabel = toggle.dataset.pauseLabel || 'Pause motion';
        const playLabel = toggle.dataset.playLabel || 'Play motion';
        const pauseAriaLabel = toggle.dataset.pauseAriaLabel || pauseLabel;
        const playAriaLabel = toggle.dataset.playAriaLabel || playLabel;

        if (viewport) {
          const viewportId = viewport.id || `wizon-logo-marquee-${marqueeIndex + 1}`;
          viewport.id = viewportId;
          toggle.setAttribute('aria-controls', viewportId);
        }

        const renderMotionState = () => {
          marquee.classList.toggle('is-paused', isPaused);
          marquee.classList.toggle('is-user-playing', !isPaused && reducedMotion.matches);
          toggle.setAttribute('aria-pressed', String(isPaused));
          toggle.setAttribute('aria-label', isPaused ? playAriaLabel : pauseAriaLabel);
          toggle.textContent = isPaused ? playLabel : pauseLabel;
        };

        toggle.addEventListener('click', () => {
          userHasChosen = true;
          isPaused = !isPaused;
          renderMotionState();
        });

        const handleMotionPreference = (event) => {
          if (!userHasChosen) {
            isPaused = event.matches;
          }

          renderMotionState();
        };

        if (typeof reducedMotion.addEventListener === 'function') {
          reducedMotion.addEventListener('change', handleMotionPreference);
        } else if (typeof reducedMotion.addListener === 'function') {
          reducedMotion.addListener(handleMotionPreference);
        }

        renderMotionState();
        toggle.hidden = false;
      }

      if ('ResizeObserver' in window) {
        const observer = new ResizeObserver(setDuration);
        observer.observe(marquee);
      } else {
        window.addEventListener('resize', setDuration, { passive: true });
      }
    });
  });
})();
