const test = require("node:test");
const assert = require("node:assert/strict");

const { isPastEvent, prepareEvents, renderEvents } = require("../events.js");

test("multi-day events remain upcoming through their final day", () => {
  const event = { date: "2026-10-16", endDate: "2026-10-20", title: "Tallinn Data Week" };
  for (const today of ["2026-10-15", "2026-10-16", "2026-10-18", "2026-10-20"]) {
    assert.equal(prepareEvents([event], today)[0].status, "upcoming");
  }
  assert.equal(prepareEvents([event], "2026-10-21")[0].status, "past");
});

test("renders both dates for multi-day events and one date for single-day events", () => {
  const target = { innerHTML: "" };
  renderEvents([{ date: "2026-10-16", endDate: "2026-10-20", title: "Tallinn Data Week" }], target);
  assert.match(target.innerHTML, /16 Oct 2026 – 20 Oct 2026/);
  assert.doesNotMatch(target.innerHTML, /<p><\/p>/);
  renderEvents([{ date: "2026-10-16", title: "Single day" }], target);
  assert.match(target.innerHTML, /class="event-date">16 Oct 2026<\/div>/);
});

test("classifies events before today as past", () => {
  assert.equal(isPastEvent("2026-07-07", "2026-07-08"), true);
  assert.equal(isPastEvent("2026-07-08", "2026-07-08"), false);
  assert.equal(isPastEvent("2026-07-09", "2026-07-08"), false);
});

test("sorts upcoming events before past events", () => {
  const events = prepareEvents(
    [
      { date: "2026-06-01", title: "Past event" },
      { date: "2026-09-10", title: "Later event" },
      { date: "2026-08-10", title: "Soon event" }
    ],
    "2026-07-08"
  );

  assert.deepEqual(
    events.map((event) => [event.title, event.status]),
    [
      ["Soon event", "upcoming"],
      ["Later event", "upcoming"],
      ["Past event", "past"]
    ]
  );
});
