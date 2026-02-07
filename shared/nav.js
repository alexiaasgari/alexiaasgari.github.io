(() => {
  // Shared typography:
  // - Orbitron (display) for: "Alexia Asgari" + "creative technologist"
  // - Inconsolata (body) + Raleway (headings/UI) to match the BootstrapMade pages
  const FONT_DISPLAY_HREF =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600&family=Inconsolata:wght@400;500;600;700&family=Raleway:wght@400;500;600;700;800&display=swap";

  // Fallback nav HTML for environments where fetch() of local files is blocked
  // (e.g. opening pages via file:// without a local server).
  const NAV_HTML_FALLBACK = `\
<!-- Shared navigation (injected by shared/nav.js) -->
<button class="menu-btn menu-floating" id="menuBtn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menuDrop">
  <span></span><span></span><span></span>
</button>

<nav class="menu-drop" id="menuDrop" aria-label="Menu" aria-hidden="true">
  <div class="menu-drop-inner">
    <a class="menu-link" data-nav="home" data-href="index.html" href="index.html">home</a>
    <a class="menu-link" data-nav="about" data-href="about.html" href="about.html">about</a>
    <a class="menu-link" data-nav="contact" data-href="contact.html" href="contact.html">contact</a>
  </div>
</nav>`;

  function ensureFonts() {
    // Home page already includes these; legacy pages often don't.
    // Avoid duplicate <link> tags.
    const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some((l) => (l.getAttribute('href') || '').includes('family=Orbitron'));
    if (existing) return;

    const pre1 = document.createElement('link');
    pre1.rel = 'preconnect';
    pre1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(pre1);

    const pre2 = document.createElement('link');
    pre2.rel = 'preconnect';
    pre2.href = 'https://fonts.gstatic.com';
    pre2.crossOrigin = 'anonymous';
    document.head.appendChild(pre2);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_DISPLAY_HREF;
    document.head.appendChild(link);
  }

  const NAV_SCRIPT_URL = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src, window.location.href)
    : null;

  function getSiteRootPath() {
    // nav.js lives at <site-root>/shared/nav.js
    if (NAV_SCRIPT_URL) {
      return NAV_SCRIPT_URL.pathname.replace(/\/shared\/nav\.js(?:\?.*)?$/, "/");
    }
    // Fallback: current directory
    const p = window.location.pathname || "/";
    return p.endsWith("/") ? p : p.replace(/[^/]*$/, "");
  }

  function stripTrailingSlash(p) {
    if (!p) return p;
    if (p.length === 1) return p; // keep "/"
    return p.endsWith('/') ? p.slice(0, -1) : p;
  }

  function ensureNamebar(rootPath, placeholderEl) {
    // Index already has a fully custom namebar.
    if (document.getElementById('nameBar')) return;

    const namebar = document.createElement('div');
    namebar.className = 'namebar aa-namebar';
    namebar.id = 'nameBar';

    const inner = document.createElement('div');
    inner.className = 'namebar-inner aa-namebar-inner';
    inner.innerHTML = `
      <div class="brand"><a class="brand-link" href="${rootPath}index.html" aria-label="Go to home">Alexia Asgari</a></div>
      <div class="tagline">creative technologist</div>
    `.trim();

    namebar.appendChild(inner);
    document.body.classList.add('aa-shared-header');

    // Place it directly under the injected nav container.
    const anchor = placeholderEl || document.getElementById('sharedNav');
    if (anchor) anchor.insertAdjacentElement('afterend', namebar);
    else document.body.insertAdjacentElement('afterbegin', namebar);
  }


  async function injectNav() {
    const placeholder = document.getElementById('sharedNav') || (() => {
      const el = document.createElement('div');
      el.id = 'sharedNav';
      document.body.insertAdjacentElement('afterbegin', el);
      return el;
    })();

    const rootPath = getSiteRootPath();
    let html = null;

    try {
      const res = await fetch(rootPath + 'shared/nav.html', { cache: 'no-store' });
      if (res.ok) html = await res.text();
    } catch (_) {
      // ignore
    }

    if (!html) {
      // Likely opened via file:// (fetch blocked). Fall back to an inline copy.
      console.warn('[shared/nav] Could not load shared/nav.html — using inline fallback');
      html = NAV_HTML_FALLBACK;
    }

    placeholder.innerHTML = html;

    // Normalize nav links to point at the site root regardless of nesting.
    placeholder.querySelectorAll('[data-href]').forEach((a) => {
      const rel = a.getAttribute('data-href') || '';
      // Root-relative keeps GitHub Pages project sites working (/repo/...)
      a.setAttribute('href', rootPath + rel);
    });

    // Inject a header namebar on all non-index pages.
    ensureNamebar(rootPath, placeholder);

    // Hide page-specific links.
    // IMPORTANT: project pages are also named index.html, so we must compare against the *site root*.
    const pathLower = (window.location.pathname || '/').toLowerCase();
    const rootLower = (rootPath || '/').toLowerCase();

    const rootNoSlash = stripTrailingSlash(rootLower);
    const pathNoSlash = stripTrailingSlash(pathLower);

    const homePath = rootNoSlash === '/' ? '/' : rootNoSlash;
    const homeIndexPath = `${rootLower}index.html`;
    const aboutPath = `${rootLower}about.html`;
    const contactPath = `${rootLower}contact.html`;

    const isHome = pathNoSlash === homePath || pathLower === homeIndexPath;
    const isAbout = pathLower === aboutPath;
    const isContact = pathLower === contactPath;

    const homeLink = placeholder.querySelector('[data-nav="home"]');
    const aboutLink = placeholder.querySelector('[data-nav="about"]');
    const contactLink = placeholder.querySelector('[data-nav="contact"]');

    if (homeLink) homeLink.style.display = isHome ? 'none' : '';
    if (aboutLink) aboutLink.style.display = isAbout ? 'none' : '';
    if (contactLink) contactLink.style.display = isContact ? 'none' : '';

    // Init interaction.
    initMenuInteractions();

    // Project pages: click images to view fullscreen/lightbox.
    enableProjectImageLightbox();
  }

  function enableProjectImageLightbox() {
    const path = (window.location.pathname || '').toLowerCase();
    if (!path.includes('/projects/')) return;

    // Avoid double-init.
    if (document.getElementById('aaLightbox')) return;

    document.body.classList.add('aa-lightbox-enabled');

    const overlay = document.createElement('div');
    overlay.id = 'aaLightbox';
    overlay.className = 'aa-lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
      <button class="aa-lightbox-close" type="button" aria-label="Close image">&times;</button>
      <img class="aa-lightbox-img" alt="" />
    `.trim();
    document.body.appendChild(overlay);

    const overlayImg = overlay.querySelector('.aa-lightbox-img');
    const closeBtn = overlay.querySelector('.aa-lightbox-close');

    function open(src, alt) {
      if (!overlayImg) return;
      overlayImg.src = src;
      overlayImg.alt = alt || '';
      document.body.classList.add('aa-lightbox-open');
    }

    function close() {
      document.body.classList.remove('aa-lightbox-open');
      if (overlayImg) overlayImg.src = '';
    }

    closeBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    // Attach to images inside <main>.
    const imgs = Array.from(document.querySelectorAll('main img'));
    imgs.forEach((img) => {
      // Skip tiny icons/logos/etc.
      if (img.width && img.height && img.width < 80 && img.height < 80) return;

      img.classList.add('aa-lightbox-target');

      img.addEventListener('click', (e) => {
        const link = img.closest('a');
        if (link) e.preventDefault();
        e.stopPropagation();
        open(img.currentSrc || img.src, img.alt);
      });
    });
  }

  function initMenuInteractions() {
    const menuBtn = document.getElementById('menuBtn');
    const menuDrop = document.getElementById('menuDrop');
    const namebar = document.getElementById('nameBar');

    if (!menuBtn || !menuDrop) return;

    function syncMenuPlacement() {
      // Keep menu bar under the namebar (home page); otherwise it sits at top: 0.
      if (namebar) {
        const nameRect = namebar.getBoundingClientRect();
        const namebarIsStuck = nameRect.top <= 0.5;

        // Expose the current header height to CSS (used to offset sticky elements below it).
        const namebarH = nameRect.height || namebar.offsetHeight || 0;
        document.documentElement.style.setProperty('--aa-namebar-height', `${Math.max(0, namebarH)}px`);

        const menuTop = Math.max(0, nameRect.bottom);
        document.documentElement.style.setProperty('--menu-top', `${menuTop}px`);

        const isOpen = document.body.classList.contains('menu-open');
        const menuH = menuDrop.getBoundingClientRect().height || 0;
        const menuOffset = isOpen ? menuH : 0;
        document.documentElement.style.setProperty('--menu-offset', `${menuOffset}px`);

        // Used by nav.css to offset BootstrapMade sticky sidebar blocks (.sticky-content).
        // Give it a small buffer so text doesn't feel cramped.
        const stickyTop = Math.max(0, (Number(namebarH) || 0) + (Number(menuOffset) || 0) + 18);
        document.documentElement.style.setProperty('--aa-sticky-top', `${stickyTop}px`);

        if (namebarIsStuck) {
          const btnH = menuBtn.getBoundingClientRect().height || 0;
          const top = Math.max(6, (nameRect.height - btnH) / 2);
          menuBtn.style.top = `${top}px`;
        } else {
          menuBtn.style.top = '';
        }
      } else {
        document.documentElement.style.setProperty('--menu-top', `0px`);
        document.documentElement.style.setProperty('--menu-offset', `0px`);
        document.documentElement.style.setProperty('--aa-namebar-height', `0px`);
        document.documentElement.style.setProperty('--aa-sticky-top', `0px`);
        menuBtn.style.top = '';
      }
    }

    function setMenuOpen(isOpen) {
      document.body.classList.toggle('menu-open', isOpen);
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuDrop.setAttribute('aria-hidden', String(!isOpen));
      syncMenuPlacement();
      window.setTimeout(syncMenuPlacement, 260);
    }

    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      setMenuOpen(!document.body.classList.contains('menu-open'));
    });

    // Close when clicking a link.
    menuDrop.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) setMenuOpen(false);
    });

    // Close on escape.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    });

    // Close on click outside.
    document.addEventListener('click', (e) => {
      if (!document.body.classList.contains('menu-open')) return;
      const inside = menuDrop.contains(e.target) || menuBtn.contains(e.target);
      if (!inside) setMenuOpen(false);
    });

    // Keep placement synced on scroll/resize.
    let raf = 0;
    function requestSync() {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        syncMenuPlacement();
      });
    }

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync);
    window.addEventListener('load', requestSync, { once: true });
    requestSync();

    // Expose for other scripts (home page script uses this).
    window.__aaSyncMenuPlacement = requestSync;
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureFonts();
    injectNav();
  });
})();
