
/* Alexia Asgari – portfolio demo (HTML/CSS/JS)
   - Category panel: 3D teetering text (CSS 3D transforms + rAF)
   - Filtering: data-driven projects list
   - Work grid: 3-column, hover overlay title + year
   - Hero carousel: featured projects
*/

(() => {
  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------
     Top menu (shared/nav.js)
  ------------------------------ */
  const NAMEBAR = document.getElementById("nameBar");

  // shared/nav.js injects and manages the menu. This stub lets the rest of this file
  // re-sync placement after sticky header transitions.
  function syncMenuPlacement() {
    if (typeof window.__aaSyncMenuPlacement === "function") window.__aaSyncMenuPlacement();
  }

  /* -----------------------------
     Shared sticky header offsets (all pages)
     - Project pages use BootstrapMade's .sticky-content blocks
       (position: sticky). We offset them below the shared namebar/menu.
  ------------------------------ */

  function getNamebarHeight() {
    const el = NAMEBAR || document.getElementById("nameBar");
    const h = el?.offsetHeight || 0;
    return Number.isFinite(h) ? h : 0;
  }

  function getMenuDropHeight() {
    const isMenuOpen = !!document.body && document.body.classList.contains("menu-open");
    const menuDropEl = document.getElementById("menuDrop");
    const h = isMenuOpen && menuDropEl ? menuDropEl.getBoundingClientRect().height : 0;
    return Number.isFinite(h) ? h : 0;
  }

  function getStickyOffset() {
    // Used for scroll alignment (what gets covered at the top).
    // Includes the menu bar height only when the menu is open.
    return getNamebarHeight() + getMenuDropHeight();
  }

  function syncStickyCssVars() {
    // CSS uses --namebar-height + --menu-offset for sticky positioning.
    // Guard: if the shared nav hasn"t injected yet, keep the CSS fallback value.
    const h = getNamebarHeight();
    if (h > 0) document.documentElement.style.setProperty("--namebar-height", `${h}px`);
  }

  function syncMenuOffsetCssVar() {
    // Used by CSS to offset sticky elements when the menu drop is open.
    const h = getMenuDropHeight();
    document.documentElement.style.setProperty("--menu-offset", `${h}px`);
  }

  function syncSharedHeaderVars() {
    syncStickyCssVars();
    syncMenuOffsetCssVar();
  }

  // The rest of this script powers the portfolio landing page.
  // If we're on a simple page (about/contact), bail out cleanly.
  const HERO = document.getElementById("top");
  const WORK = document.getElementById("work");


  const categoryList = document.getElementById("categoryList");
  const categoryListInline = document.getElementById("categoryListInline");
  const projectGrid = document.getElementById("projectGrid");
  const selectedCategoryLabel = document.getElementById("selectedCategoryLabel");
  const categoryPanel = document.getElementById("categoryPanel");

  const carouselTrack = document.getElementById("carouselTrack");
  const carouselDots = document.getElementById("carouselDots");

  const isPortfolioPage =
    HERO && WORK && categoryList && projectGrid && selectedCategoryLabel &&
    carouselTrack && carouselDots;

  // Keep shared sticky offsets correct on *all* pages that include this script
  // (project pages need this so .sticky-content never tucks under the header).
  syncSharedHeaderVars();
  window.addEventListener("load", syncSharedHeaderVars, { once: true });
  window.addEventListener("resize", syncSharedHeaderVars);

  // Watch for menu open/close and header tighten (body classes are toggled by shared/nav.js).
  // We only react when the specific state changes to avoid extra work.
  let __aaLastMenuOpen = !!document.body && document.body.classList.contains("menu-open");
  let __aaLastScrolled = !!document.body && document.body.classList.contains("is-scrolled");

  function __aaOnBodyClassChange() {
    if (!document.body) return;

    const menuOpen = document.body.classList.contains("menu-open");
    const scrolled = document.body.classList.contains("is-scrolled");

    if (menuOpen != __aaLastMenuOpen) {
      __aaLastMenuOpen = menuOpen;
      syncMenuOffsetCssVar();
      // Menu height animates; resync once it has settled.
      window.setTimeout(syncMenuOffsetCssVar, 560);
    }

    // On the portfolio page, this script already manages the is-scrolled toggle
    // and calls syncStickyCssVars() with the correct timing.
    if (!isPortfolioPage && scrolled != __aaLastScrolled) {
      __aaLastScrolled = scrolled;
      syncStickyCssVars();
      window.setTimeout(syncStickyCssVars, 560);
      window.setTimeout(syncMenuPlacement, 560);
    }
  }

  if (document.body && window.MutationObserver) {
    const __aaBodyClassObserver = new MutationObserver(__aaOnBodyClassChange);
    __aaBodyClassObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });
  }

  if (!isPortfolioPage) return;

  // Normalise category strings so tiny punctuation differences (hyphen/dash/spacing)
  // never cause inconsistent filtering.
  const normalizeCategory = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[\s\u2010-\u2015\-]+/g, "")
      .trim();

  const CATEGORIES = [
    { id: "Research-Driven", label: "Research-Driven" },
    { id: "Non-Predictive Robotics", label: "Non-Predictive Robotics" },
    { id: "Computational Design", label: "Computational Design" },
    { id: "Wearables", label: "Wearables" },
    { id: "Virtual Reality", label: "Virtual Reality" },
    { id: "Architectural Scale", label: "Architectural Scale" },
    { id: "Material Exploration", label: "Material Exploration" },
    { id: "Tangible", label: "Tangible" },
    { id: "Digital", label: "Digital" },
    //{ id: "Artwork", label: "Artwork" },
    { id: "all", label: "View All Work", isViewAll: true }
  ];


  const PROJECTS = [
    {
      slug: "Fragments-Toward-Perception",
      title: "Fragments Toward Perception",
      year: 2024,
      link: "projects/Fragments-Toward-Perception/Fragments-Toward-Perception.html",
      thumbnail: "projects/Fragments-Toward-Perception/images/thumbnail.jpg",
      featuredImage: "projects/Fragments-Toward-Perception/images/banner.gif",
      featured: true,
      categories: ["Virtual Reality", "Digital", "Computational Design"]
    },
    {
      slug: "Robotic-Dialogue",
      title: "Robotic Dialogue",
      year: 2022,
      link: "projects/Robotic-Dialogue/Robotic-Dialogue.html",
      thumbnail: "projects/Robotic-Dialogue/images/thumbnail.jpg",
      featuredImage: "projects/Robotic-Dialogue/images/banner.jpg",
      featured: true,
      categories: ["Research-Driven", "Non-Predictive Robotics", "Material Exploration"]
    },

    {
  slug: "Deep-Communication",
  title: "Deep Communication",
  year: 2023,
  link: "projects/Deep-Communication/Deep-Communication.html",
  thumbnail: "projects/Deep-Communication/images/thumbnail.gif",
  featured: false,
  categories: ["Computational Design", "Wearables", "Tangible", "Material Exploration"]
},


    {
      slug: "Operating-Systems",
      title: "Operating Systems",
      year: 2024,
      link: "projects/Operating-Systems/Operating-Systems.html",
      thumbnail: "projects/Operating-Systems/images/thumbnail.jpg",
      featured: false,
      categories: ["Tangible", "Non-Predictive Robotics"]
    },
    {
      slug: "Homunculus-Architecture",
      title: "Homunculus Architecture",
      year: 2023,
      link: "projects/Homunculus-Architecture/Homunculus-Architecture.html",
      thumbnail: "projects/Homunculus-Architecture/images/thumbnail.jpg",
      featured: false,
      categories: ["Computational Design", "Wearables", "Tangible", "Digital"]
    },
        {
  slug: "Agency-Perception-in-Additive-Manufacturing",
  title: "Agency Perception in Additive Manufacturing",
  year: 2023,
  link: "projects/Agency-Perception-in-Additive-Manufacturing/Agency-Perception-in-Additive-Manufacturing.html",
  thumbnail: "projects/Agency-Perception-in-Additive-Manufacturing/images/thumbnail.jpg",
  featured: false,
  categories: ["Research-Driven", "Non-Predictive Robotics"]
},

    {
      slug: "Cooling-Brick",
      title: "Cooling Brick",
      year: 2022,
      link: "projects/Cooling-Brick/Cooling-Brick.html",
      thumbnail: "projects/Cooling-Brick/images/thumbnail.jpg",
      featured: false,
      categories: ["Material Exploration", "Architectural Scale"]
    },
    {
      slug: "FaceX",
      title: "FaceX",
      year: 2020,
      link: "projects/FaceX/FaceX.html",
      thumbnail: "projects/FaceX/images/thumbnail.jpg",
      featuredImage: "projects/FaceX/images/banner.jpg",
      featured: false,
      categories: ["Computational Design", "Wearables"]
    },
    {
      slug: "Library-of-the-21st-Century",
      title: "Library of the 21st Century",
      year: 2021,
      link: "projects/Library-of-the-21st-Century/Library-of-the-21st-Century.html",
      thumbnail: "projects/Library-of-the-21st-Century/images/thumbnail.jpg",
      featured: false,
      categories: ["Architectural Scale", "Virtual Reality"]
    },
    {
      slug: "Pixel-Pet",
      title: "Pixel-Pet",
      year: 2022,
      link: "projects/Pixel-Pet/Pixel-Pet.html",
      thumbnail: "projects/Pixel-Pet/images/thumbnail.gif",
      featured: false,
      categories: ["Computational Design", "Digital"]
    },
    {
      slug: "Largo-di-Torre-Argentina",
      title: "Largo di Torre Argentina",
      year: 2020,
      link: "projects/Largo-di-Torre-Argentina/Largo-di-Torre-Argentina.html",
      thumbnail: "projects/Largo-di-Torre-Argentina/images/thumbnail.jpg",
      featured: false,
      categories: ["Architectural Scale"]
    },
    {
      slug: "Smile-Sync",
      title: "Smile Sync",
      year: 2020,
      link: "projects/Smile-Sync/Smile-Sync.html",
      thumbnail: "projects/Smile-Sync/images/thumbnail.jpg",
      featured: false,
      categories: ["Computational Design"]
    },
    {
      slug: "Look",
      title: "Look",
      year: 2020,
      link: "projects/Look/Look.html",
      thumbnail: "projects/Look/images/thumbnail.jpg",
      featured: false,
      categories: ["Computational Design"]
    },
    {
      slug: "Memory",
      title: "Memory",
      year: 2020,
      link: "projects/Memory/Memory.html",
      thumbnail: "projects/Memory/images/thumbnail.jpg",
      featured: false,
      categories: ["Architectural Scale"]
    },
    {
      slug: "School-for-Sound",
      title: "School for Sound",
      year: 2019,
      link: "projects/School-for-Sound/School-for-Sound.html",
      thumbnail: "projects/School-for-Sound/images/thumbnail.jpg",
      featured: false,
      categories: ["Architectural Scale"]
    },
    {
      slug: "Non-Predictive-SLA",
      title: "Non-Predictive SLA",
      year: 2019,
      link: "projects/Non-Predictive-SLA/Non-Predictive-SLA.html",
      thumbnail: "projects/Non-Predictive-SLA/images/thumbnail.jpg",
      featured: false,
      categories: ["Research-Driven", "Non-Predictive Robotics"]
    },
    {
      slug: "BodyScapes",
      title: "BodyScapes",
      year: 2021,
      link: "projects/BodyScapes/BodyScapes.html",
      thumbnail: "projects/BodyScapes/images/thumbnail.jpg",
      featured: false,
      categories: ["Computational Design", "Artwork"]
    },
    {
      slug: "Knots",
      title: "Knots",
      year: 2019,
      link: "projects/Knots/Knots.html",
      thumbnail: "projects/Knots/images/thumbnail.jpg",
      featured: false,
      categories: ["Material Exploration", "Artwork"]
    },
    {
      slug: "Woven",
      title: "Woven",
      year: 2018,
      link: "projects/Woven/Woven.html",
      thumbnail: "projects/Woven/images/thumbnail.jpg",
      featured: false,
      categories: ["Material Exploration", "Artwork"]
    }
  ];

  /* -----------------------------
     Category panel (DOM)
  ------------------------------ */
  // Keep side + inline category buttons separate:
  // - Side buttons teeter in 3D
  // - Inline buttons are stationary (shown on very narrow layouts)
  const catButtonsSide = new Map();   // id -> element (right floating panel)
  const catButtonsInline = new Map(); // id -> element (inline mobile list)

  function buildCategoryList(listEl, map) {
    if (!listEl) return;
    listEl.innerHTML = "";
    map.clear();

    for (const c of CATEGORIES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `cat-item${c.isViewAll ? " view-all" : ""}`;
      btn.textContent = c.label;
      btn.dataset.cat = c.id;
      btn.setAttribute("aria-label", `Filter: ${c.label}`);
      listEl.appendChild(btn);
      map.set(c.id, btn);
    }
  }

  function buildCategoryPanel() {
    buildCategoryList(categoryList, catButtonsSide);
    buildCategoryList(categoryListInline, catButtonsInline);
  }

  /* -----------------------------
     Work grid (DOM)
  ------------------------------ */
  function makeProjectCard(project) {
    const a = document.createElement("a");
    a.className = "project-card";
    a.href = project.link;

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = project.thumbnail;
    img.alt = `${project.title} thumbnail`;

    const overlay = document.createElement("div");
    overlay.className = "project-overlay";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = project.title;

    const year = document.createElement("div");
    year.className = "year";
    year.textContent = String(project.year);

    overlay.appendChild(title);
    overlay.appendChild(year);

    a.appendChild(img);
    a.appendChild(overlay);

    return a;
  }

  let gridHasRenderedOnce = false;
  let gridRenderToken = 0;

  function renderGrid(activeCategoryId) {
    const token = ++gridRenderToken;

    const activeIsAll = !activeCategoryId || activeCategoryId === "all";
    const activeNorm = normalizeCategory(activeCategoryId);

    const filtered = activeIsAll
      ? PROJECTS
      : PROJECTS.filter((p) =>
          p.categories.some((c) => normalizeCategory(c) === activeNorm)
        );

    // Label (sticky at top-right of the work view)
    if (activeIsAll) {
      selectedCategoryLabel.textContent = "";
      selectedCategoryLabel.classList.add("is-hidden");
    } else {
      // Prefer the canonical label from CATEGORIES (keeps formatting consistent)
      const label = CATEGORIES.find((c) => c.id === activeCategoryId)?.label || activeCategoryId;
      selectedCategoryLabel.textContent = label;
      selectedCategoryLabel.classList.remove("is-hidden");
    }

    const paint = () => {
      projectGrid.innerHTML = "";
      for (const p of filtered) projectGrid.appendChild(makeProjectCard(p));
      // Keep the right-side categories aligned to the grid edge.
      syncCategoryPanelAlignment();
    };

    // Smoothly transition between filter states.
    if (prefersReducedMotion || !gridHasRenderedOnce) {
      projectGrid.classList.remove("is-fading");
      paint();
      gridHasRenderedOnce = true;
      return;
    }

    projectGrid.classList.add("is-fading");
    window.setTimeout(() => {
      if (token !== gridRenderToken) return;
      paint();
      // Force a reflow so the fade-in reliably triggers.
      void projectGrid.offsetHeight;
      projectGrid.classList.remove("is-fading");
    }, 260);

    gridHasRenderedOnce = true;
  }

    /* -----------------------------
     Hero carousel (image-only + dot navigation)
  ------------------------------ */
  const featuredProjects = PROJECTS.filter((p) => p.featured).slice(0, 6);
  let carouselIndex = 0;
  let carouselTimer = null;
  let dotButtons = [];

  function buildCarousel() {
    carouselTrack.innerHTML = "";
    carouselDots.innerHTML = "";
    dotButtons = [];

    featuredProjects.forEach((p, i) => {
      const slide = document.createElement("a");
      slide.href = p.link;
      slide.className = "carousel-slide" + (i === 0 ? " is-active" : "");
      slide.dataset.index = String(i);
      slide.setAttribute("aria-hidden", i === 0 ? "false" : "true");

      const img = document.createElement("img");
      // No visible titles/captions on the carousel — image only.
      img.src = p.featuredImage || p.thumbnail;
      img.alt = "";
      img.loading = i === 0 ? "eager" : "lazy";
      img.classList.remove("is-loaded");

      // Fade images in when they finish loading (prevents popping on slow connections)
      const markLoaded = () => img.classList.add("is-loaded");
      if (img.complete && img.naturalWidth > 0) {
        window.requestAnimationFrame(markLoaded);
      } else {
        img.addEventListener("load", markLoaded, { once: true });
      }


      // Fallback: if a featured banner is missing, show the thumbnail.
      img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied) return;
        img.dataset.fallbackApplied = "1";
        img.src = p.thumbnail;
      });

      slide.appendChild(img);
      carouselTrack.appendChild(slide);

      // Dots (bottom-left)
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot" + (i === 0 ? " is-active" : "");
      dot.dataset.index = String(i);
      dot.setAttribute("aria-label", `Go to featured slide ${i + 1}`);
      dot.setAttribute("aria-current", i === 0 ? "true" : "false");
      carouselDots.appendChild(dot);
      dotButtons.push(dot);
    });
  }

  function setCarouselIndex(nextIndex) {
    const slides = carouselTrack.querySelectorAll(".carousel-slide");
    if (!slides.length) return;

    carouselIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((s, i) => {
      const active = i === carouselIndex;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", active ? "false" : "true");
      // Ensure only the visible slide is clickable (fixes "all slides open same link").
      s.style.zIndex = active ? "2" : "1";
      s.style.pointerEvents = active ? "auto" : "none";
    });

    dotButtons.forEach((d, i) => {
      const active = i === carouselIndex;
      d.classList.toggle("is-active", active);
      d.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function prevSlide() {
    setCarouselIndex(carouselIndex - 1);
  }

  function nextSlide() {
    setCarouselIndex(carouselIndex + 1);
  }

  function startCarouselAuto() {
    if (prefersReducedMotion) return;
    stopCarouselAuto();
    carouselTimer = window.setInterval(() => nextSlide(), 6200);
  }
  function stopCarouselAuto() {
    if (carouselTimer) {
      window.clearInterval(carouselTimer);
      carouselTimer = null;
    }
  }

  function onDotNavClick(e) {
    const btn = e.target.closest("button[data-index]");
    if (!btn) return;
    const idx = Number(btn.dataset.index);
    if (!Number.isFinite(idx)) return;
    stopCarouselAuto();
    setCarouselIndex(idx);
    startCarouselAuto();
  }


  /* -----------------------------
     Carousel swipe / drag (pointer events)
     - Touch: swipe left/right
     - Desktop: click + drag
  ------------------------------ */
  function enableCarouselSwipe(viewportEl) {
    if (!viewportEl) return;

    // Avoid double-init.
    if (viewportEl.dataset.swipeEnabled) return;
    viewportEl.dataset.swipeEnabled = "1";

    const THRESHOLD_PX = 26;
    const VERTICAL_CANCEL_PX = 22;

    let activePointerId = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let startT = 0;
    let dragging = false;
    let suppressClickUntil = 0;

    function isDotNavTarget(target) {
      return !!(target && target.closest && target.closest(".carousel-dots"));
    }

    function onPointerDown(e) {
      if (isDotNavTarget(e.target)) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      startT = performance.now();
      dragging = false;

      stopCarouselAuto();

      try {
        viewportEl.setPointerCapture(e.pointerId);
      } catch (_) {
        // Ignore (older browsers / Safari edge cases)
      }
    }

    function onPointerMove(e) {
      if (activePointerId == null || e.pointerId !== activePointerId) return;

      lastX = e.clientX;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // If the intent is vertical scrolling, abandon the swipe gesture.
      if (!dragging && Math.abs(dy) > VERTICAL_CANCEL_PX && Math.abs(dy) > Math.abs(dx)) {
        activePointerId = null;
        dragging = false;
        viewportEl.classList.remove("is-dragging");
        window.setTimeout(startCarouselAuto, 900);
        return;
      }

      // Commit to dragging once we cross threshold (and horizontal dominates).
      if (!dragging && Math.abs(dx) > THRESHOLD_PX && Math.abs(dx) > Math.abs(dy)) {
        dragging = true;
        viewportEl.classList.add("is-dragging");
      }

      if (dragging) {
        // Prevent link clicks + some browsers' default swipe behaviors.
        e.preventDefault();
      }
    }

    function finishPointer(e) {
      if (activePointerId == null || e.pointerId !== activePointerId) return;

      const dx = (lastX || e.clientX) - startX;
      const dt = Math.max(1, performance.now() - startT);
      const vx = dx / dt; // px per ms

      const didDrag = dragging;
      viewportEl.classList.remove("is-dragging");

      // Release capture.
      try {
        viewportEl.releasePointerCapture(e.pointerId);
      } catch (_) {
        // ignore
      }

      activePointerId = null;
      dragging = false;

      // If it was a real swipe/drag, change slides.
      const absDx = Math.abs(dx);
      const shouldAdvance =
        absDx > THRESHOLD_PX || (absDx > 10 && Math.abs(vx) > 0.6);

      if (didDrag && shouldAdvance) {
        // Suppress the "click" that follows a drag (prevents accidental navigation).
        suppressClickUntil = performance.now() + 380;

        if (dx < 0) nextSlide();
        else prevSlide();
      }

      window.setTimeout(startCarouselAuto, 1200);
    }

    viewportEl.addEventListener("pointerdown", onPointerDown, { passive: true });
    viewportEl.addEventListener("pointermove", onPointerMove, { passive: false });
    viewportEl.addEventListener("pointerup", finishPointer, { passive: true });
    viewportEl.addEventListener("pointercancel", finishPointer, { passive: true });

    // Capture click: cancel if it was actually a swipe.
    viewportEl.addEventListener(
      "click",
      (e) => {
        if (performance.now() < suppressClickUntil) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  }

  /* -----------------------------
     3D teeter animation
  ------------------------------ */
  let activeCategory = "all";

  // Motion is allowed only while the landing section is visible *and* we are not in a "selection lock".
  // The selection lock turns motion off immediately on click, and only clears after the user has left
  // the landing area and then returned back to it (scrolling up).
  let selectionLockActive = false;
  let selectionLockHasLeftLanding = false;
  let introLockActive = !prefersReducedMotion; // paused during staged entrance


  let motionEnabled = !prefersReducedMotion;
  let motionWasEnabled = motionEnabled;

  const teeterState = new Map(); // element -> params

  function seedTeeterParams(el, index) {
    const rnd = (min, max) => min + Math.random() * (max - min);

    teeterState.set(el, {
      phase: rnd(0, Math.PI * 2),
      speed: rnd(0.55, 0.95) * (index % 2 === 0 ? 1 : 0.9),
      // Keep rotation subtle so labels stay visually left-aligned and never drift off-screen.
      rotX: rnd(0.8, 3.2),
      rotY: rnd(0.6, 2.6),
      z: rnd(14, 56),
      y: rnd(0, 7)
    });
  }

  function animateTeeter(t) {
    if (motionEnabled) {
      const time = t * 0.001;

      for (const [id, el] of catButtonsSide.entries()) {
        if (!el || id === "all") continue;
        if (el.classList.contains("is-dropped")) continue;

        const p = teeterState.get(el);
        if (!p) continue;

        const xRot = Math.sin(time * p.speed + p.phase) * p.rotX;
        const yRot = Math.cos(time * (p.speed * 0.9) + p.phase) * p.rotY;
        const z = Math.sin(time * (p.speed * 0.8) + p.phase) * p.z;
        const y = Math.cos(time * (p.speed * 1.1) + p.phase) * p.y;

        el.style.transform = `translate3d(0px, ${y}px, ${z}px) rotateX(${xRot}deg) rotateY(${yRot}deg)`;
      }
    }

    window.requestAnimationFrame(animateTeeter);
  }

  function landingThresholdPx() {
    // Define the "landing region" as everything above (roughly) the bottom of the hero banner.
    // Using the hero's page position is more robust than relying on a removed fixed header.
    const heroBottom = HERO.getBoundingClientRect().bottom + window.scrollY;
    return Math.max(80, heroBottom - 120);
  }

  function updateMotionFromScroll() {
    updateHeaderStatesFromScroll();
    const threshold = landingThresholdPx();
    const inLanding = window.scrollY < threshold;

    // Track whether we have truly left the landing area after selecting.
    if (selectionLockActive && !selectionLockHasLeftLanding && !inLanding) {
      selectionLockHasLeftLanding = true;
    }

    // Clear the lock only after leaving the landing area at least once, and then returning.
    if (selectionLockActive && selectionLockHasLeftLanding && inLanding) {
      selectionLockActive = false;
      selectionLockHasLeftLanding = false;
    }

    motionEnabled = !prefersReducedMotion && inLanding && !selectionLockActive && !introLockActive;
    document.body.classList.toggle("motion-paused", !motionEnabled);

    // Drop the selected category out of the floating list once you are down in the work section.
    const shouldDropSelected =
      activeCategory && activeCategory !== "all" && !inLanding;

    // Drop the selected category out of the floating list (with a smooth fade + collapse).
    for (const [id, el] of catButtonsSide.entries()) {
      if (!el || id === "all") continue;
      const shouldDrop = shouldDropSelected && id === activeCategory;
      setCategoryDropped(el, shouldDrop);
    }

    // If motion just turned back on, clear transforms so it feels alive again.
    if (motionEnabled && !motionWasEnabled) {
      for (const [id, el] of catButtonsSide.entries()) {
        if (!el || id === "all") continue;
        el.style.transform = "";
        el.classList.remove("is-selected");
      }
    }

    motionWasEnabled = motionEnabled;
  }

  /* -----------------------------
     Category selection logic
  ------------------------------ */
  const dropHideTimers = new WeakMap();

  function setCategoryDropped(el, shouldDrop) {
    // Cancel any pending hide.
    const prev = dropHideTimers.get(el);
    if (prev) {
      window.clearTimeout(prev);
      dropHideTimers.delete(el);
    }

    if (shouldDrop) {
      // Make sure it's visible so the fade can play.
      el.classList.remove("is-hidden");
      // Trigger fade.
      el.classList.add("is-dropped");

      // After the fade completes, fully collapse (removes flex gap).
      const t = window.setTimeout(() => {
        if (el.classList.contains("is-dropped")) el.classList.add("is-hidden");
      }, 360);
      dropHideTimers.set(el, t);
    } else {
      el.classList.remove("is-hidden");
      el.classList.remove("is-dropped");
    }
  }

  // Align the category panel to the right edge of the project boxes (with a small gap),
  // instead of anchoring it to the screen edge.
  function syncCategoryPanelAlignment() {
    if (!categoryPanel) return;

    const panelW = categoryPanel.getBoundingClientRect().width;
    if (!Number.isFinite(panelW) || panelW < 10) return;

    const gridRect = projectGrid.getBoundingClientRect();
    if (!Number.isFinite(gridRect.right) || gridRect.right <= 0) return;

    const inner = categoryPanel.querySelector(".panel-inner");
    const padLeft = inner ? (parseFloat(getComputedStyle(inner).paddingLeft) || 0) : 0;

    const gap = 22; // "a bit of space" between grid edge and the category list
    let left = gridRect.right + gap - padLeft;

    // Keep the panel fully on-screen with a minimum right margin.
    const minRightMargin = 18;
    const maxLeft = window.innerWidth - panelW - minRightMargin;
    left = Math.min(left, maxLeft);
    left = Math.max(0, left);

    document.documentElement.style.setProperty("--panel-left", `${left}px`);
  }

  // Header spacing that "tightens" as you scroll (matches sketch feel)
  let headerWasScrolled = false;
  let headerWasWorkCondensed = false;
  let workCondenseCooldownUntil = 0;

  function updateHeaderStatesFromScroll() {
    const scrolled = window.scrollY > 10;

    if (scrolled !== headerWasScrolled) {
      document.body.classList.toggle("is-scrolled", scrolled);
      headerWasScrolled = scrolled;

      // Namebar height changes when padding tightens; keep sticky offsets accurate.
      syncStickyCssVars();
      window.setTimeout(syncStickyCssVars, 480);
      // Also re-align the menu button + menu bar under the namebar once the transition settles.
      window.setTimeout(syncMenuPlacement, 480);
    }

    // Condense the work header only after the viewer scrolls into the work area.
// Use a viewport-relative trigger (WORK rect vs sticky offset) plus hysteresis + a short cooldown.
// This avoids "thrashing" caused by scroll anchoring + header height transitions near the boundary.
if (WORK) {
  const stickyOffset = getStickyOffset();
  const workTopInViewport = WORK.getBoundingClientRect().top - stickyOffset;

  // Hysteresis band in px (enter = further down, exit = further up)
  const ENTER_PX = -24; // once WORK top passes above sticky header by this much -> condense
  const EXIT_PX  =  48; // once WORK top drops below sticky header by this much -> expand

  // Cooldown prevents rapid toggles while transitions/scroll anchoring settle.
  const now = performance.now();
  if (now >= workCondenseCooldownUntil) {
    const workCondensed = headerWasWorkCondensed
      ? workTopInViewport < EXIT_PX
      : workTopInViewport < ENTER_PX;

    if (workCondensed !== headerWasWorkCondensed) {
      document.body.classList.toggle("work-condensed", workCondensed);
      headerWasWorkCondensed = workCondensed;
      workCondenseCooldownUntil = now + 320;

      // When the sticky header height changes, refresh dependent offsets after the transition starts.
      syncStickyCssVars();
      window.setTimeout(syncStickyCssVars, 360);
      window.setTimeout(syncMenuPlacement, 360);
    }
  }
}
  }


  function scrollToWork() {
    const stickyOffset = getStickyOffset();
    const y = WORK.getBoundingClientRect().top + window.scrollY - (stickyOffset + 12);
    window.scrollTo({
      top: Math.max(0, y),
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  }

  function setActiveCategory(nextCat) {
    activeCategory = nextCat;

    // Freeze motion immediately; only resume when the user scrolls back to the landing region.
    selectionLockActive = true;
    selectionLockHasLeftLanding = false;
    motionEnabled = false;
    motionWasEnabled = false;

    // Update selection styling in both lists.
    for (const [id, el] of catButtonsSide.entries()) {
      if (!el || id === "all") continue;
      el.classList.toggle("is-selected", id === activeCategory && activeCategory !== "all");
    }
    for (const [id, el] of catButtonsInline.entries()) {
      if (!el || id === "all") continue;
      el.classList.toggle("is-selected", id === activeCategory && activeCategory !== "all");
    }

    // Freeze the selected item flat (side panel only).
    const selectedEl = catButtonsSide.get(activeCategory);
    if (selectedEl && activeCategory !== "all") {
      selectedEl.style.transform = "translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg)";
    }

    renderGrid(activeCategory);

    // Ensure sticky offsets are up-to-date before we scroll.
    syncStickyCssVars();

    // Smooth scroll so the selected category appears at the top of the work view.
    scrollToWork();

    // Update motion/drop state during and after the scroll for consistency.
    window.setTimeout(updateMotionFromScroll, 140);
    window.setTimeout(updateMotionFromScroll, 520);
  }

  function onCategoryClick(e) {
    const btn = e.target.closest("button[data-cat]");
    if (!btn) return;
    const id = btn.dataset.cat;
    setActiveCategory(id);
  }

  /* -----------------------------
     Init
  ------------------------------ */
  /* -----------------------------
     Staged entrance sequence (index)
     - controls *when* groups appear; CSS controls *how* they appear
     - fast-forward: click/tap during the entrance to skip the built-in delays
       (no UI — just an "in a rush" gesture)
  ------------------------------ */
  let entranceTimers = [];
  let clickSkipArmed = true;
  let clickSuppressUntil = 0;

  function clearEntranceTimers() {
    for (const t of entranceTimers) window.clearTimeout(t);
    entranceTimers = [];
  }

  function skipEntranceSequence() {
    if (!document.body || prefersReducedMotion) return;
    const body = document.body;
    if (!body.classList.contains("is-loading")) return;

    clearEntranceTimers();

    // Trigger all entrance phases at once (keeps the fades, removes the long pauses).
    // "is-fastforward" only affects timings while is-loading is present.
    body.classList.add("is-fastforward");
    body.classList.add("phase-utility", "phase-context", "phase-explore", "panel-loaded");

    // Restore 3D teeter once things have visually landed.
    entranceTimers.push(
      window.setTimeout(() => {
        introLockActive = false;
        updateMotionFromScroll();
      }, 520)
    );

    // Cleanup entrance-only classes after transitions settle.
    entranceTimers.push(
      window.setTimeout(() => {
        body.classList.remove("is-loading");
        body.classList.remove("phase-utility", "phase-context", "phase-explore");
        body.classList.remove("is-fastforward");
      }, 1200)
    );
  }

  // Secret skip: first click/tap during the entrance fast-forwards the sequence.
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!clickSkipArmed) return;
      if (prefersReducedMotion) return;
      if (!document.body || !document.body.classList.contains("is-loading")) return;

      // If the final phase is already visible, don't hijack interactions.
      if (document.body.classList.contains("phase-explore")) return;

      clickSkipArmed = false;
      clickSuppressUntil = performance.now() + 900;

      skipEntranceSequence();

      // Consume this gesture so it doesn't activate a link/button underneath.
      e.preventDefault();
      e.stopPropagation();
    },
    { capture: true, passive: false }
  );

  // Also suppress the click event that follows pointerdown/up,
  // so the user's "skip" doesn't accidentally navigate.
  document.addEventListener(
    "click",
    (e) => {
      if (performance.now() < clickSuppressUntil) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    true
  );

  function runEntranceSequence() {
    if (!document.body) return;
    const body = document.body;

    // Ensure expected base class (in case index.html was not updated)
    body.classList.add("index");
    if (!body.classList.contains("is-loading")) body.classList.add("is-loading");

    // Default entrance stays slow. Fast-forward is only user-triggered.
    body.classList.remove("is-fastforward");
    clickSkipArmed = true;
    clickSuppressUntil = 0;

    clearEntranceTimers();

    // Reduced motion: show everything immediately and enable motion normally.
    if (prefersReducedMotion) {
      body.classList.add("phase-utility", "phase-context", "phase-explore", "panel-loaded");
      body.classList.remove("is-loading");
      body.classList.remove("phase-utility", "phase-context", "phase-explore");
      introLockActive = false;
      updateMotionFromScroll();
      return;
    }

    // Phase timing (ms) — intentionally slow / sequential
    // Identity (name/title + banner) is always visible now (no staged fade).
    // CV appears next, then we pause a full 2 seconds after the CV finishes.
    // Bio appears next, then categories + grid follow shortly after bio completes.
    const T_UTILITY = 2000;  // show CV (shortly after landing)
    const T_CONTEXT = 5200;  // bio starts (CV: 1200ms fade, then 2000ms pause)
    const T_EXPLORE = 7600;  // categories + grid (shortly after bio completes)
    const T_CLEANUP = 11000; // remove entrance classes after transitions settle

    // Kick phases on the next frame so the initial hidden state paints first (prevents no-op transitions).
    window.requestAnimationFrame(() => {
      entranceTimers.push(window.setTimeout(() => body.classList.add("phase-utility"), T_UTILITY));
      entranceTimers.push(window.setTimeout(() => body.classList.add("phase-context"), T_CONTEXT));

      entranceTimers.push(
        window.setTimeout(() => {
          body.classList.add("phase-explore");
          body.classList.add("panel-loaded");

          // Allow teeter motion to resume once the panel has had a moment to land.
          entranceTimers.push(
            window.setTimeout(() => {
              introLockActive = false;
              updateMotionFromScroll();
            }, 1100)
          );
        }, T_EXPLORE)
      );

      // Cleanup entrance-only classes so normal interactions aren't overridden by phase selectors.
      entranceTimers.push(
        window.setTimeout(() => {
          body.classList.remove("is-loading");
          body.classList.remove("phase-utility", "phase-context", "phase-explore");
          body.classList.remove("is-fastforward");
        }, T_CLEANUP)
      );
    });
  }


  buildCategoryPanel();

  // Seed teeter params once the buttons exist.
  let i = 0;
  for (const [id, el] of catButtonsSide.entries()) {
    if (!el || id === "all") continue;
    seedTeeterParams(el, i++);
  }

  categoryList.addEventListener("click", onCategoryClick);
  if (categoryListInline) categoryListInline.addEventListener("click", onCategoryClick);

  // Build & wire carousel
  buildCarousel();
  carouselDots.addEventListener("click", onDotNavClick);
  const carouselViewport = carouselTrack.closest(".carousel-viewport") || carouselTrack;
  carouselViewport.addEventListener("mouseenter", stopCarouselAuto);
  carouselViewport.addEventListener("mouseleave", startCarouselAuto);
  enableCarouselSwipe(carouselViewport);
  startCarouselAuto();

  // Render initial grid
  renderGrid(activeCategory);
  runEntranceSequence();


  // Keep sticky offsets correct (namebar height can change with fonts/breakpoints)
  syncSharedHeaderVars();
  window.addEventListener("load", syncSharedHeaderVars, { once: true });
  syncCategoryPanelAlignment();
  window.addEventListener("load", syncCategoryPanelAlignment, { once: true });

  // Scroll-based motion control
  window.addEventListener("scroll", updateMotionFromScroll, { passive: true });
  window.addEventListener("resize", () => {
    syncStickyCssVars();
    syncCategoryPanelAlignment();
    updateMotionFromScroll();
  });
  updateMotionFromScroll();

  // Start teeter loop
  window.requestAnimationFrame(animateTeeter);
})();