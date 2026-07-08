/* ============================================================
   AR AIRWAYS — DATA LAYER  (ecosystem-data.js)
   ------------------------------------------------------------
   THE ONLY FILE THAT TOUCHES STORAGE.

   Everything above this (business logic, UI) calls these async
   functions and never reads localStorage / an API directly.
   That means going live later = reimplement THIS file against a
   real backend (Firebase, REST, whatever). Nothing else changes.

   Every method returns a Promise, exactly as a network call would,
   so the swap to real APIs needs no signature changes upstream.

   Persistence today: localStorage (single-guest, this device).
   This is a deliberate V1 limitation — cross-guest leaderboards
   etc. need a server and are stubbed to read only local data.
============================================================ */

(function () {
  const NS = "ar_airways_v1";
  const SEED_KEY = NS + ":seeded";

  // ---- low-level storage helpers (swap target) ----
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(NS + ":" + key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(NS + ":" + key, JSON.stringify(value)); }
    catch (e) { /* private mode / quota — degrade quietly */ }
  }
  const delay = (v) => new Promise((res) => setTimeout(() => res(v), 0));

  // ---- one-time seed so the experience isn't empty on first open ----
  // Represents "the guest just checked in at the airport."
  function seedIfNeeded() {
    if (read("seeded", false)) return;
    const now = Date.now();
    const profile = {
      passengerName: "Guest Traveller",
      photo: null,
      passportNumber: "AR-" + Math.floor(100000 + Math.random() * 899999),
      boardingPass: "ARW" + Math.floor(1000 + Math.random() * 8999),
      room: null,
      family: null,
      joinedAt: now,
    };
    // Ledger is the source of truth. Balance is NEVER stored.
    const ledger = [
      txn(250, "Checked in at AR Airways", "check-in", now),
    ];
    write("profile", profile);
    write("ledger", ledger);
    write("seeded", true);
  }

  function txn(amount, reason, kind, at) {
    return {
      id: "t_" + Math.random().toString(36).slice(2, 10),
      amount,
      reason,
      kind: kind || "manual",
      at: at || Date.now(),
    };
  }

  // ============================================================
  // PUBLIC DATA API  (all async — mirrors a future network layer)
  // ============================================================
  window.ARData = {
    async getProfile() {
      seedIfNeeded();
      return delay(read("profile", null));
    },

    async updateProfile(patch) {
      const p = Object.assign(read("profile", {}), patch);
      write("profile", p);
      return delay(p);
    },

    // Returns the full transaction ledger, newest first.
    async getLedger() {
      seedIfNeeded();
      const l = read("ledger", []);
      return delay(l.slice().sort((a, b) => b.at - a.at));
    },

    // Append a transaction. Positive = earn, negative = spend/redeem.
    async addTransaction(amount, reason, kind) {
      const l = read("ledger", []);
      const t = txn(amount, reason, kind);
      l.push(t);
      write("ledger", l);
      return delay(t);
    },

    // Cross-guest features (leaderboards) need a server. For V1 we
    // expose only the local guest so the UI can render without lying
    // about other passengers. Returns array of {name, miles, self}.
    async getLeaderboard() {
      const l = read("ledger", []);
      const miles = l.reduce((s, t) => s + t.amount, 0);
      const p = read("profile", {});
      return delay([{ name: p.passengerName || "You", miles, self: true }]);
    },
  };
})();
