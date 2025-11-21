// Initialisation du comportement de la page
document.addEventListener("DOMContentLoaded", () => {
  const preloader = document.getElementById('preloader');
  const bar = preloader ? preloader.querySelector('.progress .fill') : null;
  if (bar) bar.style.width = '40%';
  // Gestion du bouton burger et de l’ouverture/fermeture du menu
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".primary-nav");
  const navLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link'));
  const navButtons = Array.from(document.querySelectorAll('.primary-nav .menu a.btn'));
  navButtons.forEach((b) => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
  const setActive = (link) => {
    navLinks.forEach(a => {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    });
    if (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  };

  if (burger && nav) {
    burger.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    });

    // Fermeture avec la touche Échap (accessibilité)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
        burger.focus();
      }
    }, { passive: true });

    // Fermer le menu après un clic sur un lien de navigation (mobile)
    nav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", (e) => {
        setActive(link);
        // fermeture menu mobile
        nav.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove('nav-open');
        // scroll doux quand nécessaire
        const href = link.getAttribute('href') || '';
        if (href === '#top') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, { passive: true });
    });

    // Navigation clavier entre les liens (flèches gauche/droite)
    navLinks.forEach((a, idx) => {
      a.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = navLinks[(idx + 1) % navLinks.length];
          next.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = navLinks[(idx - 1 + navLinks.length) % navLinks.length];
          prev.focus();
        }
      });
    });
  }


  // Mettre l’année en pied de page
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const topLinks = document.querySelectorAll('a[href="#top"]');
  topLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const sectionLinks = Array.from(document.querySelectorAll('.primary-nav .menu a.nav-link[href^="#"]'));
  const idFromHref = (href) => href.replace('#','');
  const targets = sectionLinks
    .map(a => ({ a, el: document.getElementById(idFromHref(a.getAttribute('href'))) }))
    .filter(x => !!x.el);

  const observeSections = () => {
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const id = entry.target.id;
          const link = sectionLinks.find(a => idFromHref(a.getAttribute('href')) === id);
          if (!link) return;
          if (entry.isIntersecting) {
            setActive(link);
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0.25 });
      targets.forEach(t => io.observe(t.el));
      return;
    }
    // Fallback: scroll spy basique
    const onScroll = () => {
      let best = null;
      targets.forEach(({ a, el }) => {
        const rect = el.getBoundingClientRect();
        const score = Math.min(Math.abs(rect.top), Math.abs(rect.bottom));
        if (best === null || score < best.score) best = { a, score };
      });
      if (best) setActive(best.a);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  observeSections();

  

  window.addEventListener('load', () => {
    if (bar) bar.style.width = '100%';
    if (preloader) {
      preloader.classList.add('hide');
      setTimeout(() => { preloader.remove(); }, 300);
    }
  }, { once: true });
  
});