/* ============================================================
   APP SHELL + ROUTER  (Milestone 3 — full information architecture)
   ------------------------------------------------------------
   The app is a wedding companion whose primary surface is the map.
   This file defines the whole IA: seven modules, each with a
   structured scaffold of named regions that future milestones
   fill with real content. No framework, no build step.

   PRINCIPLES ENCODED HERE
   -----------------------
   1. The map stays the heart: default route, only module owning the
      full-screen interactive surface. Others are calm scrollable
      pages layered above it.
   2. Every module answers the orientation questions:
      "Where am I?"    -> module header (eyebrow + title)
      "What can I do?" -> clearly sectioned content regions
      "Where next?"    -> persistent bottom nav, always visible
   3. Architecture only. Regions render as labelled placeholders so
      structure is visible and future work has a named home. No guest
      login, no live data, no country/airport features yet.

   ADDING REAL CONTENT LATER
   -------------------------
   Each module's render() returns <section class="m-block"> regions
   with stable ids (e.g. #stay-room, #events-today). A future
   milestone swaps a region's placeholder for real content; routing,
   nav, transitions, layout already exist. Data lives in data.js /
   a future guest.js — this file only defines structure.

   FUTURE FEATURES THAT FIT WITHOUT REWRITE
   ----------------------------------------
   Airport arrival, Passport, Boarding pass, Country overlays,
   Personalized guests, Timeline, QR codes, Navigation, Notifications
   — each is a new module object, a new region in an existing module,
   or an overlay on the map surface. The shell supports all three.
============================================================ */

(function () {
  // ---- scaffold builders (shared design system, one source of truth) ----
  function header(eyebrow, title, sub) {
    return `
      <header class="m-head">
        <div class="m-eyebrow">${eyebrow}</div>
        <h1 class="m-title">${title}</h1>
        ${sub ? `<p class="m-sub">${sub}</p>` : ""}
      </header>`;
  }
  function block(id, title, body, soon) {
    return `
      <section class="m-block" id="${id}">
        <div class="m-block-head">
          <h2 class="m-block-title">${title}</h2>
          ${soon ? `<span class="m-soon">Coming soon</span>` : ""}
        </div>
        <div class="m-block-body">${body}</div>
      </section>`;
  }
  function placeholder(text) { return `<div class="m-placeholder">${text}</div>`; }
  function quickLink(route, icon, label) {
    return `<button class="m-quicklink" data-goto="${route}">
      <span class="m-quicklink-icon">${icon}</span>
      <span class="m-quicklink-label">${label}</span>
    </button>`;
  }

  // ============================================================
  // MODULE REGISTRY — order defines nav order
  // ============================================================
  const MODULES = [
    {
      id: "home", label: "Home", icon: "\u2726",
      render: () => `
        ${header("Around the World \u00b7 22\u201324 January 2027", "Riya &amp; Abhishek", "Welcome to our celebration")}
        ${block("home-countdown", "The Countdown", placeholder("A live countdown to the first event will live here."), true)}
        ${block("home-today", "Today's Highlight", placeholder("Once the celebration begins, the current day's marquee event surfaces here."), true)}
        ${block("home-quick", "Quick Access", `
          <div class="m-quicklinks">
            ${quickLink("map", "\ud83d\uddfa", "Open Map")}
            ${quickLink("stay", "\ud83d\udd11", "My Stay")}
            ${quickLink("events", "\ud83c\udf89", "Events")}
            ${quickLink("faq", "\u2727", "FAQ")}
          </div>`)}
      `,
    },

    { id: "map", label: "Map", icon: "\ud83d\uddfa", primary: true },

    {
      id: "stay", label: "My Stay", icon: "\ud83d\udd11",
      render: () => `
        ${header("Your Stay", "My Stay", "Everything about where you're staying")}
        ${block("stay-signin", "Personalize Your Stay", placeholder("Guest sign-in (via passport number) will unlock your personal details here. Not enabled yet."), true)}
        ${block("stay-room", "Your Room", placeholder("Room name, destination theme, and a shortcut to it on the map."), true)}
        ${block("stay-roommates", "Roommates", placeholder("Who you're sharing with."), true)}
        ${block("stay-checkin", "Check-in &amp; Check-out", placeholder("Arrival and departure times and process."), true)}
        ${block("stay-amenities", "Amenities", placeholder("What's included, and where to find it."), true)}
      `,
    },

    {
      id: "events", label: "Events", icon: "\ud83c\udf89",
      render: () => `
        ${header("The Celebration", "Events", "Three days, around the world")}
        ${block("events-today", "Today", placeholder("Events happening today, highlighted live during the wedding."), true)}
        ${block("events-upcoming", "Upcoming", placeholder("Everything still to come, in order."), true)}
        ${block("events-timeline", "Full Timeline", placeholder("The complete 22\u201324 January schedule."), true)}
        ${block("events-completed", "Completed", placeholder("Events that have already happened."), true)}
      `,
    },

    {
      id: "passport", label: "Passport", icon: "\ud83d\udee9\ufe0f",
      render: () => `
        ${header("AR Airways", "Passport", "Your journey around the world")}
        <div id="passport-live" class="m-block-body">
          <div class="m-placeholder">Loading your journey\u2026</div>
        </div>
      `,
      onMount: async (host) => {
        const live = host.querySelector("#passport-live");
        if (!live || !window.AR) return;
        const s = await AR.snapshot();
        const t = s.tier;
        const pct = Math.round(t.progress * 100);
        const recent = s.ledger.slice(0, 6);
        live.innerHTML = `
          <div class="pp-card" style="--frame:${t.current.frame}">
            <div class="pp-card-top">
              <div class="pp-avatar">${(s.profile.passengerName || "G").charAt(0)}</div>
              <div class="pp-id">
                <div class="pp-name">${s.profile.passengerName || "Guest Traveller"}</div>
                <div class="pp-tier">${t.current.name}</div>
              </div>
              <div class="pp-balance">
                <div class="pp-balance-num">${AR.formatMiles(s.balance)}</div>
                <div class="pp-balance-label">AR Miles</div>
              </div>
            </div>
            <div class="pp-progress">
              <div class="pp-progress-row">
                <span>${t.current.name}</span>
                <span>${t.next ? t.next.name : "Top tier reached"}</span>
              </div>
              <div class="pp-bar"><div class="pp-bar-fill" style="width:${pct}%"></div></div>
              <div class="pp-progress-hint">${t.next ? AR.formatMiles(t.toNext) + " miles to " + t.next.name : "You've reached the Royal Circle."}</div>
            </div>
            <div class="pp-stats">
              <div class="pp-stat"><b>${AR.formatMiles(s.todayMiles)}</b><span>Today</span></div>
              <div class="pp-stat"><b>${AR.formatMiles(s.lifetime)}</b><span>Lifetime</span></div>
              <div class="pp-stat"><b>${s.profile.passportNumber || "\u2014"}</b><span>Passport</span></div>
            </div>
          </div>
          <section class="m-block" style="margin-top:var(--s-5)">
            <div class="m-block-head"><h2 class="m-block-title">Recent Activity</h2></div>
            <div class="pp-ledger">
              ${recent.map((tx) => `
                <div class="pp-txn">
                  <div class="pp-txn-main">
                    <span class="pp-txn-amt ${tx.amount < 0 ? "neg" : "pos"}">${tx.amount < 0 ? "" : "+"}${AR.formatMiles(tx.amount)}</span>
                    <span class="pp-txn-reason">${tx.reason}</span>
                  </div>
                  <span class="pp-txn-when">${AR.formatWhen(tx.at)}</span>
                </div>`).join("")}
            </div>
          </section>
          <button class="m-quicklink pp-demo" data-demo-earn="1" style="margin-top:var(--s-4);width:auto;display:inline-flex">
            <span class="m-quicklink-icon">\u2728</span>
            <span class="m-quicklink-label">Earn 100 miles (demo)</span>
          </button>
        `;
        const demo = live.querySelector("[data-demo-earn]");
        if (demo) demo.addEventListener("click", async () => {
          await AR.earn(100, "Explored the companion app", "explore");
          renderModule(MODULES.find((m) => m.id === "passport"));
        });
      },
    },

    {
      id: "explore", label: "Explore", icon: "\ud83e\udded",
      render: () => `
        ${header("The Resort", "Explore", "Discover every corner of the property")}
        ${block("explore-venues", "Venues", placeholder("Ceremony and event venues, with detail and a map shortcut."), true)}
        ${block("explore-dining", "Dining", placeholder("Restaurants and dining across the resort."), true)}
        ${block("explore-pools", "Pools &amp; Water", placeholder("Swimming pools and the boat house."), true)}
        ${block("explore-temple", "Temple", placeholder("The on-site derasar."), true)}
        ${block("explore-lawns", "Lawns &amp; Gardens", placeholder("Open-air spaces across the grounds."), true)}
        ${block("explore-photo", "Photo Spots", placeholder("The most beautiful places to photograph."), true)}
      `,
    },

    {
      id: "gallery", label: "Gallery", icon: "\ud83d\udcf7",
      render: () => `
        ${header("Memories", "Gallery", "Moments from the celebration")}
        ${block("gallery-grid", "Photo Gallery", placeholder("A curated gallery will appear here during and after the wedding."), true)}
      `,
    },

    {
      id: "faq", label: "FAQ", icon: "\u2727",
      render: () => `
        ${header("Good to Know", "FAQ", "Answers to everything you might need")}
        ${block("faq-travel", "Travel", placeholder("How to reach the resort."), true)}
        ${block("faq-transport", "Transport", placeholder("Shuttles and getting around."), true)}
        ${block("faq-parking", "Parking", placeholder("Where to park on arrival."), true)}
        ${block("faq-dress", "Dress Code", placeholder("What to wear for each event."), true)}
        ${block("faq-weather", "Weather", placeholder("What to expect, and how to pack."), true)}
        ${block("faq-emergency", "Emergency Contacts", placeholder("Who to call if you need help."), true)}
      `,
    },
  ];

  const DEFAULT_ROUTE = "map";
  const rendered = new Set();

  // ---- persistent bottom module-nav ----
  const nav = document.createElement("nav");
  nav.id = "moduleNav";
  nav.setAttribute("aria-label", "Wedding companion sections");
  nav.innerHTML = MODULES.map((m) => `
    <button class="module-nav-item" data-route="${m.id}" aria-label="${m.label}">
      <span class="mn-icon">${m.icon}</span>
      <span class="mn-label">${m.label}</span>
    </button>
  `).join("");
  document.body.appendChild(nav);

  // ---- host <section> for every non-map module ----
  const shell = document.createElement("div");
  shell.id = "moduleShell";
  MODULES.filter((m) => !m.primary).forEach((m) => {
    const section = document.createElement("section");
    section.className = "module";
    section.id = "module-" + m.id;
    section.hidden = true;
    shell.appendChild(section);
  });
  document.body.appendChild(shell);

  // The map module reuses existing DOM; group it so one call toggles it.
  const MAP_ELEMENT_IDS = [
    "topbar", "viewport", "zoomControls", "tooltip", "legend",
    "popupOverlay", "editPanel", "navPanel", "roadPanel", "entryPanel",
  ];
  function setMapVisible(visible) {
    MAP_ELEMENT_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle("module-hidden", !visible);
    });
  }

  function currentRoute() {
    const h = (location.hash || "").replace(/^#\/?/, "").trim();
    return MODULES.some((m) => m.id === h) ? h : DEFAULT_ROUTE;
  }

  function renderModule(m) {
    if (m.primary) return;
    const host = document.getElementById("module-" + m.id);
    if (!host) return;
    // Static shell renders once; dynamic modules re-bind live data each visit.
    if (!rendered.has(m.id)) {
      if (m.render) {
        host.innerHTML = `<div class="module-inner">${m.render()}</div>`;
        host.querySelectorAll("[data-goto]").forEach((btn) => {
          btn.addEventListener("click", () => navigate(btn.dataset.goto));
        });
      }
      rendered.add(m.id);
    }
    // onMount runs every time the module is shown, so miles/tier stay fresh.
    if (m.onMount) {
      try { m.onMount(host); } catch (e) { /* never break navigation */ }
    }
  }

  function show(route) {
    const module = MODULES.find((m) => m.id === route) || MODULES.find((m) => m.primary);
    setMapVisible(!!module.primary);

    MODULES.filter((m) => !m.primary).forEach((m) => {
      const section = document.getElementById("module-" + m.id);
      if (!section) return;
      const active = m.id === module.id;
      if (active) {
        renderModule(m);
        section.hidden = false;
        section.classList.remove("module-enter");
        void section.offsetWidth;
        section.classList.add("module-enter");
        section.scrollTop = 0;
      } else {
        section.hidden = true;
      }
    });

    nav.querySelectorAll(".module-nav-item").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.route === module.id);
    });

    document.title = module.primary
      ? "Aayush Resort \u2014 Map"
      : "Aayush Resort \u2014 " + module.label;
  }

  function navigate(route) {
    if (currentRoute() === route) { show(route); return; }
    location.hash = "#/" + route;
  }

  nav.addEventListener("click", (e) => {
    const btn = e.target.closest(".module-nav-item");
    if (btn) navigate(btn.dataset.route);
  });
  window.addEventListener("hashchange", () => show(currentRoute()));

  window.App = {
    go: navigate,
    current: currentRoute,
    register: function (moduleDef, position) {
      const i = MODULES.findIndex((m) => m.id === moduleDef.id);
      if (i >= 0) { MODULES[i] = Object.assign(MODULES[i], moduleDef); return; }
      if (typeof position === "number") MODULES.splice(position, 0, moduleDef);
      else MODULES.push(moduleDef);
    },
  };

  show(currentRoute());
})();
