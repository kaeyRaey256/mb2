/* ============================================================
   MBOLT V2 — MAIN JS
   ============================================================ */

(function () {
  'use strict';

  /* ── THEME ──────────────────────────────────────────────── */
  function initTheme() {
    const saved = localStorage.getItem('mbolt-theme');
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (dark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }
  initTheme();

  document.addEventListener('DOMContentLoaded', function () {

    /* ── THEME TOGGLE ────────────────────────────────────── */
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const curr = document.documentElement.getAttribute('data-theme');
        const next = curr === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('mbolt-theme', next);
      });
    });

    /* ── CUSTOM CURSOR ───────────────────────────────────── */
    const dot  = document.querySelector('.cur-dot');
    const ring = document.querySelector('.cur-ring');
    if (dot && ring && window.matchMedia('(hover: hover)').matches) {
      let rx = 0, ry = 0, mx = 0, my = 0;
      document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
      dot.style.left  = ring.style.left  = '-100px';
      dot.style.top   = ring.style.top   = '-100px';
      (function loop() {
        rx += (mx - rx) * 0.12;
        ry += (my - ry) * 0.12;
        dot.style.left  = mx + 'px';
        dot.style.top   = my + 'px';
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';
        requestAnimationFrame(loop);
      })();

      const hoverEls = 'a, button, [tabindex="0"], .cap-cta, .work-row, .gallery-tile, .gallery-card, .client-chip, .channel';
      document.querySelectorAll(hoverEls).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
      });
    }

    /* ── NAVBAR ─────────────────────────────────────────── */
    const nav  = document.getElementById('main-nav');
    const hero = document.querySelector('.hero');

    function updateNav() {
      if (!nav) return;
      const scrolled = window.scrollY > 40;
      nav.classList.toggle('scrolled', scrolled);
      if (hero) {
        const onDark = window.scrollY < (hero.offsetHeight - 80);
        nav.classList.toggle('on-dark', onDark);
      }
    }
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });

    /* ── MOBILE DRAWER ───────────────────────────────────── */
    const burger  = document.getElementById('nav-burger');
    const drawer  = document.getElementById('nav-drawer');
    const overlay = document.getElementById('drawer-overlay');

    function openDrawer()  {
      if (!drawer) return;
      drawer.classList.add('open');
      if (overlay) overlay.classList.add('open');
      if (burger)  { burger.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); }
      document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
      if (!drawer) return;
      drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      if (burger)  { burger.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
      document.body.style.overflow = '';
    }
    if (burger) burger.addEventListener('click', () => drawer.classList.contains('open') ? closeDrawer() : openDrawer());
    if (overlay) overlay.addEventListener('click', closeDrawer);
    document.querySelectorAll('.nav-drawer nav a').forEach(a => a.addEventListener('click', closeDrawer));

    /* ── SCROLL-UP BUTTON ───────────────────────────────── */
    const scrollUpBtn = document.querySelector('.scroll-up');
    if (scrollUpBtn) {
      window.addEventListener('scroll', () => {
        scrollUpBtn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      scrollUpBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ── REVEAL ON SCROLL ───────────────────────────────── */
    const revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
      const revObs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(el => revObs.observe(el));
    }

    /* ── HERO SLIDESHOW ─────────────────────────────────── */
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-counter-dot');
    if (slides.length > 1) {
      let current = 0, timer;
      function goTo(idx) {
        slides[current].classList.remove('active');
        dots[current]?.classList.remove('active');
        current = idx;
        slides[current].classList.add('active');
        dots[current]?.classList.add('active');
        clearInterval(timer);
        timer = setInterval(() => goTo((current + 1) % slides.length), 5500);
      }
      dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
      goTo(0);
    }

    /* ── CAPABILITY PANELS ──────────────────────────────── */
    const capPanels = document.querySelectorAll('.cap-panel');
    const capRail   = document.querySelector('.cap-rail');
    const capFill   = document.querySelector('.cap-rail-fill');
    const capSection = document.querySelector('.cap-section');

    if (capPanels.length && capRail) {
      const panelObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          e.target.classList.toggle('in-view', e.isIntersecting);
        });
      }, { threshold: 0.35 });
      capPanels.forEach(p => panelObs.observe(p));

      // Rail visibility
      const sectionObs = new IntersectionObserver((entries) => {
        entries.forEach(e => capRail.classList.toggle('visible', e.isIntersecting));
      }, { threshold: 0.05 });
      if (capSection) sectionObs.observe(capSection);

      // Rail fill
      window.addEventListener('scroll', () => {
        if (!capSection) return;
        const rect = capSection.getBoundingClientRect();
        const total = capSection.offsetHeight - window.innerHeight;
        const prog = Math.min(1, Math.max(0, -rect.top / total));
        if (capFill) capFill.style.height = (prog * 100) + '%';
      }, { passive: true });
    }

    /* ── CAPABILITY DRAWER ──────────────────────────────── */
    const capDrawer  = document.getElementById('cap-drawer');
    const capBackdrop = document.getElementById('cap-backdrop');
    const capCloseBtn = document.getElementById('cap-drawer-close');

    const capData = {
      btl: {
        num: '01', name: 'BTL Marketing',
        desc: 'We stage real experiences that reach people where they live, work, and gather. Brand activations, roadshows, promotions and field marketing built for the Ugandan market across fifteen years. Not just presence. Connection that converts.',
        tags: ['Experiential Marketing', 'Brand Activations', 'Promotions', 'Road Shows', 'Field Marketing', 'Trade Events']
      },
      digital: {
        num: '02', name: 'Digital Solutions',
        desc: 'The market is moving digital. We move with it. Loyalty programmes that keep consumers returning, market intelligence that tells you what your competitors cannot see, digital platforms built on genuine consumer insight.',
        tags: ['Loyalty Programmes', 'Market Intelligence', 'Digital Platforms', 'Data Solutions', 'Consumer Insights']
      },
      strategy: {
        num: '03', name: 'Activation Strategy',
        desc: 'A campaign without a strategy is noise. We conceptualise the idea, build the budget, design the execution plan, and ensure every moving part is accounted for before a single field team is deployed.',
        tags: ['Concept Development', 'Budget Planning', 'Execution Roadmaps', 'Campaign Architecture', 'Market Analysis']
      },
      comms: {
        num: '04', name: 'Communications',
        desc: 'We make messages land. One-on-one or mass. Education campaigns, sensitisation programmes, awareness drives. We understand how Ugandan communities receive and act on information, and we build communications that respect that understanding.',
        tags: ['One-on-One', 'Awareness Campaigns', 'Sensitisation', 'Mass Communication', 'Community Engagement']
      },
      sales: {
        num: '05', name: 'Sales and Distribution',
        desc: 'Door to door, done right. Products moved. Targets hit. We deploy field teams with trade route mapping, daily reporting, and real-time route adjustments. If it needs to reach the market, we take it there.',
        tags: ['Trade Route Mapping', 'Merchandising', 'Product Placement', 'Direct Sales', 'Last-Mile Delivery']
      },
      supplies: {
        num: '06', name: 'General Supplies',
        desc: 'Fifteen years of operating in Uganda means fifteen years of supplier relationships. Branded merchandise, event materials, promotional supplies. We source what you need, when you need it, and deliver it where it needs to go.',
        tags: ['Branded Merchandise', 'Event Materials', 'Sourcing', 'Supply Chain', 'Procurement']
      }
    };

    function openCapDrawer(id) {
      const d = capData[id];
      if (!d || !capDrawer) return;
      capDrawer.querySelector('.cap-drawer-eyebrow').textContent = 'Capability ' + d.num;
      capDrawer.querySelector('.cap-drawer-title').textContent = d.name;
      capDrawer.querySelector('.cap-drawer-desc').textContent = d.desc;
      const tagsEl = capDrawer.querySelector('.cap-drawer-tags');
      tagsEl.innerHTML = d.tags.map(t => `<span class="cap-drawer-tag">${t}</span>`).join('');
      capDrawer.querySelector('.cap-drawer-num').textContent = d.num;
      capDrawer.classList.add('open');
      if (capBackdrop) capBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeCapDrawer() {
      if (capDrawer) capDrawer.classList.remove('open');
      if (capBackdrop) capBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (capCloseBtn) capCloseBtn.addEventListener('click', closeCapDrawer);
    if (capBackdrop) capBackdrop.addEventListener('click', closeCapDrawer);

    document.querySelectorAll('.cap-cta').forEach(btn => {
      btn.addEventListener('click', () => openCapDrawer(btn.dataset.service));
    });

    // Service open from URL param or footer links
    const urlService = new URLSearchParams(window.location.search).get('service');
    if (urlService && capData[urlService]) openCapDrawer(urlService);

    document.querySelectorAll('[data-service-open]').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openCapDrawer(el.dataset.serviceOpen); });
    });

    /* ── WORK MODAL ─────────────────────────────────────── */
    const workModal    = document.getElementById('work-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose   = document.getElementById('work-modal-close');

    const workData = {
      w1: {
        img: 'assets/images/work-1.jpg', cat: 'Field Marketing',
        client: 'Orange Telecom', name: 'Retail Outreach Campaign',
        copy: 'A countrywide retail engagement programme that put Orange directly in front of consumers at point of purchase. MBolt deployed trained brand ambassadors across key retail corridors, driving SIM activations and data package uptake in markets where digital advertising does not reach.'
      },
      w2: {
        img: 'assets/images/work-2.jpg', cat: 'Promotions',
        client: "Gorillo's Snacks", name: 'Branded Vans and Cannons',
        copy: "A high-energy promotional campaign that transformed Gorillo's into a street-level phenomenon. Branded vans and product cannons created shareable, crowd-drawing moments in high-footfall areas, building brand love with younger consumers in Kampala and upcountry markets."
      },
      w3: {
        img: 'assets/images/work-3.jpg', cat: 'Brand Experience',
        client: 'TotalEnergies', name: 'Brand Experience Event',
        copy: "A premium brand experience that elevated TotalEnergies' positioning in the Ugandan market. MBolt conceptualised, planned and executed an immersive event environment that brought the brand's values to life for trade partners, media, and consumers."
      },
      w4: {
        img: 'assets/images/work-4.jpg', cat: 'Sales and Distribution',
        client: 'Field Activation', name: 'Pay Campaign',
        copy: 'A structured direct sales campaign deployed across targeted geographic corridors. MBolt field teams executed with daily route mapping, real-time reporting, and consistent brand presentation, delivering measurable uplift in product trial and conversion.'
      },
      w5: {
        img: 'assets/images/work-5.jpg', cat: 'Communications',
        client: 'Orange Telecom', name: 'Internet Packages Campaign',
        copy: 'A mass communication initiative designed to drive uptake of Orange internet packages in emerging markets. MBolt built a grassroots communication strategy that met consumers in their daily environment, simplifying the proposition and driving measurable subscriber growth.'
      },
      w6: {
        img: 'assets/images/work-6.jpg', cat: 'Field Marketing',
        client: 'Smile Telecom', name: 'Rural Outreach Campaign',
        copy: 'Taking Smile into rural Uganda required more than reach. It required trust. MBolt designed a community-first outreach programme that engaged local networks and influencers, building genuine brand awareness in communities that had never experienced broadband before.'
      }
    };

    function openWorkModal(id) {
      const d = workData[id];
      if (!d || !workModal) return;
      workModal.querySelector('.work-modal-img').src = d.img;
      workModal.querySelector('.work-modal-img').alt = d.name;
      workModal.querySelector('.work-modal-cat-badge').textContent = d.cat;
      workModal.querySelector('.work-modal-client').textContent = d.client;
      workModal.querySelector('.work-modal-title').textContent = d.name;
      workModal.querySelector('.work-modal-copy').textContent = d.copy;
      workModal.querySelector('.work-modal-num').textContent = id.replace('w', '0');
      workModal.classList.add('open');
      if (modalBackdrop) modalBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeWorkModal() {
      if (workModal) workModal.classList.remove('open');
      if (modalBackdrop) modalBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (modalClose) modalClose.addEventListener('click', closeWorkModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeWorkModal);

    document.querySelectorAll('.work-row').forEach(row => {
      row.addEventListener('click', () => openWorkModal(row.dataset.work));
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openWorkModal(row.dataset.work); });
    });

    /* ── GALLERY MODAL ──────────────────────────────────── */
    const galleryModal = document.getElementById('gallery-modal');
    const galBackdrop  = document.getElementById('gallery-backdrop');
    const galClose     = document.getElementById('gallery-modal-close');

    function openGalleryModal(data) {
      if (!galleryModal) return;
      galleryModal.querySelector('.gm-img').src = data.img;
      galleryModal.querySelector('.gm-img').alt = data.name;
      galleryModal.querySelector('.gm-client').textContent = data.client;
      galleryModal.querySelector('.gm-title').textContent = data.name;
      galleryModal.querySelector('.gm-cat').textContent = data.cat;
      galleryModal.querySelector('.gm-desc').textContent = data.desc || '';
      galleryModal.classList.add('open');
      if (galBackdrop) galBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeGalleryModal() {
      if (galleryModal) galleryModal.classList.remove('open');
      if (galBackdrop) galBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (galClose) galClose.addEventListener('click', closeGalleryModal);
    if (galBackdrop) galBackdrop.addEventListener('click', closeGalleryModal);

    document.querySelectorAll('.gallery-card[data-gallery]').forEach(card => {
      card.addEventListener('click', () => {
        const d = JSON.parse(card.dataset.gallery);
        openGalleryModal(d);
      });
    });

    /* ── LEGAL TABS ─────────────────────────────────────── */
    document.querySelectorAll('.legal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.legal-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.legal-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.target);
        if (target) target.classList.add('active');
        // Hash for direct linking
        history.replaceState(null, '', '#' + tab.dataset.target);
      });
    });
    // On load check hash
    const hash = window.location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      document.querySelectorAll('.legal-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.legal-panel').forEach(p => p.classList.remove('active'));
      const activeTab = document.querySelector(`.legal-tab[data-target="${hash}"]`);
      const activePanel = document.getElementById(hash);
      if (activeTab) activeTab.classList.add('active');
      if (activePanel) activePanel.classList.add('active');
    }

    /* ── COOKIE BANNER ──────────────────────────────────── */
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('mbolt-cookie')) {
      setTimeout(() => cookieBanner.classList.add('show'), 1800);
      document.getElementById('cookie-accept')?.addEventListener('click', () => {
        localStorage.setItem('mbolt-cookie', 'accepted');
        cookieBanner.classList.remove('show');
      });
      document.getElementById('cookie-decline')?.addEventListener('click', () => {
        localStorage.setItem('mbolt-cookie', 'declined');
        cookieBanner.classList.remove('show');
      });
    }

    /* ── ACCESSIBILITY ──────────────────────────────────── */
    const a11yToggle = document.getElementById('a11y-toggle');
    const a11yPanel  = document.getElementById('a11y-panel');
    if (a11yToggle && a11yPanel) {
      a11yToggle.addEventListener('click', () => {
        const open = a11yPanel.classList.toggle('open');
        a11yToggle.setAttribute('aria-expanded', open);
      });
      document.addEventListener('click', e => {
        if (!a11yToggle.contains(e.target) && !a11yPanel.contains(e.target)) a11yPanel.classList.remove('open');
      });
    }
    const hcCheck = document.getElementById('a11y-hc');
    const rmCheck = document.getElementById('a11y-motion');
    const fsRange = document.getElementById('a11y-font');
    if (hcCheck) {
      hcCheck.checked = localStorage.getItem('mbolt-hc') === '1';
      document.body.classList.toggle('hc', hcCheck.checked);
      hcCheck.addEventListener('change', () => {
        document.body.classList.toggle('hc', hcCheck.checked);
        localStorage.setItem('mbolt-hc', hcCheck.checked ? '1' : '');
      });
    }
    if (rmCheck) {
      rmCheck.checked = localStorage.getItem('mbolt-rm') === '1';
      document.body.classList.toggle('rm', rmCheck.checked);
      rmCheck.addEventListener('change', () => {
        document.body.classList.toggle('rm', rmCheck.checked);
        localStorage.setItem('mbolt-rm', rmCheck.checked ? '1' : '');
      });
    }
    if (fsRange) {
      const saved = localStorage.getItem('mbolt-fs');
      if (saved) { fsRange.value = saved; document.documentElement.style.fontSize = saved + 'px'; }
      fsRange.addEventListener('input', () => {
        document.documentElement.style.fontSize = fsRange.value + 'px';
        localStorage.setItem('mbolt-fs', fsRange.value);
      });
    }

    /* ── CONTACT FORM ───────────────────────────────────── */
    document.querySelectorAll('[data-contact-form]').forEach(form => {
      const inner   = form.querySelector('[data-form-inner]');
      const success = form.querySelector('[data-form-success]');
      const btn     = form.querySelector('[data-submit]');
      if (!btn) return;
      btn.addEventListener('click', e => {
        e.preventDefault();
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(f => { if (!f.value.trim()) { f.style.borderColor = 'var(--red)'; valid = false; } else { f.style.borderColor = ''; } });
        if (!valid) return;
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Sending...';
        setTimeout(() => {
          if (inner)   inner.classList.add('hidden');
          if (success) success.classList.add('show');
        }, 900);
      });
    });

    /* ── CAREERS FORM ───────────────────────────────────── */
    document.querySelectorAll('[data-careers-form]').forEach(form => {
      const inner   = form.querySelector('[data-form-inner]');
      const success = form.querySelector('[data-form-success]');
      const btn     = form.querySelector('[data-submit]');
      if (!btn) return;
      btn.addEventListener('click', e => {
        e.preventDefault();
        const required = form.querySelectorAll('[required]');
        let valid = true;
        required.forEach(f => { if (!f.value.trim()) { f.style.borderColor = 'var(--red)'; valid = false; } else { f.style.borderColor = ''; } });
        if (!valid) return;
        btn.disabled = true;
        btn.querySelector('span').textContent = 'Sending...';
        setTimeout(() => {
          if (inner)   inner.classList.add('hidden');
          if (success) success.classList.add('show');
        }, 900);
      });
    });

    /* ── ESC KEY ────────────────────────────────────────── */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeCapDrawer();
        closeWorkModal();
        closeGalleryModal();
        closeDrawer();
      }
    });

    /* ── GALLERY HERO CYCLE (gallery page) ─────────────── */
    const ghBg = document.querySelector('.gallery-hero-bg');
    const ghImages = [
      'assets/images/gallery/gallery-1.png',
      'assets/images/gallery/gallery-2.png',
      'assets/images/gallery/gallery-3.png'
    ];
    if (ghBg) {
      let gi = 0;
      ghBg.style.backgroundImage = `url('${ghImages[0]}')`;
      setInterval(() => {
        gi = (gi + 1) % ghImages.length;
        ghBg.style.opacity = '0';
        setTimeout(() => {
          ghBg.style.backgroundImage = `url('${ghImages[gi]}')`;
          ghBg.style.opacity = '.25';
        }, 600);
      }, 5000);
    }

  }); // end DOMContentLoaded

})();
