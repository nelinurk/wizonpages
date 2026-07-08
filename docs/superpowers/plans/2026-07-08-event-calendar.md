# Event Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Pages-compatible event calendar that loads events from a maintained JSON file and visually separates upcoming events from past events.

**Architecture:** Keep the site static. Store event content in `events.json`, put date classification and rendering helpers in `events.js`, and add an Events section to `index.html` that the script fills at runtime.

**Tech Stack:** Static HTML/CSS, browser JavaScript, JSON, Node.js built-in test runner.

---

### Task 1: Event Logic Test

**Files:**
- Create: `test/events.test.js`
- Create: `events.js`

- [ ] **Step 1: Write the failing test**

Create `test/events.test.js` with tests for upcoming and past event classification using fixed dates.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/events.test.js`

Expected: FAIL because `events.js` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `events.js` with `parseEventDate`, `isPastEvent`, and `prepareEvents` exported for Node and attached for browser use.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/events.test.js`

Expected: PASS.

### Task 2: Static Calendar UI

**Files:**
- Create: `events.json`
- Modify: `index.html`

- [ ] **Step 1: Add maintained event data**

Create `events.json` as an array of events with `date`, `title`, `location`, `description`, and `url`.

- [ ] **Step 2: Add Events navigation and section**

Add an `Events` nav link and a new section between Approach and Clients containing an empty render target.

- [ ] **Step 3: Add styling**

Add responsive event card styles, including a muted style for past events.

- [ ] **Step 4: Load script**

Add `<script src="events.js" defer></script>` before `</body>`.

### Task 3: Verification

**Files:**
- Verify: `index.html`
- Verify: `events.js`
- Verify: `events.json`
- Verify: `test/events.test.js`

- [ ] **Step 1: Run automated tests**

Run: `node --test test/events.test.js`

Expected: PASS.

- [ ] **Step 2: Check JSON validity**

Run: `node -e "JSON.parse(require('fs').readFileSync('events.json','utf8')); console.log('events.json valid')"`

Expected: prints `events.json valid`.

- [ ] **Step 3: Review diff**

Run: `git diff -- index.html events.js events.json test/events.test.js docs/superpowers/plans/2026-07-08-event-calendar.md`

Expected: only event calendar changes are present.
