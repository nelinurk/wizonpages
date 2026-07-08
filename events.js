(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.WizonEvents = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function parseEventDate(value) {
    if (typeof value !== "string") {
      return null;
    }

    var parts = value.split("-").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return null;
    }

    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function getTodayKey() {
    var today = new Date();
    var year = today.getFullYear();
    var month = String(today.getMonth() + 1).padStart(2, "0");
    var day = String(today.getDate()).padStart(2, "0");

    return year + "-" + month + "-" + day;
  }

  function isPastEvent(eventDate, todayDate) {
    var event = parseEventDate(eventDate);
    var today = parseEventDate(todayDate || getTodayKey());

    if (!event || !today) {
      return false;
    }

    return event.getTime() < today.getTime();
  }

  function prepareEvents(events, todayDate) {
    var today = todayDate || getTodayKey();

    return events
      .filter(function (event) {
        return event && parseEventDate(event.date);
      })
      .map(function (event) {
        var status = isPastEvent(event.date, today) ? "past" : "upcoming";

        return Object.assign({}, event, {
          status: status,
          sortTime: parseEventDate(event.date).getTime()
        });
      })
      .sort(function (first, second) {
        if (first.status !== second.status) {
          return first.status === "upcoming" ? -1 : 1;
        }

        if (first.status === "past") {
          return second.sortTime - first.sortTime;
        }

        return first.sortTime - second.sortTime;
      });
  }

  function formatEventDate(value) {
    var date = parseEventDate(value);

    if (!date) {
      return value;
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderEvents(events, target) {
    var preparedEvents = prepareEvents(events);

    if (!preparedEvents.length) {
      target.innerHTML = '<p class="event-empty">No events are currently listed.</p>';
      return;
    }

    target.innerHTML = preparedEvents
      .map(function (event) {
        var statusLabel = event.status === "past" ? "Past event" : "Upcoming";
        var action = event.url
          ? '<a class="event-link" href="' + escapeHtml(event.url) + '">Event details</a>'
          : "";

        return [
          '<article class="event-card event-card--' + event.status + '">',
          '  <div class="event-date">' + escapeHtml(formatEventDate(event.date)) + "</div>",
          '  <div class="event-content">',
          '    <span class="event-status">' + statusLabel + "</span>",
          "    <h3>" + escapeHtml(event.title) + "</h3>",
          "    <p>" + escapeHtml(event.description) + "</p>",
          event.location ? '    <span class="event-location">' + escapeHtml(event.location) + "</span>" : "",
          action,
          "  </div>",
          "</article>"
        ].join("");
      })
      .join("");
  }

  function initEventCalendar() {
    var target = document.querySelector("[data-events-list]");

    if (!target) {
      return;
    }

    fetch("events.json", { cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Could not load events.json");
        }

        return response.json();
      })
      .then(function (events) {
        renderEvents(Array.isArray(events) ? events : [], target);
      })
      .catch(function () {
        target.innerHTML = '<p class="event-empty">Events are temporarily unavailable.</p>';
      });
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", initEventCalendar);
  }

  return {
    isPastEvent: isPastEvent,
    prepareEvents: prepareEvents,
    renderEvents: renderEvents
  };
});
