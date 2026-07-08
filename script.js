/* ==========================================================
   Aayush Resort — Interactive Map
   script.js — all behaviour. Content comes from data.js.
   ========================================================== */

(() => {
  const viewport = document.getElementById("viewport");
  const mapWrap = document.getElementById("mapWrap");
  const mapImage = document.getElementById("mapImage");
  const overlay = document.getElementById("overlay");
  const tooltip = document.getElementById("tooltip");

  // ---------------------------------------------------------
  // View state (pan / zoom)
  // ---------------------------------------------------------
  const view = { x: 0, y: 0, scale: 1, minScale: 0.2, maxScale: 4 };
  let dragging = false, dragStart = null, dragged = false;

  function applyTransform() {
    mapWrap.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  }

  function fitToScreen() {
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const scale = Math.min(vw / MAP_WIDTH, vh / MAP_HEIGHT) * 0.96;
    view.scale = scale;
    view.minScale = scale * 0.5;
    view.maxScale = scale * 6;
    view.x = (vw - MAP_WIDTH * scale) / 2;
    view.y = (vh - MAP_HEIGHT * scale) / 2;
    applyTransform();
  }

  function clampScale(s) {
    return Math.min(view.maxScale, Math.max(view.minScale, s));
  }

  function zoomAt(clientX, clientY, factor) {
    const rect = viewport.getBoundingClientRect();
    const mx = clientX - rect.left, my = clientY - rect.top;
    const newScale = clampScale(view.scale * factor);
    const ratio = newScale / view.scale;
    view.x = mx - (mx - view.x) * ratio;
    view.y = my - (my - view.y) * ratio;
    view.scale = newScale;
    applyTransform();
  }

  function flyTo(cx, cy, targetScale) {
    // cx, cy in map pixel coords
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const s = targetScale || Math.max(view.scale, view.maxScale * 0.55);
    view.scale = clampScale(s);
    view.x = vw / 2 - cx * view.scale;
    view.y = vh / 2 - cy * view.scale;
    applyTransform();
  }

  // Mouse drag to pan
  viewport.addEventListener("mousedown", (e) => {
    if (editMode) return;
    dragging = true; dragged = false;
    dragStart = { x: e.clientX - view.x, y: e.clientY - view.y };
    viewport.classList.add("grabbing");
  });
  window.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    dragged = true;
    view.x = e.clientX - dragStart.x;
    view.y = e.clientY - dragStart.y;
    applyTransform();
  });
  window.addEventListener("mouseup", () => {
    dragging = false;
    viewport.classList.remove("grabbing");
  });

  // Wheel zoom
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(e.clientX, e.clientY, factor);
  }, { passive: false });

  // Double click zoom
  viewport.addEventListener("dblclick", (e) => {
    if (editMode) return;
    zoomAt(e.clientX, e.clientY, 1.6);
  });

  // Touch: drag + pinch
  let touchState = null;
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      touchState = { mode: "pan", startX: e.touches[0].clientX - view.x, startY: e.touches[0].clientY - view.y };
    } else if (e.touches.length === 2) {
      const [a, b] = e.touches;
      touchState = {
        mode: "pinch",
        startDist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
        startScale: view.scale,
        midX: (a.clientX + b.clientX) / 2,
        midY: (a.clientY + b.clientY) / 2,
      };
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!touchState) return;
    if (touchState.mode === "pan" && e.touches.length === 1) {
      view.x = e.touches[0].clientX - touchState.startX;
      view.y = e.touches[0].clientY - touchState.startY;
      applyTransform();
    } else if (touchState.mode === "pinch" && e.touches.length === 2) {
      const [a, b] = e.touches;
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const factor = dist / touchState.startDist;
      const rect = viewport.getBoundingClientRect();
      const mx = touchState.midX - rect.left, my = touchState.midY - rect.top;
      const newScale = clampScale(touchState.startScale * factor);
      const ratio = newScale / view.scale;
      view.x = mx - (mx - view.x) * ratio;
      view.y = my - (my - view.y) * ratio;
      view.scale = newScale;
      applyTransform();
    }
  }, { passive: true });

  viewport.addEventListener("touchend", () => { touchState = null; });

  // Zoom buttons
  document.getElementById("zoomIn").onclick = () => {
    const r = viewport.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1.25);
  };
  document.getElementById("zoomOut").onclick = () => {
    const r = viewport.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, 1 / 1.25);
  };
  document.getElementById("zoomReset").onclick = fitToScreen;

  window.addEventListener("resize", fitToScreen);

  // ---------------------------------------------------------
  // Label toggle (blank <-> operational labeled map)
  // ---------------------------------------------------------
  let labeled = false;
  document.getElementById("labelToggleBtn").onclick = (e) => {
    labeled = !labeled;
    mapImage.src = labeled ? MAP_IMAGE_LABELED : MAP_IMAGE_BLANK;
    e.target.classList.toggle("active", labeled);
  };

  // ---------------------------------------------------------
  // Build SVG overlay from LOCATIONS
  // ---------------------------------------------------------
  overlay.setAttribute("viewBox", `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`);
  overlay.setAttribute("width", MAP_WIDTH);
  overlay.setAttribute("height", MAP_HEIGHT);

  function pointsToAttr(points) {
    return points.map((p) => p.join(",")).join(" ");
  }

  // Room-zone tint layer sits below the hotspots (inserted first = lower z-order)
  // so hover/click on cottages still works normally when zones are shown.
  const zoneLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  zoneLayer.id = "zoneLayer";
  overlay.appendChild(zoneLayer);

  const hotspotEls = {};

  LOCATIONS.forEach((loc) => {
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", pointsToAttr(loc.polygon));
    poly.classList.add("hotspot");
    poly.dataset.id = loc.id;
    poly.dataset.category = loc.category;

    poly.addEventListener("mouseenter", () => showTooltip(loc));
    poly.addEventListener("mousemove", (e) => positionTooltip(e));
    poly.addEventListener("mouseleave", hideTooltip);
    poly.addEventListener("click", (e) => {
      e.stopPropagation();
      openPopup(loc);
    });

    overlay.appendChild(poly);
    hotspotEls[loc.id] = poly;
  });

  // Route lines render above hotspots/zones, below the edit-mode overlay.
  const routeLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  routeLayer.id = "routeLayer";
  overlay.appendChild(routeLayer);

  // ---------------------------------------------------------
  // Room Zones — freeform continent AREAS, for rooming only
  // ---------------------------------------------------------
  let zonesActive = false;
  const worldModeBtn = document.getElementById("worldModeBtn");
  const zoneEls = {}; // id -> { poly, labelGroup, text, rect }

  // Pass 1: all zone polygons (tints), so a zone drawn later never sits
  // on top of an earlier zone's label.
  ROOM_ZONES.forEach((zone) => {
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", pointsToAttr(zone.polygon));
    poly.setAttribute("fill", zone.color);
    poly.setAttribute("fill-opacity", "0.32");
    poly.setAttribute("stroke", zone.color);
    poly.setAttribute("stroke-opacity", "0.85");
    poly.setAttribute("stroke-width", "2");
    poly.style.pointerEvents = "none";
    zoneLayer.appendChild(poly);
    zoneEls[zone.id] = { poly, zone };
  });

  // Pass 2: all zone labels, appended after every polygon so they're
  // always visually on top, regardless of zone order.
  ROOM_ZONES.forEach((zone) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.style.pointerEvents = "none";
    g.style.cursor = "grab";
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("rx", 8);
    rect.setAttribute("fill", "rgba(11,14,19,0.75)");
    rect.setAttribute("stroke", zone.color);
    rect.setAttribute("stroke-opacity", "0.8");
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("font-family", '"Cormorant Garamond", serif');
    text.setAttribute("font-size", "28");
    text.setAttribute("font-weight", "700");
    text.setAttribute("letter-spacing", "2");
    text.setAttribute("fill", "#f3ecda");
    text.textContent = zone.continent.toUpperCase() + (zone.needsRoomSplit ? " *" : "");
    g.appendChild(rect);
    g.appendChild(text);
    zoneLayer.appendChild(g);

    g.addEventListener("mousedown", (e) => {
      // Only draggable while this zone is selected AND we're in "Edit Label Position" sub-mode.
      if (editTarget !== "zone" || editZoneSubMode !== "label" || editSelectedId !== zone.id) return;
      e.stopPropagation();
      startLabelDrag(e, zone.id);
    });

    Object.assign(zoneEls[zone.id], { g, rect, text });
    positionZoneLabel(zone.id);
  });

  function positionZoneLabel(zoneId) {
    const els = zoneEls[zoneId];
    let cx, cy;
    if (els.zone.labelPos) {
      [cx, cy] = els.zone.labelPos;
    } else {
      const pts = els.poly.getAttribute("points").trim().split(" ").map((p) => p.split(",").map(Number));
      cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    }
    els.text.setAttribute("x", cx);
    els.text.setAttribute("y", cy);
    const bbox = els.text.getBBox();
    const padX = 14, padY = 8;
    els.rect.setAttribute("x", bbox.x - padX);
    els.rect.setAttribute("y", bbox.y - padY);
    els.rect.setAttribute("width", bbox.width + padX * 2);
    els.rect.setAttribute("height", bbox.height + padY * 2);
  }

  function setZoneLabelDraggable(zoneId, draggable) {
    Object.entries(zoneEls).forEach(([id, els]) => {
      const on = draggable && id === zoneId;
      els.g.style.pointerEvents = on ? "all" : "none";
      els.rect.setAttribute("stroke-width", on ? "2.5" : "1");
    });
  }

  function renderZonesVisibility() {
    zoneLayer.style.display = zonesActive ? "" : "none";
  }
  renderZonesVisibility();

  worldModeBtn.onclick = () => {
    zonesActive = !zonesActive;
    worldModeBtn.classList.toggle("active", zonesActive);
    renderZonesVisibility();
  };

  // ---------------------------------------------------------
  // Tooltip (hover)
  // ---------------------------------------------------------
  function showTooltip(loc) {
    if (editMode) return;
    tooltip.innerHTML = `
      <div class="tt-name">${loc.icon || ""} ${loc.name}</div>
      ${loc.subtitle ? `<div class="tt-sub">${loc.subtitle}${loc.date ? " · " + loc.date : ""}</div>` : ""}
    `;
    tooltip.classList.remove("hidden");
    hotspotEls[loc.id].classList.add("hovered");
  }
  function positionTooltip(e) {
    tooltip.style.left = e.clientX + "px";
    tooltip.style.top = e.clientY + "px";
  }
  function hideTooltip() {
    tooltip.classList.add("hidden");
    Object.values(hotspotEls).forEach((el) => el.classList.remove("hovered"));
  }

  // ---------------------------------------------------------
  // Popup (click)
  // ---------------------------------------------------------
  const popupOverlay = document.getElementById("popupOverlay");
  function openPopup(loc) {
    document.getElementById("popupIcon").textContent = loc.icon || "";
    document.getElementById("popupName").textContent = loc.name;
    document.getElementById("popupSubtitle").textContent =
      [loc.subtitle, loc.date, loc.time].filter(Boolean).join(" · ");

    const metaBits = [];
    if (loc.capacity) metaBits.push(`<span>Capacity <b>${loc.capacity}</b></span>`);
    if (loc.dressCode) metaBits.push(`<span>Dress code <b>${loc.dressCode}</b></span>`);
    if (loc.food) metaBits.push(`<span>Food <b>${loc.food}</b></span>`);
    if (loc.music) metaBits.push(`<span>Music <b>${loc.music}</b></span>`);
    if (loc.roomRange) metaBits.push(`<span>Rooms <b>${loc.roomRange}</b></span>`);
    if (loc.roomCount) metaBits.push(`<span>Rooms <b>${loc.roomCount}</b></span>`);
    document.getElementById("popupMeta").innerHTML = metaBits.length
      ? metaBits.join("")
      : "";
    document.getElementById("popupMeta").style.display = metaBits.length ? "flex" : "none";

    document.getElementById("popupDescription").textContent = loc.description || "";

    const extra = document.getElementById("popupExtra");
    if (loc.category === "rooms") {
      const cityLine = loc.destinationCity
        ? `Destination name: ${loc.destinationCity}`
        : "Destination-city name not yet assigned.";
      const continentLine = loc.continent ? ` · ${loc.continent} zone` : "";
      extra.textContent = cityLine + continentLine;
    } else {
      extra.textContent = "";
    }

    popupOverlay.classList.remove("hidden");
  }
  document.getElementById("popupClose").onclick = () => popupOverlay.classList.add("hidden");
  popupOverlay.addEventListener("click", (e) => {
    if (e.target === popupOverlay) popupOverlay.classList.add("hidden");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !popupOverlay.classList.contains("hidden")) {
      popupOverlay.classList.add("hidden");
    }
  });

  // ---------------------------------------------------------
  // Search
  // ---------------------------------------------------------
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    Object.values(hotspotEls).forEach((el) => el.classList.remove("search-match"));
    if (!q) { searchResults.classList.add("hidden"); return; }

    const matches = LOCATIONS.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 8);
    if (!matches.length) {
      searchResults.innerHTML = `<div class="search-result-item">No matches</div>`;
      searchResults.classList.remove("hidden");
      return;
    }
    searchResults.innerHTML = matches.map((l) =>
      `<div class="search-result-item" data-id="${l.id}">
         <span>${l.icon || ""} ${l.name}</span>
         <span class="sr-cat">${l.category}</span>
       </div>`
    ).join("");
    searchResults.classList.remove("hidden");

    searchResults.querySelectorAll(".search-result-item[data-id]").forEach((el) => {
      el.addEventListener("click", () => {
        const loc = LOCATIONS.find((l) => l.id === el.dataset.id);
        goToLocation(loc);
        searchResults.classList.add("hidden");
        searchInput.value = loc.name;
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) searchResults.classList.add("hidden");
  });

  // Keyboard navigation for the search dropdown (↑ ↓ Enter Esc).
  // Purely additive — reuses the same click-to-select path.
  searchInput.addEventListener("keydown", (e) => {
    const items = [...searchResults.querySelectorAll(".search-result-item[data-id]")];
    if (searchResults.classList.contains("hidden") || !items.length) return;
    const current = searchResults.querySelector(".active-result");
    let idx = items.indexOf(current);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      idx = (idx + 1) % items.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      idx = (idx - 1 + items.length) % items.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      (current || items[0]).click();
      return;
    } else if (e.key === "Escape") {
      searchResults.classList.add("hidden");
      searchInput.blur();
      return;
    } else {
      return;
    }
    items.forEach((el) => el.classList.remove("active-result"));
    items[idx].classList.add("active-result");
    items[idx].scrollIntoView({ block: "nearest" });
  });

  function goToLocation(loc) {
    const cx = loc.polygon.reduce((s, p) => s + p[0], 0) / loc.polygon.length;
    const cy = loc.polygon.reduce((s, p) => s + p[1], 0) / loc.polygon.length;
    flyTo(cx, cy);
    hotspotEls[loc.id].classList.add("search-match");
    setTimeout(() => hotspotEls[loc.id].classList.remove("search-match"), 3500);
  }

  // ---------------------------------------------------------
  // Legend / category filters
  // ---------------------------------------------------------
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      const cat = chip.dataset.cat;
      const on = chip.classList.contains("active");
      Object.values(hotspotEls).forEach((el) => {
        if (el.dataset.category === cat) {
          el.style.display = on ? "" : "none";
        }
      });
    });
  });

  // ---------------------------------------------------------
  // Edit Mode — drag to reshape/shift, or redraw from scratch.
  // Works on either LOCATIONS (venues/rooms) or ROOM_ZONES (areas),
  // whichever was last activated via its topbar button.
  // ---------------------------------------------------------
  let editMode = false;
  let editTarget = "location"; // "location" | "zone"
  let editZoneSubMode = "area"; // "area" | "label" — only relevant when editTarget === "zone"
  let editLocationSubMode = "shape"; // "shape" | "entry" — only relevant when editTarget === "location"
  let workingPoints = [];   // the shape currently being edited (live, draggable)
  let tracingNew = false;   // true only while redrawing from scratch via clicks
  let editSelectedId = null;
  const editModeBtn = document.getElementById("editModeBtn");
  const editZonesBtn = document.getElementById("editZonesBtn");
  const editPanel = document.getElementById("editPanel");
  const editPanelTitle = document.getElementById("editPanelTitle");
  const editSelect = document.getElementById("editLocationSelect");
  const editRedrawBtn = document.getElementById("editRedrawBtn");
  const editOutput = document.getElementById("editOutput");
  const editZoneSubModeRow = document.getElementById("editZoneSubModeRow");
  const editSubAreaBtn = document.getElementById("editSubAreaBtn");
  const editSubLabelBtn = document.getElementById("editSubLabelBtn");
  const editLocationSubModeRow = document.getElementById("editLocationSubModeRow");
  const editSubShapeBtn = document.getElementById("editSubShapeBtn");
  const editSubEntryBtn = document.getElementById("editSubEntryBtn");
  const editLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  editLayer.id = "editLayer";
  overlay.appendChild(editLayer);

  function targetList() { return editTarget === "zone" ? ROOM_ZONES : LOCATIONS; }
  function targetLabel(item) { return editTarget === "zone" ? item.continent : item.name; }
  function targetEl(id) { return editTarget === "zone" ? zoneEls[id].poly : hotspotEls[id]; }

  function populateSelect() {
    editSelect.innerHTML = targetList().map((item) => `<option value="${item.id}">${targetLabel(item)}</option>`).join("");
    editSelectedId = targetList()[0].id;
  }

  editSelect.addEventListener("change", () => {
    editSelectedId = editSelect.value;
    if (editTarget === "zone" && editZoneSubMode === "label") {
      setZoneLabelDraggable(editSelectedId, true);
    } else {
      loadShapeForEditing(editSelectedId);
    }
  });

  function applyZoneSubMode() {
    editSubAreaBtn.classList.toggle("active", editZoneSubMode === "area");
    editSubLabelBtn.classList.toggle("active", editZoneSubMode === "label");
    if (editZoneSubMode === "area") {
      setZoneLabelDraggable(null, false);
      editRedrawBtn.style.display = "";
      loadShapeForEditing(editSelectedId);
    } else {
      // Label sub-mode: no shape/vertex editor at all, so nothing can cover
      // the label or get dragged by mistake — only the label itself moves.
      tracingNew = false;
      workingPoints = [];
      editLayer.innerHTML = "";
      editOutput.value = editSelectedId && zoneEls[editSelectedId].zone.labelPos
        ? JSON.stringify(zoneEls[editSelectedId].zone.labelPos)
        : "";
      editRedrawBtn.style.display = "none";
      setZoneLabelDraggable(editSelectedId, true);
    }
  }
  editSubAreaBtn.onclick = () => { editZoneSubMode = "area"; applyZoneSubMode(); };
  editSubLabelBtn.onclick = () => { editZoneSubMode = "label"; applyZoneSubMode(); };

  function openEditUI(target) {
    editTarget = target;
    editZoneSubMode = "area";
    editMode = true;
    editModeBtn.classList.toggle("active", target === "location");
    editZonesBtn.classList.toggle("active", target === "zone");
    editPanelTitle.textContent = target === "zone" ? "Edit Zones" : "Edit Mode";
    editZoneSubModeRow.classList.toggle("hidden", target !== "zone");
    document.getElementById("editHelpText").textContent = target === "zone"
      ? '"Edit Area" drags the gold dots to reshape, or drag inside to shift the whole area. "Edit Label Position" moves just the continent name — nothing else is clickable in that mode, so the label always responds to your drag.'
      : 'Drag the gold dots to reshape a corner. Drag inside the shape to move the whole thing. Use "Redraw From Scratch" only if you want to trace an entirely new outline.';
    editPanel.classList.remove("hidden");
    viewport.style.cursor = "default";
    overlay.style.pointerEvents = "all";
    overlay.classList.add("edit-active");
    if (target === "zone") {
      // Zones stay visible/interactive while editing them, regardless of the toggle.
      zonesActive = true;
      worldModeBtn.classList.add("active");
      renderZonesVisibility();
    }
    populateSelect();
    if (target === "zone") {
      applyZoneSubMode();
    } else {
      loadShapeForEditing(editSelectedId);
    }
  }

  function closeEditUI() {
    editMode = false;
    tracingNew = false;
    editModeBtn.classList.remove("active");
    editZonesBtn.classList.remove("active");
    editPanel.classList.add("hidden");
    viewport.style.cursor = "grab";
    overlay.style.pointerEvents = "none";
    overlay.classList.remove("edit-active");
    editLayer.innerHTML = "";
    editOutput.value = "";
    setZoneLabelDraggable(null, false);
  }

  editModeBtn.onclick = () => {
    if (editMode && editTarget === "location") closeEditUI();
    else { closeRoadEdit(); closeEntryEdit(); openEditUI("location"); }
  };
  editZonesBtn.onclick = () => {
    if (editMode && editTarget === "zone") closeEditUI();
    else { closeRoadEdit(); closeEntryEdit(); openEditUI("zone"); }
  };

  function loadShapeForEditing(id) {
    const el = targetEl(id);
    if (!el) return;
    tracingNew = false;
    workingPoints = el
      .getAttribute("points")
      .trim()
      .split(" ")
      .map((pair) => pair.split(",").map(Number));
    renderWorking();
  }

  function pushLiveToTarget() {
    if (workingPoints.length < 3) return;
    targetEl(editSelectedId).setAttribute("points", pointsToAttr(workingPoints));
    if (editTarget === "zone") positionZoneLabel(editSelectedId);
  }

  function renderWorking() {
    editLayer.innerHTML = "";
    if (!workingPoints.length) { editOutput.value = ""; return; }

    const shapeEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      tracingNew ? "polyline" : "polygon"
    );
    shapeEl.setAttribute("points", pointsToAttr(workingPoints));
    shapeEl.classList.add("edit-line");
    if (!tracingNew) {
      // Body of the shape: mousedown-drag here shifts the whole polygon.
      shapeEl.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        startShapeDrag(e);
      });
    }
    editLayer.appendChild(shapeEl);

    workingPoints.forEach((p, i) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", p[0]);
      c.setAttribute("cy", p[1]);
      c.setAttribute("r", 6);
      c.classList.add("edit-point");
      if (!tracingNew) {
        c.style.cursor = "grab";
        c.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          startVertexDrag(e, i);
        });
      }
      editLayer.appendChild(c);
    });

    editOutput.value = JSON.stringify(workingPoints);
    pushLiveToTarget();
  }

  function toSvgPoint(e) {
    const pt = overlay.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(overlay.getScreenCTM().inverse());
  }

  let dragInfo = null;
  function startVertexDrag(e, idx) {
    dragInfo = { type: "vertex", idx };
  }
  function startShapeDrag(e) {
    const p = toSvgPoint(e);
    dragInfo = { type: "shape", lastX: p.x, lastY: p.y };
  }
  function startLabelDrag(e, zoneId) {
    dragInfo = { type: "label", zoneId };
  }
  window.addEventListener("mousemove", (e) => {
    if (!dragInfo || !editMode) return;
    const p = toSvgPoint(e);
    if (dragInfo.type === "vertex") {
      workingPoints[dragInfo.idx] = [Math.round(p.x), Math.round(p.y)];
      renderWorking();
    } else if (dragInfo.type === "shape") {
      const dx = p.x - dragInfo.lastX, dy = p.y - dragInfo.lastY;
      workingPoints = workingPoints.map(([x, y]) => [Math.round(x + dx), Math.round(y + dy)]);
      dragInfo.lastX = p.x; dragInfo.lastY = p.y;
      renderWorking();
    } else if (dragInfo.type === "label") {
      const zone = ROOM_ZONES.find((z) => z.id === dragInfo.zoneId);
      zone.labelPos = [Math.round(p.x), Math.round(p.y)];
      positionZoneLabel(dragInfo.zoneId);
      editOutput.value = JSON.stringify(zone.labelPos);
    }
  });
  window.addEventListener("mouseup", () => { dragInfo = null; });

  // Redraw from scratch: click points on empty map to build a brand new outline.
  editRedrawBtn.onclick = () => {
    tracingNew = true;
    workingPoints = [];
    editLayer.innerHTML = "";
    editOutput.value = "";
  };

  overlay.addEventListener("click", (e) => {
    if (!editMode || !tracingNew) return;
    const p = toSvgPoint(e);
    workingPoints.push([Math.round(p.x), Math.round(p.y)]);
    renderWorking();
  });

  document.getElementById("editFinishBtn").onclick = () => {
    if (tracingNew) {
      if (workingPoints.length < 3) return;
      tracingNew = false;
      renderWorking(); // switches rendering to editable polygon + handles, commits live
    }
  };
  document.getElementById("editClearBtn").onclick = () => {
    if (editTarget === "zone" && editZoneSubMode === "label") {
      zoneEls[editSelectedId].zone.labelPos = null; // back to auto-centered
      positionZoneLabel(editSelectedId);
      editOutput.value = "";
    } else {
      loadShapeForEditing(editSelectedId);
    }
  };
  document.getElementById("editCopyBtn").onclick = () => {
    if (editTarget === "zone" && editZoneSubMode === "label") {
      const pos = zoneEls[editSelectedId].zone.labelPos;
      if (!pos) return;
      navigator.clipboard?.writeText(JSON.stringify(pos)).catch(() => {});
    } else {
      if (!workingPoints.length) return;
      navigator.clipboard?.writeText(JSON.stringify(workingPoints)).catch(() => {});
    }
    editOutput.select();
  };

  document.getElementById("editExportAllBtn").onclick = () => {
    // Reads whatever is currently on the map right now for every item in the
    // CURRENT edit target (locations or zones) — captures any live edits made
    // earlier in this session even if you never clicked Copy JSON for them.
    const all = {};
    targetList().forEach((item) => {
      const el = targetEl(item.id);
      const pts = el.getAttribute("points")
        .trim()
        .split(" ")
        .map((pair) => pair.split(",").map(Number));
      all[item.id] = editTarget === "zone" ? { polygon: pts, labelPos: item.labelPos } : pts;
    });
    const json = JSON.stringify(all, null, 2);
    editOutput.value = json;
    navigator.clipboard?.writeText(json).catch(() => {});
    editOutput.select();
  };

  // ---------------------------------------------------------
  // Route Navigation (Layer 5) — animated flight-path between
  // a room and a destination, fitting the view to both.
  // ---------------------------------------------------------
  const navigateBtn = document.getElementById("navigateBtn");
  const navPanel = document.getElementById("navPanel");
  const navFromSelect = document.getElementById("navFromSelect");
  const navToSelect = document.getElementById("navToSelect");

  const navRooms = LOCATIONS.filter((l) => l.category === "rooms");
  // Hidden from "Take Me To" — still exist as clickable map locations,
  // just not offered as navigation destinations.
  const NAV_EXCLUDED_IDS = ["sb1", "main-house", "fountain-central", "fountain-c15", "pool-lower"];
  const navDestinations = LOCATIONS.filter((l) => l.category !== "rooms" && !NAV_EXCLUDED_IDS.includes(l.id));
  navFromSelect.innerHTML = navRooms.map((l) => `<option value="${l.id}">${l.name}${l.destinationCity ? " — " + l.destinationCity : ""}</option>`).join("");
  navToSelect.innerHTML = navDestinations.map((l) => `<option value="${l.id}">${l.icon || ""} ${l.name}</option>`).join("");
  // Default destination to the wedding venue — the natural "take me there".
  const weddingOption = navDestinations.find((l) => l.id === "palace-de-shaan");
  if (weddingOption) navToSelect.value = weddingOption.id;

  navigateBtn.onclick = () => {
    navPanel.classList.toggle("hidden");
  };

  function polygonCentroid(polygon) {
    const cx = polygon.reduce((s, p) => s + p[0], 0) / polygon.length;
    const cy = polygon.reduce((s, p) => s + p[1], 0) / polygon.length;
    return [cx, cy];
  }

  function fitBounds(points) {
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const pad = 140;
    const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
    const minX = Math.min(...xs) - pad, maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad, maxY = Math.max(...ys) + pad;
    const w = maxX - minX, h = maxY - minY;
    const scale = clampScale(Math.min(vw / w, vh / h));
    view.scale = scale;
    view.x = vw / 2 - (minX + maxX) / 2 * scale;
    view.y = vh / 2 - (minY + maxY) / 2 * scale;
    applyTransform();
  }

  // ---- Road-network pathfinding (Dijkstra over ROAD_NODES/ROAD_EDGES) ----
  function buildRoadAdjacency() {
    const adj = {};
    ROAD_NODES.forEach((n) => { adj[n.id] = []; });
    ROAD_EDGES.forEach(([a, b]) => {
      const na = ROAD_NODES.find((n) => n.id === a);
      const nb = ROAD_NODES.find((n) => n.id === b);
      if (!na || !nb) return;
      const dist = Math.hypot(na.x - nb.x, na.y - nb.y);
      adj[a].push({ to: b, dist });
      adj[b].push({ to: a, dist });
    });
    return adj;
  }

  function nearestRoadNode(x, y) {
    let best = null, bestDist = Infinity;
    ROAD_NODES.forEach((n) => {
      const d = Math.hypot(n.x - x, n.y - y);
      if (d < bestDist) { bestDist = d; best = n; }
    });
    return best;
  }

  function dijkstra(startId, endId) {
    const adj = buildRoadAdjacency();
    const dist = {}, prev = {}, visited = new Set();
    ROAD_NODES.forEach((n) => { dist[n.id] = Infinity; });
    dist[startId] = 0;
    const queue = new Set(ROAD_NODES.map((n) => n.id));
    while (queue.size) {
      let u = null, uDist = Infinity;
      queue.forEach((id) => { if (dist[id] < uDist) { uDist = dist[id]; u = id; } });
      if (u === null) break;
      queue.delete(u);
      if (u === endId) break;
      (adj[u] || []).forEach(({ to, dist: d }) => {
        const alt = dist[u] + d;
        if (alt < dist[to]) { dist[to] = alt; prev[to] = u; }
      });
    }
    if (dist[endId] === Infinity) return null;
    const path = [endId];
    let cur = endId;
    while (cur !== startId) {
      cur = prev[cur];
      if (cur === undefined) return null;
      path.unshift(cur);
    }
    return path;
  }

  function routeAnchor(loc) {
    return loc.entryPoint || polygonCentroid(loc.polygon);
  }

  function getRoutePoints(fromId, toId) {
    const a = LOCATIONS.find((l) => l.id === fromId);
    const b = LOCATIONS.find((l) => l.id === toId);
    if (!a || !b) return null;
    const start = routeAnchor(a);
    const end = routeAnchor(b);
    const startNode = nearestRoadNode(...start);
    const endNode = nearestRoadNode(...end);
    if (!startNode || !endNode) return [start, end];
    const nodePath = dijkstra(startNode.id, endNode.id);
    if (!nodePath) return [start, end]; // network not fully connected yet — fall back to direct line
    const roadPoints = nodePath.map((id) => {
      const n = ROAD_NODES.find((rn) => rn.id === id);
      return [n.x, n.y];
    });
    return [start, ...roadPoints, end];
  }

  // Rough pixel-to-metre scale for time estimates. Calibrated by eye against
  // a typical cottage frontage (~6m) matching its polygon width in this map's
  // coordinate space — not a surveyed measurement. Adjust this one number if
  // you get an actual site distance to check it against.
  // Calibrated against the total-station survey (aayush_layout.pdf, 1:500
  // scale on a real A1 sheet — 841x594mm, giving ~19 real px/metre on that
  // drawing). Cross-referenced against two spans on THIS map (Reception to
  // Palace de Shaan, and leftmost-to-rightmost cottage cluster) to derive
  // this map's own px-per-metre. The two cross-references gave 5.6 and 7.8;
  // this is their average. Still an estimate — if you have one measured
  // real-world distance on the property, send it and this can be tightened.
  const PX_PER_METER = 6.7;
  const WALK_SPEED_MPS = 1.2; // relaxed resort walking pace

  function drawRoute(fromId, toId) {
    routeLayer.innerHTML = "";
    const points = getRoutePoints(fromId, toId);
    if (!points) return;

    const d = "M " + points.map((p) => `${p[0]},${p[1]}`).join(" L ");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#c9a34d");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("stroke-dasharray", "3 11");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    path.classList.add("route-path");
    routeLayer.appendChild(path);

    const [x1, y1] = points[0], [x2, y2] = points[points.length - 1];
    [[x1, y1, "#c9a34d"], [x2, y2, "#c1272d"]].forEach(([x, y, color]) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", x);
      c.setAttribute("cy", y);
      c.setAttribute("r", 7);
      c.setAttribute("fill", color);
      c.setAttribute("stroke", "#f3ecda");
      c.setAttribute("stroke-width", "2");
      routeLayer.appendChild(c);
    });

    const plane = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Simple dart/plane silhouette pointing along +x; animateMotion's
    // rotate="auto" turns it to match travel direction along the path.
    plane.setAttribute("d", "M 13,0 L -9,7.5 L -3.5,0 L -9,-7.5 Z");
    plane.setAttribute("fill", "#ffffff");
    plane.setAttribute("stroke", "#0b0e13");
    plane.setAttribute("stroke-width", "1");
    plane.setAttribute("stroke-linejoin", "round");
    plane.style.filter = "drop-shadow(0 1px 3px rgba(0,0,0,0.6))";
    const totalLen = points.reduce((sum, p, i) => i === 0 ? 0 : sum + Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]), 0);
    const animateMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
    animateMotion.setAttribute("dur", Math.max(2, Math.min(8, totalLen / 220)) + "s");
    animateMotion.setAttribute("repeatCount", "indefinite");
    animateMotion.setAttribute("rotate", "auto");
    animateMotion.setAttribute("path", d);
    plane.appendChild(animateMotion);
    routeLayer.appendChild(plane);

    const meters = Math.round(totalLen / PX_PER_METER);
    const minutes = Math.max(1, Math.round(meters / WALK_SPEED_MPS / 60));
    document.getElementById("navEta").textContent = `≈ ${minutes} min walk (~${meters} m) — estimate`;

    fitBounds(points);
  }

  document.getElementById("navGoBtn").onclick = () => drawRoute(navFromSelect.value, navToSelect.value);
  document.getElementById("navClearBtn").onclick = () => {
    routeLayer.innerHTML = "";
    document.getElementById("navEta").textContent = "";
  };

  // ---------------------------------------------------------
  // Edit Roads — click to place nodes, click-click to connect,
  // drag to move, for refining the pathfinding network.
  // ---------------------------------------------------------
  let roadEditMode = false;
  let roadSelectedNode = null;
  let roadPointerDown = null; // { id, startX, startY, moved }
  const editRoadsBtn = document.getElementById("editRoadsBtn");
  const roadPanel = document.getElementById("roadPanel");
  const roadOutput = document.getElementById("roadOutput");
  const roadEditLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  roadEditLayer.id = "roadEditLayer";
  overlay.appendChild(roadEditLayer);

  function renderRoadGraph() {
    roadEditLayer.innerHTML = "";
    ROAD_EDGES.forEach(([a, b]) => {
      const na = ROAD_NODES.find((n) => n.id === a), nb = ROAD_NODES.find((n) => n.id === b);
      if (!na || !nb) return;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", na.x); line.setAttribute("y1", na.y);
      line.setAttribute("x2", nb.x); line.setAttribute("y2", nb.y);
      line.classList.add("road-edge");
      roadEditLayer.appendChild(line);
    });
    ROAD_NODES.forEach((n) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", n.x); c.setAttribute("cy", n.y); c.setAttribute("r", 8);
      c.classList.add("road-node");
      if (roadSelectedNode === n.id) c.classList.add("selected");
      c.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        const p = toSvgPoint(e);
        roadPointerDown = { id: n.id, startX: p.x, startY: p.y, moved: false };
      });
      roadEditLayer.appendChild(c);
    });
  }

  function handleRoadNodeClick(id) {
    if (roadSelectedNode === null) {
      roadSelectedNode = id;
    } else if (roadSelectedNode === id) {
      roadSelectedNode = null;
    } else {
      const a = roadSelectedNode, b = id;
      const idx = ROAD_EDGES.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
      if (idx >= 0) ROAD_EDGES.splice(idx, 1);
      else ROAD_EDGES.push([a, b]);
      roadSelectedNode = id; // stays selected so you can keep chaining clicks along a road
    }
    renderRoadGraph();
    updateRoadOutput();
  }

  function updateRoadOutput() {
    if (!roadSelectedNode) { roadOutput.value = ""; return; }
    const n = ROAD_NODES.find((x) => x.id === roadSelectedNode);
    roadOutput.value = n ? JSON.stringify(n) : "";
  }

  window.addEventListener("mousemove", (e) => {
    if (!roadEditMode || !roadPointerDown) return;
    const p = toSvgPoint(e);
    const dx = p.x - roadPointerDown.startX, dy = p.y - roadPointerDown.startY;
    if (Math.hypot(dx, dy) > 4) {
      roadPointerDown.moved = true;
      const node = ROAD_NODES.find((n) => n.id === roadPointerDown.id);
      if (node) { node.x = Math.round(p.x); node.y = Math.round(p.y); }
      renderRoadGraph();
    }
  });
  window.addEventListener("mouseup", () => {
    if (!roadEditMode || !roadPointerDown) return;
    if (!roadPointerDown.moved) handleRoadNodeClick(roadPointerDown.id);
    roadPointerDown = null;
  });

  overlay.addEventListener("click", (e) => {
    if (!roadEditMode) return;
    if (e.target.classList && e.target.classList.contains("road-node")) return; // handled via mousedown/up above
    const p = toSvgPoint(e);
    const nextNum = Math.max(0, ...ROAD_NODES.map((n) => parseInt(n.id.slice(1), 10) || 0)) + 1;
    const newId = "r" + nextNum;
    ROAD_NODES.push({ id: newId, x: Math.round(p.x), y: Math.round(p.y) });
    if (roadSelectedNode) ROAD_EDGES.push([roadSelectedNode, newId]); // auto-chain from the last node you touched
    roadSelectedNode = newId;
    renderRoadGraph();
    updateRoadOutput();
  });

  function openRoadEdit() {
    roadEditMode = true;
    editRoadsBtn.classList.add("active");
    roadPanel.classList.remove("hidden");
    overlay.style.pointerEvents = "all";
    overlay.classList.add("edit-active");
    viewport.style.cursor = "default";
    roadSelectedNode = null;
    renderRoadGraph();
  }
  function closeRoadEdit() {
    if (!roadEditMode) return;
    roadEditMode = false;
    editRoadsBtn.classList.remove("active");
    roadPanel.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    overlay.classList.remove("edit-active");
    viewport.style.cursor = "grab";
    roadSelectedNode = null;
    roadEditLayer.innerHTML = "";
  }
  editRoadsBtn.onclick = () => {
    if (roadEditMode) { closeRoadEdit(); return; }
    closeEditUI();
    closeEntryEdit();
    openRoadEdit();
  };

  document.getElementById("roadDeleteBtn").onclick = () => {
    if (!roadSelectedNode) return;
    const id = roadSelectedNode;
    const idx = ROAD_NODES.findIndex((n) => n.id === id);
    if (idx >= 0) ROAD_NODES.splice(idx, 1);
    for (let i = ROAD_EDGES.length - 1; i >= 0; i--) {
      if (ROAD_EDGES[i][0] === id || ROAD_EDGES[i][1] === id) ROAD_EDGES.splice(i, 1);
    }
    roadSelectedNode = null;
    renderRoadGraph();
    updateRoadOutput();
  };

  document.getElementById("roadExportBtn").onclick = () => {
    const json = JSON.stringify({ nodes: ROAD_NODES, edges: ROAD_EDGES }, null, 2);
    roadOutput.value = json;
    navigator.clipboard?.writeText(json).catch(() => {});
    roadOutput.select();
  };

  // ---------------------------------------------------------
  // Entry Points — where each destination's route actually
  // connects, instead of always the polygon centroid.
  // ---------------------------------------------------------
  let entryEditMode = false;
  let entrySelectedId = null;
  let entryDragging = false;
  const entryPointsBtn = document.getElementById("entryPointsBtn");
  const entryPanel = document.getElementById("entryPanel");
  const entryLocationSelect = document.getElementById("entryLocationSelect");
  const entryOutput = document.getElementById("entryOutput");
  const entryEditLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
  entryEditLayer.id = "entryEditLayer";
  overlay.appendChild(entryEditLayer);

  entryLocationSelect.innerHTML = navDestinations.map((l) => `<option value="${l.id}">${l.icon || ""} ${l.name}</option>`).join("");

  function renderEntryEditor() {
    entryEditLayer.innerHTML = "";
    if (!entrySelectedId) return;

    // Ghost road-network dots — click one to snap the entry point exactly onto it.
    ROAD_NODES.forEach((n) => {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", n.x);
      c.setAttribute("cy", n.y);
      c.setAttribute("r", 5);
      c.classList.add("road-node-ghost");
      c.addEventListener("click", (e) => {
        e.stopPropagation();
        setEntryPoint(entrySelectedId, [n.x, n.y]);
      });
      entryEditLayer.appendChild(c);
    });

    const loc = LOCATIONS.find((l) => l.id === entrySelectedId);
    const pt = routeAnchor(loc);
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    marker.setAttribute("cx", pt[0]);
    marker.setAttribute("cy", pt[1]);
    marker.setAttribute("r", 9);
    marker.classList.add("entry-marker");
    marker.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      entryDragging = true;
    });
    entryEditLayer.appendChild(marker);

    entryOutput.value = loc.entryPoint ? JSON.stringify(loc.entryPoint) : "(using auto center — click the map to set one)";
  }

  function setEntryPoint(id, pt) {
    const loc = LOCATIONS.find((l) => l.id === id);
    if (!loc) return;
    loc.entryPoint = pt;
    renderEntryEditor();
  }

  entryLocationSelect.addEventListener("change", () => {
    entrySelectedId = entryLocationSelect.value;
    renderEntryEditor();
  });

  window.addEventListener("mousemove", (e) => {
    if (!entryEditMode || !entryDragging || !entrySelectedId) return;
    const p = toSvgPoint(e);
    setEntryPoint(entrySelectedId, [Math.round(p.x), Math.round(p.y)]);
  });
  window.addEventListener("mouseup", () => { entryDragging = false; });

  overlay.addEventListener("click", (e) => {
    if (!entryEditMode || !entrySelectedId) return;
    if (e.target.classList && (e.target.classList.contains("road-node-ghost") || e.target.classList.contains("entry-marker"))) return;
    const p = toSvgPoint(e);
    setEntryPoint(entrySelectedId, [Math.round(p.x), Math.round(p.y)]);
  });

  document.getElementById("entryResetBtn").onclick = () => {
    if (!entrySelectedId) return;
    const loc = LOCATIONS.find((l) => l.id === entrySelectedId);
    loc.entryPoint = null;
    renderEntryEditor();
  };

  document.getElementById("entryExportBtn").onclick = () => {
    const all = {};
    navDestinations.forEach((l) => {
      const loc = LOCATIONS.find((x) => x.id === l.id);
      if (loc.entryPoint) all[l.id] = loc.entryPoint;
    });
    const json = JSON.stringify(all, null, 2);
    entryOutput.value = json;
    navigator.clipboard?.writeText(json).catch(() => {});
    entryOutput.select();
  };

  function openEntryEdit() {
    entryEditMode = true;
    entryPointsBtn.classList.add("active");
    entryPanel.classList.remove("hidden");
    overlay.style.pointerEvents = "all";
    overlay.classList.add("edit-active");
    viewport.style.cursor = "default";
    if (!entrySelectedId) entrySelectedId = navDestinations[0]?.id || null;
    entryLocationSelect.value = entrySelectedId;
    renderEntryEditor();
  }
  function closeEntryEdit() {
    if (!entryEditMode) return;
    entryEditMode = false;
    entryPointsBtn.classList.remove("active");
    entryPanel.classList.add("hidden");
    overlay.style.pointerEvents = "none";
    overlay.classList.remove("edit-active");
    viewport.style.cursor = "grab";
    entryEditLayer.innerHTML = "";
  }
  entryPointsBtn.onclick = () => {
    if (entryEditMode) { closeEntryEdit(); return; }
    closeEditUI();
    closeRoadEdit();
    openEntryEdit();
  };

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------
  mapImage.addEventListener("load", fitToScreen);
  if (mapImage.complete) fitToScreen();
})();
