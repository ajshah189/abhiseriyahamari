/* ============================================================
   AR AIRWAYS — BUSINESS LOGIC  (ecosystem.js)
   ------------------------------------------------------------
   Pure logic. Reads through ARData (the data layer), never
   storage directly. Computes everything the golden rules ask:
   balance, tier, progress-to-next-tier, today's miles.

   Config (tiers, earn rules) lives here as data, so future
   events/rewards are added by editing config, not code.
============================================================ */

(function () {
  // ---- STATUS PROGRAM (config, not code) ----
  // Ordered ascending. `min` = lifetime miles to reach the tier.
  const TIERS = [
    { id: "explorer",  name: "Explorer",          min: 0,    frame: "#8a8f98" },
    { id: "bronze",    name: "Bronze Traveller",  min: 500,  frame: "#c08a52" },
    { id: "silver",    name: "Silver Traveller",  min: 1200, frame: "#c7ccd4" },
    { id: "gold",      name: "Gold Voyager",      min: 2500, frame: "#d4af6a" },
    { id: "platinum",  name: "Platinum Explorer", min: 4500, frame: "#cfe0ea" },
    { id: "ambassador",name: "Global Ambassador", min: 7000, frame: "#b98cd1" },
    { id: "royal",     name: "Royal Circle",      min: 10000,frame: "#e6c886" },
  ];

  function tierForMiles(lifetime) {
    let current = TIERS[0], next = null;
    for (let i = 0; i < TIERS.length; i++) {
      if (lifetime >= TIERS[i].min) { current = TIERS[i]; next = TIERS[i + 1] || null; }
    }
    const progress = next
      ? Math.min(1, (lifetime - current.min) / (next.min - current.min))
      : 1;
    return { current, next, progress, toNext: next ? next.min - lifetime : 0 };
  }

  function startOfToday() {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime();
  }

  window.AR = {
    TIERS,
    tierForMiles,

    // Derived snapshot the UI binds to. One call, everything computed.
    async snapshot() {
      const [profile, ledger] = await Promise.all([
        ARData.getProfile(),
        ARData.getLedger(),
      ]);
      const balance = ledger.reduce((s, t) => s + t.amount, 0);
      const lifetime = ledger.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
      const today0 = startOfToday();
      const todayMiles = ledger
        .filter((t) => t.amount > 0 && t.at >= today0)
        .reduce((s, t) => s + t.amount, 0);
      const tier = tierForMiles(lifetime);
      return { profile, ledger, balance, lifetime, todayMiles, tier };
    },

    // Earn/spend pass through the data layer (future: hits an API).
    earn(amount, reason, kind) { return ARData.addTransaction(Math.abs(amount), reason, kind || "earn"); },
    spend(amount, reason, kind) { return ARData.addTransaction(-Math.abs(amount), reason, kind || "redeem"); },

    formatMiles(n) { return (n || 0).toLocaleString("en-US"); },
    formatWhen(at) {
      const d = new Date(at);
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
        " · " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    },
  };
})();
