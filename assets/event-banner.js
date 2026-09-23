(function () {
  'use strict';

  function validDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  }

  function todayKey(now) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Tallinn', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(now || new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function selectEvent(events, today, language) {
    if (!Array.isArray(events)) return null;
    return events.filter(event => event && validDate(event.startDate) &&
      validDate(event.endDate || event.startDate) &&
      (event.endDate || event.startDate) >= event.startDate &&
      (event.endDate || event.startDate) >= today &&
      event[language] && typeof event[language].title === 'string' && event[language].title.trim() &&
      typeof event[language].url === 'string' && /^(sundmused|en\/events)\/[a-z0-9/#-]*$/.test(event[language].url))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] || null;
  }

  function formatDates(event, language) {
    const formatter = new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'et-EE', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Tallinn'
    });
    const start = new Date(event.startDate + 'T12:00:00Z');
    const end = new Date((event.endDate || event.startDate) + 'T12:00:00Z');
    return formatter.formatRange(start, end);
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { selectEvent, todayKey, formatDates };
  }
  if (typeof document === 'undefined') return;
  const script = document.currentScript;
  const base = new URL('../', script.src);

  async function init() {
    const banners = [...document.querySelectorAll('[data-event-banner]')];
    if (!banners.length) return;
    const language = document.documentElement.lang.startsWith('en') ? 'en' : 'et';
    let events = [];
    function render() {
      const event = selectEvent(events, todayKey(), language);
      banners.forEach(banner => {
        banner.hidden = true;
        banner.style.display = 'none';
        if (!event) return;
        const content = event[language];
        const url = new URL(content.url, base);
        if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
        const label = content.title + ' · ' + formatDates(event, language);
        banner.querySelector('.wizon-event__label').textContent = language === 'en' ? 'EVENT' : 'SÜNDMUS';
        banner.querySelector('.wizon-event__title--desktop').textContent = label;
        const mobile = banner.querySelector('.wizon-event__mobile-link');
        mobile.textContent = label + ' →';
        mobile.href = url.href;
        const link = banner.querySelector('.wizon-event__link a');
        link.textContent = language === 'en' ? 'Learn more →' : 'Loe lähemalt →';
        link.href = url.href;
        banner.hidden = false;
        banner.style.removeProperty('display');
      });
    }
    try {
      const response = await fetch(new URL('assets/events.json', base), { cache: 'no-cache' });
      if (!response.ok) throw new Error('Events unavailable');
      events = await response.json();
      render();
      setInterval(render, 60000);
      document.addEventListener('visibilitychange', render);
    } catch (_) {
      // The initial hidden state also covers missing or invalid event data.
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
