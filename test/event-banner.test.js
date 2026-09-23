const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectEvent, todayKey, formatDates } = require('../assets/event-banner.js');
const events = require('../assets/events.json');
const vm = require('node:vm');
const fs = require('node:fs');

test('selects nearest event regardless of input order and keeps it through its end date', () => {
  assert.equal(selectEvent([...events].reverse(), '2026-09-23', 'et'), events[0]);
  assert.equal(selectEvent(events, '2026-10-06', 'et'), events[0]);
  assert.equal(selectEvent(events, '2026-10-07', 'et'), events[1]);
  assert.equal(selectEvent(events, '2026-10-23', 'en'), events[1]);
  assert.equal(selectEvent(events, '2026-10-24', 'et'), null);
});

test('empty, malformed, invalid-date and unsafe-link data do not produce a banner', () => {
  for (const input of [[], null, {}, [null], [{ ...events[0], startDate: '2026-02-30' }],
    [{ ...events[0], endDate: '2026-01-01' }],
    [{ ...events[0], et: { title: 'Invalid', url: 'javascript:alert(1)' } }]]) {
    assert.equal(selectEvent(input, '2026-01-01', 'et'), null);
  }
});

test('uses Tallinn date at midnight regardless of visitor timezone', () => {
  assert.equal(todayKey(new Date('2026-10-06T20:59:59Z')), '2026-10-06');
  assert.equal(todayKey(new Date('2026-10-06T21:00:00Z')), '2026-10-07');
});

test('formats date ranges in both languages', () => {
  assert.match(formatDates(events[0], 'et'), /oktoober/);
  assert.match(formatDates(events[0], 'en'), /October/);
});

test('browser banner loads localized content and stays hidden without usable data', async () => {
  for (const scenario of [
    { language: 'et', data: events, visible: true },
    { language: 'en-US', data: events, visible: true },
    { language: 'et', data: [], visible: false },
    { language: 'et', fails: true, visible: false }
  ]) {
    const nodes = {};
    const banner = { hidden: true, style: { display: 'none', removeProperty(key) { delete this[key]; } },
      querySelector(selector) { return nodes[selector] ||= {}; } };
    let fetched;
    class FixedDate extends Date {
      constructor(...args) { super(...(args.length ? args : ['2026-09-23T12:00:00Z'])); }
    }
    vm.runInNewContext(fs.readFileSync(require.resolve('../assets/event-banner.js'), 'utf8'), {
      URL, Intl, Date: FixedDate, setInterval() {},
      document: { currentScript: { src: 'https://example.com/wizonpages/assets/event-banner.js' },
        readyState: 'complete', documentElement: { lang: scenario.language },
        querySelectorAll: () => [banner], addEventListener() {} },
      fetch: async url => { fetched = String(url); if (scenario.fails) throw new Error('Offline');
        return { ok: true, json: async () => scenario.data }; }
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(fetched, 'https://example.com/wizonpages/assets/events.json');
    assert.equal(banner.hidden, !scenario.visible);
    if (scenario.visible) {
      const lang = scenario.language.startsWith('en') ? 'en' : 'et';
      assert.ok(nodes['.wizon-event__title--desktop'].textContent.startsWith(events[0][lang].title));
      assert.equal(nodes['.wizon-event__link a'].href, 'https://example.com/wizonpages/' + events[0][lang].url);
      assert.equal(banner.style.display, undefined);
    } else assert.equal(banner.style.display, 'none');
  }
});
