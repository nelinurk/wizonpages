const test = require("node:test");
const assert = require("node:assert/strict");

const { isPastEvent, prepareEvents } = require("../events.js");

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
