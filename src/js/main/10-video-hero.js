/**
 * Hero : la page s'affiche tout de suite (image d'attente en CSS). La vidéo Vimeo démarre
 * (Vimeo adapte la qualité) et apparaît en fondu par-dessus l'image d'attente ; on force le mode auto après 3 s.
 */

const shouldLoadHeroVideo = () => {
  const conn = navigator.connection || {};
  if (conn.saveData) return false;
  if (/(^|slow-)2g|3g/.test(conn.effectiveType || '')) return false;
  return true;
};

// Charge l'API Vimeo une seule fois (script injecté à la demande).
const ensureVimeoApi = () => new Promise((resolve, reject) => {
  if (window.Vimeo && window.Vimeo.Player) return resolve();
  const existing = document.querySelector('script[data-vimeo-player-api]');
  if (existing) {
    existing.addEventListener('load', () => resolve(), { once: true });
    existing.addEventListener('error', () => reject(new Error('Vimeo Player API load error')), { once: true });
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://player.vimeo.com/api/player.js';
  s.async = true;
  s.setAttribute('data-vimeo-player-api', '1');
  s.addEventListener('load', () => resolve(), { once: true });
  s.addEventListener('error', () => reject(new Error('Vimeo Player API load error')), { once: true });
  document.head.appendChild(s);
});

const startHeroVideo = (heroVimeo) => {
  heroVimeo.src = heroVimeo.dataset.src;
  const showVideo = () => heroVimeo.classList.add('is-playing');
  // Filet de sécurité : si l'API Vimeo ne répond pas, on affiche quand même la vidéo au bout de 4 s.
  const fallbackTimer = window.setTimeout(showVideo, 4000);

  ensureVimeoApi()
    .then(() => {
      const player = new window.Vimeo.Player(heroVimeo);
      let isReady = false;
      const onTimeUpdate = (data) => {
        const t = data && typeof data.seconds === 'number' ? data.seconds : 0;
        if (t > 0.05 && !isReady) {
          isReady = true;
          window.clearTimeout(fallbackTimer);
          showVideo();
          try { player.off('timeupdate', onTimeUpdate); } catch (_) {}
          // Montée en qualité progressive : on repasse en automatique après quelques secondes de lecture.
          window.setTimeout(() => {
            try { player.setQuality('auto').catch(() => {}); } catch (_) {}
          }, 3000);
        }
      };
      player.on('timeupdate', onTimeUpdate);
    })
    .catch(() => { window.clearTimeout(fallbackTimer); showVideo(); });
};

const initHeroVideo = () => {
  const heroBg = document.querySelector('.hero-bg');
  const heroVimeo = heroBg ? heroBg.querySelector('iframe.hero-video') : null;
  if (!heroBg || !heroVimeo) return;

  if (prefersReducedMotion()) {
    heroVimeo.remove();
  } else if (!shouldLoadHeroVideo()) {
    // Économiseur de données ou connexion lente : on garde l'image d'attente (la vidéo pèse ~19 Mo).
    // La vidéo se lance sur tous les écrans (téléphone et tablette compris) dans les autres cas.
    heroVimeo.remove();
  } else {
    startHeroVideo(heroVimeo);
  }
};
