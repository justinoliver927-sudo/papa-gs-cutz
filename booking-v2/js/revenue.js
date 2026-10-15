(function () {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const message = $("#message");
  const loading = $("#loading");
  const dashboard = $("#dashboard");

  let sb = null;
  let allBookings = [];

  // These are the approved PaPa Gs Cutz prices.
  // Unknown services are flagged rather than assigned an unverified price.
  const APPROVED_PRICES = {
    dyecut: 70,
    plainfade: 45,
    kidsdyefade: 60,
    kidsplainfade: 35,
    trim: 12,
    chiskop: 30,
    bles: 30,
    chiskopbles: 30
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function normaliseService(value) {
    return String(value ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function approvedPrice(serviceName) {
    const key = normaliseService(serviceName);
    return Object.prototype.hasOwnProperty.call(APPROVED_PRICES, key)
      ? APPROVED_PRICES[key]
      : null;
  }

  function money(value) {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR"
    }).format(value);
  }

  function say(text, warning = false) {
    message.textContent = text;
    message.classList.toggle("warning", warning);
  }

  function localDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getDateBounds() {
    const range = $("#dateRange").value;
    const today = new Date();
    const todayString = localDate(today);

    if (range === "today") {
      return { from: todayString, to: todayString };
    }

    if (range === "week") {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { from: localDate(start), to: todayString };
    }

    if (range === "month") {
      return {
        from: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`,
        to: todayString
      };
    }

    if (range === "custom") {
      return {
        from: $("#dateFrom").value || "",
        to: $("#dateTo").value || ""
      };
    }

    return { from: "", to: "" };
  }

  function getFilteredBookings() {
    const { from, to } = getDateBounds();
    const status = $("#statusFilter").value;

    return allBookings.filter((booking) => {
      const date = String(booking.booking_date || "");
      if (from && date < from) return false;
      if (to && date > to) return false;
      if (status !== "all" && booking.status !== status) return false;
      return true;
    });
  }

  function render() {
    const bookings = getFilteredBookings();

    const active = bookings.filter(
      (booking) => booking.status !== "cancelled"
    );

    const cancelled = bookings.filter(
      (booking) => booking.status === "cancelled"
    );

    const unknown = active.filter(
      (booking) => approvedPrice(booking.service_name) === null
    );

    const knownActive = active.filter(
      (booking) => approvedPrice(booking.service_name) !== null
    );

    const totalValue = knownActive.reduce(
      (sum, booking) => sum + approvedPrice(booking.service_name), 0
    );

    const outstandingValue = knownActive
      .filter((booking) =>
        booking.status === "pending" || booking.status === "confirmed"
      )
      .reduce(
        (sum, booking) => sum + approvedPrice(booking.service_name), 0
      );

    const completed = knownActive.filter(
      (booking) => booking.status === "completed"
    );

    const completedValue = completed.reduce(
      (sum, booking) => sum + approvedPrice(booking.service_name), 0
    );

    $("#totalValue").textContent = money(totalValue);
    $("#outstandingValue").textContent = money(outstandingValue);
    $("#completedValue").textContent = money(completedValue);
    $("#bookingCount").textContent = active.length;
    $("#cancelledCount").textContent =
      `${cancelled.length} cancelled in selected results`;

    // Service totals
    const services = {};

    knownActive.forEach((booking) => {
      const name = String(booking.service_name || "Unnamed service");
      if (!services[name]) {
        services[name] = { count: 0, value: 0 };
      }
      services[name].count += 1;
      services[name].value += approvedPrice(booking.service_name);
    });

    const serviceRows = Object.entries(services)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([name, data]) => `
        <tr>
          <td>${escapeHTML(name)}</td>
          <td>${data.count}</td>
          <td>${money(data.value)}</td>
        </tr>
      `).join("");

    $("#serviceBreakdown").innerHTML = serviceRows
      ? `<table>
          <thead><tr><th>Service</th><th>Bookings</th><th>Value</th></tr></thead>
          <tbody>${serviceRows}</tbody>
          </table>`
      : "<p>No recognised services in this selection.</p>";

    // Booking records
    const bookingRows = bookings.map((booking) => {
      const price = approvedPrice(booking.service_name);
      const displayPrice = price === null
        ? '<span class="status">Needs price check</span>'
        : money(price);

      return `
        <tr>
          <td>${escapeHTML(booking.customer_name || "Customer")}</td>
          <td>${escapeHTML(booking.service_name || "Unknown")}</td>
          <td>${escapeHTML(booking.booking_date || "—")}</td>
          <td>${escapeHTML(booking.booking_time || "—")}</td>
          <td>${displayPrice}</td>
          <td class="status">${escapeHTML(booking.status || "unknown")}</td>
        </tr>
      `;
    }).join("");

    $("#bookingTable").innerHTML = bookingRows
      ? `<table>
          <thead>
            <tr>
              <th>Customer</th><th>Service</th><th>Date</th>
              <th>Time</th><th>Approved value</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${bookingRows}</tbody>
        </table>`
      : "<p>No bookings match these filters.</p>";

    // Unknown services are not silently added to the financial totals.
    $("#unknownSummary").textContent = unknown.length
      ? `${unknown.length} non-cancelled booking(s) need a price review. They are excluded from the value totals.`
      : "No unrecognised services in this selection.";

    $("#unknownTable").innerHTML = unknown.length
      ? `<table>
          <thead><tr><th>Service entered</th><th>Date</th><th>Stored price (unverified)</th></tr></thead>
          <tbody>${unknown.map((booking) => `
            <tr>
              <td>${escapeHTML(booking.service_name || "Unknown")}</td>
              <td>${escapeHTML(booking.booking_date || "—")}</td>
              <td>${money(Number(booking.service_price) || 0)}</td>
            </tr>
          `).join("")}</tbody>
        </table>`
      : "";
  }

  async function loadBookings() {
    say("Loading booking records…");
    $("#refreshButton").disabled = true;

    try {
      const { data, error } = await sb
        .from("booking_requests")
        .select(
          "id,customer_name,service_name,service_price,booking_date,booking_time,status,created_at"
        )
        .order("booking_date", { ascending: false })
        .limit(1000);

      if (error) throw error;

      allBookings = data || [];
      render();
      say(`Loaded ${allBookings.length} booking record(s).`);
    } catch (error) {
      say(
        "Could not load bookings. Check the owner account and Supabase permissions. " +
        (error.message || ""),
        true
      );
    } finally {
      $("#refreshButton").disabled = false;
    }
  }

  async function initialise() {
    try {
      const cfg = window.PAPA_CONFIG || {};
      sb = window.PapaApp?.client?.();

      if (!sb) {
        say("Supabase is not configured. Check js/config.js and js/app.js.", true);
        loading.classList.add("hidden");
        return;
      }

      const { data, error } = await sb.auth.getUser();

      if (error || !data?.user) {
        say("Please sign in with the business owner account to continue.", true);
        loading.classList.add("hidden");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
        return;
      }

      const ownerEmail = String(cfg.adminEmail || "").trim().toLowerCase();
      const signedInEmail = String(data.user.email || "").trim().toLowerCase();

      if (!ownerEmail || signedInEmail !== ownerEmail) {
        say("Access denied. Sign in with the configured business owner account.", true);
        loading.classList.add("hidden");
        return;
      }

      // The database RLS policies must also authorise this account.
      dashboard.classList.remove("hidden");
      loading.classList.add("hidden");

      const range = $("#dateRange");
      const from = $("#dateFrom");
      const to = $("#dateTo");

      function updateDateInputs() {
        const custom = range.value === "custom";
        from.disabled = !custom;
        to.disabled = !custom;
      }

      
range.addEventListener("change", () => {
  updateDateInputs();

  if (range.value === "today") {
    const today = localDate(new Date());
    from.value = today;
    to.value = today;
  } else if (range.value === "week") {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    from.value = localDate(start);
    to.value = localDate(today);
  } else if (range.value === "month") {
    const today = new Date();
    from.value = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-01`;
    to.value = localDate(today);
  }

  render();
});

from.addEventListener("change", render);
to.addEventListener("change", render);

$("#statusFilter").addEventListener("change", render);

$("#refreshButton").addEventListener("click", loadBookings);


      $("#logoutButton").addEventListener("click", async () => {
        await sb.auth.signOut();
        window.location.href = "login.html";
      });

      updateDateInputs();
      await loadBookings();
    } catch (error) {
      say("Dashboard could not start: " + (error.message || "Unknown error"), true);
      loading.classList.add("hidden");
    }
  }

  document.addEventListener("DOMContentLoaded", initialise);
})();
