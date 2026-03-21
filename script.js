document.addEventListener('DOMContentLoaded', function () {

  const mainNav   = document.getElementById('mainNav');
  const stickyNav = document.getElementById('stickyNav');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (mainNav) {
    const stickyBar    = document.getElementById('stickyBar');
    let FOLD         = window.innerHeight;
    let ticking      = false;

    /* Hide stickyNav*/
    if (stickyNav) { stickyNav.style.display = 'none'; }

    window.addEventListener('resize', function () { FOLD = window.innerHeight; }, { passive: true });

    function updateNav() {
      const scrollY = window.scrollY || window.pageYOffset;

      if (scrollY > FOLD) {
        /* Past first fold: hide main nav, show only product bar */
        mainNav.style.transform = 'translateY(-100%)';
        if (stickyBar) { stickyBar.classList.add('is-visible'); stickyBar.removeAttribute('aria-hidden'); }
      } else {
        /* Above first fold: show main nav, hide product bar */
        mainNav.style.transform = 'translateY(0)';
        if (stickyBar) { stickyBar.classList.remove('is-visible'); stickyBar.setAttribute('aria-hidden', 'true'); }
      }
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { updateNav(); ticking = false; });
    }, { passive: true });

    updateNav();
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__hamburger') && !e.target.closest('.nav__links')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Hero Carousel + Zoom logic*/
  const heroTrack    = document.getElementById('heroTrack');
  const heroThumbs   = document.getElementById('heroThumbs');
  const heroPrev     = document.getElementById('heroPrev');
  const heroNext     = document.getElementById('heroNext');
  const heroCarousel = document.getElementById('heroCarousel');
  const zoomPreview  = document.getElementById('zoomPreview');
  const zoomImg      = document.getElementById('zoomImg');

  if (heroTrack && heroCarousel) {
    const heroSlides  = Array.from(heroTrack.querySelectorAll('.hero__slide'));
    const heroTotal   = heroSlides.length;
    let heroCurrent = 0;

    heroSlides.forEach(function (slide, i) {
      const img   = slide.querySelector('img');
      const thumb = document.createElement('div');
      thumb.className = 'hero__thumb' + (i === 0 ? ' is-active' : '');
      thumb.setAttribute('role', 'listitem');
      thumb.setAttribute('tabindex', '0');
      const tImg  = document.createElement('img');
      tImg.src  = img ? img.src : '';
      tImg.alt  = '';
      thumb.appendChild(tImg);
      thumb.addEventListener('click', function () { heroGoTo(i); });
      thumb.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') heroGoTo(i);
      });
      heroThumbs.appendChild(thumb);
    });

    const heroLens = document.createElement('div');
    heroLens.className = 'hero__lens';
    heroCarousel.appendChild(heroLens);

    function heroGoTo(index) {
      heroCurrent = (index + heroTotal) % heroTotal;
      heroTrack.style.transform = 'translateX(-' + (heroCurrent * 100) + '%)';
      heroThumbs.querySelectorAll('.hero__thumb').forEach(function (t, i) {
        t.classList.toggle('is-active', i === heroCurrent);
      });
      const curImg = heroSlides[heroCurrent].querySelector('img');
      if (curImg && zoomImg) zoomImg.src = curImg.src;
    }

    heroPrev.addEventListener('click', function () { heroGoTo(heroCurrent - 1); });
    heroNext.addEventListener('click', function () { heroGoTo(heroCurrent + 1); });

    heroCarousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  heroGoTo(heroCurrent - 1);
      if (e.key === 'ArrowRight') heroGoTo(heroCurrent + 1);
    });

    let heroTouchX = 0;
    heroCarousel.addEventListener('touchstart', function (e) { heroTouchX = e.touches[0].clientX; }, { passive: true });
    heroCarousel.addEventListener('touchend',   function (e) {
      const dx = e.changedTouches[0].clientX - heroTouchX;
      if (Math.abs(dx) > 40) heroGoTo(dx < 0 ? heroCurrent + 1 : heroCurrent - 1);
    });

    heroCarousel.addEventListener('mousemove', function (e) {
      const rect = heroCarousel.getBoundingClientRect();
      const xRel = (e.clientX - rect.left) / rect.width;
      const yRel = (e.clientY - rect.top)  / rect.height;
      const xPct = Math.min(Math.max(xRel * 100, 0), 100);
      const yPct = Math.min(Math.max(yRel * 100, 0), 100);
      heroLens.style.left = (xRel * rect.width)  + 'px';
      heroLens.style.top  = (yRel * rect.height) + 'px';
      if (zoomImg) {
        zoomImg.style.transformOrigin = xPct + '% ' + yPct + '%';
        zoomImg.style.transform       = 'scale(2.5)';
      }
    });
    heroCarousel.addEventListener('mouseleave', function () {
      if (zoomImg) zoomImg.style.transform = 'scale(1)';
    });
  }

  /*Downlaod Modal (datasheet) logic*/
  const downloadBtn  = document.getElementById('downloadBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');
  const modalSubmit  = document.getElementById('modalSubmit');
  const modalEmailEl = document.getElementById('modalEmail');

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (modalEmailEl) modalEmailEl.focus();
    if (modalSubmit)  modalSubmit.classList.remove('is-enabled');
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalEmailEl) { modalEmailEl.value = ''; modalEmailEl.style.borderColor = ''; }
    const phoneEl = document.getElementById('modalPhone');
    if (phoneEl) phoneEl.value = '';
    if (modalSubmit) {
      modalSubmit.classList.remove('is-enabled');
      modalSubmit.textContent  = 'Download Brochure';
      modalSubmit.style.background = '';
    }
  }

  if (modalEmailEl) {
    modalEmailEl.addEventListener('input', function () {
      if (modalSubmit) modalSubmit.classList.toggle('is-enabled', this.value.trim().length > 0);
    });
  }
  if (downloadBtn) downloadBtn.addEventListener('click', openModal);
  if (modalClose)  modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
  }
  if (modalSubmit) {
    modalSubmit.addEventListener('click', function () {
      if (!modalEmailEl || !modalEmailEl.value.trim()) return;
      modalSubmit.textContent  = 'Sent! ✓';
      modalSubmit.style.background = '#16A34A';
      setTimeout(closeModal, 1500);
    });
  }

  /*Request a Quote Modal */
  const quoteOverlay = document.getElementById('quoteModalOverlay');
  const quoteClose   = document.getElementById('quoteModalClose');
  const quoteSubmit  = document.getElementById('quoteSubmit');

  function openQuoteModal() {
    if (!quoteOverlay) return;
    quoteOverlay.classList.add('is-open');
    quoteOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const nameEl = document.getElementById('quoteName');
    if (nameEl) nameEl.focus();
  }
  function closeQuoteModal() {
    if (!quoteOverlay) return;
    quoteOverlay.classList.remove('is-open');
    quoteOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    ['quoteName','quoteCompany','quoteEmail','quotePhone'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    if (quoteSubmit) { quoteSubmit.textContent = 'Submit Form'; quoteSubmit.style.background = ''; }
  }

  document.querySelectorAll('.features__btn, #portfolioTalkBtn').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); openQuoteModal(); });
  });
  const heroCta = document.querySelector('.hero__btn-primary[href="#contact"]');
  if (heroCta) heroCta.addEventListener('click', function (e) { e.preventDefault(); openQuoteModal(); });

  /* Sticky bar */
  const stickyBarCtaBtn = document.getElementById('stickyBarCta');
  if (stickyBarCtaBtn) stickyBarCtaBtn.addEventListener('click', openQuoteModal);

  if (quoteClose)   quoteClose.addEventListener('click', closeQuoteModal);
  if (quoteOverlay) quoteOverlay.addEventListener('click', function (e) { if (e.target === quoteOverlay) closeQuoteModal(); });
  if (quoteSubmit) {
    quoteSubmit.addEventListener('click', function () {
      const nameEl    = document.getElementById('quoteName');
      const companyEl = document.getElementById('quoteCompany');
      const emailEl   = document.getElementById('quoteEmail');
      const phoneEl   = document.getElementById('quotePhone');
      let valid     = true;

      function validateField(el, condition) {
        if (!el) return;
        el.style.borderColor = condition ? '#22C55E' : '#EF4444';
        if (!condition) valid = false;
      }

      validateField(nameEl,    nameEl    && nameEl.value.trim().length > 0);
      validateField(companyEl, companyEl && companyEl.value.trim().length > 0);
      validateField(emailEl,   emailEl   && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()));
      validateField(phoneEl,   phoneEl   && phoneEl.value.trim().length >= 7);

      if (!valid) {
        quoteSubmit.textContent = 'Please fill all fields correctly';
        quoteSubmit.style.background = '#EF4444';
        setTimeout(function () {
          quoteSubmit.textContent = 'Submit Form';
          quoteSubmit.style.background = '';
        }, 2000);
        return;
      }

      quoteSubmit.textContent = 'Submitted! ✓';
      quoteSubmit.style.background = '#16A34A';
      setTimeout(function () {
        closeQuoteModal();
        [nameEl, companyEl, emailEl, phoneEl].forEach(function (f) {
          if (f) { f.style.borderColor = ''; f.value = ''; }
        });
        quoteSubmit.textContent = 'Submit Form';
        quoteSubmit.style.background = '';
      }, 1500);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (modalOverlay  && modalOverlay.classList.contains('is-open'))  closeModal();
    if (quoteOverlay  && quoteOverlay.classList.contains('is-open'))  closeQuoteModal();
  });

  /* Faq Accoridian */
  document.querySelectorAll('.faq__question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const item   = btn.closest('.faq__item');
      const answer = item.querySelector('.faq__answer');
      const isOpen = item.classList.contains('faq__item--open');

      document.querySelectorAll('.faq__item').forEach(function (i) {
        i.classList.remove('faq__item--open');
        i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        i.querySelector('.faq__answer').style.maxHeight = '0';
      });

      if (!isOpen) {
        item.classList.add('faq__item--open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* Request Catalogue — with email validation */
  const requestCatalogueBtn = document.getElementById('requestCatalogueBtn');
  if (requestCatalogueBtn) {
    requestCatalogueBtn.addEventListener('click', function () {
      const catInput = document.querySelector('.faq__catalogue-input');
      if (!catInput) return;
      const emailVal = catInput.value.trim();
      const isValid  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      if (!isValid) {
        catInput.style.borderColor = '#EF4444';
        requestCatalogueBtn.textContent = 'Enter a valid email';
        requestCatalogueBtn.style.background = '#EF4444';
        setTimeout(function () {
          requestCatalogueBtn.textContent = 'Request Catalogue';
          requestCatalogueBtn.style.background = '';
        }, 2000);
        return;
      }
      catInput.style.borderColor = '#22C55E';
      catInput.value = '';
      requestCatalogueBtn.textContent = 'Sent! ✓';
      requestCatalogueBtn.style.background = '#16A34A';
      setTimeout(function () {
        requestCatalogueBtn.textContent = 'Request Catalogue';
        requestCatalogueBtn.style.background = '';
        catInput.style.borderColor = '';
      }, 2000);
    });
  }

  /* Application Carousel  logic*/
  const appsTrack = document.getElementById('appsTrack');
  const appsPrev  = document.getElementById('appsPrev');
  const appsNext  = document.getElementById('appsNext');

  if (appsTrack && appsPrev && appsNext) {
    const CARD_W     = 316;
    let appsOffset = CARD_W;

    setTimeout(function () {
      appsTrack.style.transform = 'translateX(-' + appsOffset + 'px)';
    }, 50);

    function getAppsMax() {
      const totalWidth   = appsTrack.scrollWidth;
      const visibleWidth = appsTrack.parentElement.offsetWidth;
      return Math.max(0, totalWidth - visibleWidth);
    }

    appsPrev.addEventListener('click', function () {
      appsOffset = Math.max(0, appsOffset - CARD_W);
      appsTrack.style.transform = 'translateX(-' + appsOffset + 'px)';
    });

    appsNext.addEventListener('click', function () {
      appsOffset = Math.min(getAppsMax(), appsOffset + CARD_W);
      appsTrack.style.transform = 'translateX(-' + appsOffset + 'px)';
    });

    let appsStartX = 0;
    appsTrack.addEventListener('touchstart', function (e) {
      appsStartX = e.touches[0].clientX;
    }, { passive: true });
    appsTrack.addEventListener('touchend', function (e) {
      const dx = e.changedTouches[0].clientX - appsStartX;
      if (dx < -40) appsNext.click();
      else if (dx > 40) appsPrev.click();
    });
  }

  /* Testimonial Carousel */
  const testimonialsTrack = document.getElementById('testimonialsTrack');
  const testimonialsPrev  = document.getElementById('testimonialsPrev');
  const testimonialsNext  = document.getElementById('testimonialsNext');

  if (testimonialsTrack && testimonialsPrev && testimonialsNext) {
    let tOffset = 0;
    const testimonialsWrap = testimonialsTrack.parentElement;

    function tIsMobileMode() {
      return window.innerWidth <= 800;
    }

    function tCardStep() {
      const firstCard = testimonialsTrack.querySelector('.testimonials__card');
      if (!firstCard) return 0;
      const cardWidth = firstCard.offsetWidth;
      const style = window.getComputedStyle(testimonialsTrack);
      const gap = parseFloat(style.columnGap || style.gap || '0') || 0;
      return cardWidth + gap;
    }

    function tApplyOffset() {
      if (tIsMobileMode()) return;
      testimonialsTrack.style.transform = 'translateX(-' + tOffset + 'px)';
    }

    function tGetMax() {
      return Math.max(0, testimonialsTrack.scrollWidth - testimonialsTrack.parentElement.offsetWidth);
    }

    function tInitPosition() {
      if (tIsMobileMode()) {
        tOffset = 0;
        testimonialsTrack.style.transform = 'translateX(0)';
        if (testimonialsWrap) testimonialsWrap.scrollLeft = 0;
        return;
      }
      const step = tCardStep();
      tOffset = step > 0 ? step : 360;
      tOffset = Math.min(tGetMax(), Math.max(0, tOffset));
      tApplyOffset();
    }

    setTimeout(tInitPosition, 50);

    testimonialsPrev.addEventListener('click', function () {
      if (tIsMobileMode()) return;
      const step = tCardStep();
      tOffset = Math.max(0, tOffset - step);
      tApplyOffset();
    });

    testimonialsNext.addEventListener('click', function () {
      if (tIsMobileMode()) return;
      const step = tCardStep();
      tOffset = Math.min(tGetMax(), tOffset + step);
      tApplyOffset();
    });

    let tStartX = 0;
    testimonialsTrack.addEventListener('touchstart', function (e) {
      tStartX = e.touches[0].clientX;
    }, { passive: true });
    testimonialsTrack.addEventListener('touchend', function (e) {
      const dx = e.changedTouches[0].clientX - tStartX;
      if (dx < -40) testimonialsNext.click();
      else if (dx > 40) testimonialsPrev.click();
    });

    window.addEventListener('resize', function () {
      if (tIsMobileMode()) {
        testimonialsTrack.style.transform = 'translateX(0)';
        tOffset = 0;
        return;
      }
      tOffset = Math.min(tGetMax(), Math.max(0, tOffset));
      tApplyOffset();
    });
  }

  /* CONTACT  SUBMIT — with validation logic*/
  const contactCtaSubmit = document.getElementById('contactCtaSubmit');
  if (contactCtaSubmit) {
    contactCtaSubmit.addEventListener('click', function () {
      const name    = document.querySelector('.contact-cta__form-wrap input[placeholder="Full Name"]');
      const company = document.querySelector('.contact-cta__form-wrap input[placeholder="Company Name"]');
      const email   = document.querySelector('.contact-cta__form-wrap input[placeholder="Email Address"]');
      const phone   = document.querySelector('.contact-cta__phone-input');
      let valid   = true;

      function validate(field, condition) {
        field.style.borderColor = condition ? '#22C55E' : '#EF4444';
        if (!condition) valid = false;
      }

      validate(name,    name.value.trim().length > 0);
      validate(company, company.value.trim().length > 0);
      validate(email,   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
      validate(phone,   phone.value.trim().length >= 7);

      if (!valid) {
        contactCtaSubmit.textContent = 'Please fill all fields correctly';
        contactCtaSubmit.style.background = '#EF4444';
        setTimeout(function () {
          contactCtaSubmit.textContent = 'Request Custom Quote';
          contactCtaSubmit.style.background = '';
        }, 2000);
        return;
      }

      contactCtaSubmit.textContent = 'Submitted! ✓';
      contactCtaSubmit.style.background = '#16A34A';
      setTimeout(function () {
        contactCtaSubmit.textContent = 'Request Custom Quote';
        contactCtaSubmit.style.background = '';
        [name, company, email, phone].forEach(function (f) { f.style.borderColor = ''; f.value = ''; });
      }, 2000);
    });
  }

  /* Manufacturing Process TABS + Mobile Steo/Nav logic*/
  (function initProcessTabs() {
    const tabs      = Array.from(document.querySelectorAll('.process__tab'));
    const panels    = Array.from(document.querySelectorAll('.process__panel'));
    if (!tabs.length || !panels.length) return;

    const mobileStep   = document.getElementById('processMobileStep');
    const mobilePrev   = document.getElementById('processPrevMobile');
    const mobileNext   = document.getElementById('processNextMobile');
    const total        = tabs.length;
    let currentIndex = 0;

    function setActiveByIndex(index) {
      currentIndex = Math.max(0, Math.min(total - 1, index));

      tabs.forEach(function (t, ti) {
        t.classList.toggle('process__tab--active', ti === currentIndex);
        t.setAttribute('aria-selected', ti === currentIndex ? 'true' : 'false');
      });

      panels.forEach(function (p) { p.classList.remove('process__panel--active'); });
      const panel = document.querySelector('.process__panel[data-panel="' + currentIndex + '"]');
      if (panel) panel.classList.add('process__panel--active');

      if (mobileStep) {
        mobileStep.textContent = 'Step ' + (currentIndex + 1) + '/' + total + ': ' + tabs[currentIndex].textContent.trim();
      }
      if (mobilePrev) mobilePrev.disabled = (currentIndex === 0);
      if (mobileNext) mobileNext.disabled = (currentIndex === total - 1);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        setActiveByIndex(Number(tab.getAttribute('data-tab')));
      });
    });

    if (mobilePrev) mobilePrev.addEventListener('click', function () { setActiveByIndex(currentIndex - 1); });
    if (mobileNext) mobileNext.addEventListener('click', function () { setActiveByIndex(currentIndex + 1); });

    const initial = tabs.findIndex(function (t) { return t.classList.contains('process__tab--active'); });
    setActiveByIndex(initial >= 0 ? initial : 0);
  })();

  /* EMAIL LINKS — built at runtime to avoid Cloudflare obfuscation*/
  function makeMailto(user, domain, el) {
    if (!el) return;
    const addr = user + '@' + domain;
    el.innerHTML = '<a href="mailto:' + addr + '" style="color:inherit;">' + addr + '</a>';
  }
  makeMailto('info',    'mangalampipes.com', document.getElementById('ctaEmail'));
  makeMailto('info',    'mangalampipes.com', document.getElementById('footerInfoEmail'));
  makeMailto('support', 'mangalampipes.com', document.getElementById('footerSupportEmail'));

});