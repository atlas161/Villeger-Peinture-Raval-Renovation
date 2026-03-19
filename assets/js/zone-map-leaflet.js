(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = api;
  } else {
    root.ZoneMapLeaflet = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function (root) {
  'use strict';

  /**
   * Module "Zone d'intervention" (Leaflet + OpenStreetMap).
   *
   * Objectif: initialiser de façon fiable une carte Leaflet dans #zone-map,
   * même si d'autres scripts de la page échouent.
   *
   * API publique (window.ZoneMapLeaflet):
   * - initZoneMap({ containerId, rootMargin })
   * - addMarker(containerId, [lat, lng], options)
   * - addPolygon(containerId, latlngs, options)
   * - clearOverlays(containerId)
   * - getInstance(containerId)
   */

  const CHARANTE_POLYGON_LATLNGS = [
    [46.1500, 0.1833], [46.1333, 0.3667], [46.0167, 0.4500], [45.9833, 0.6333],
    [45.9500, 0.6500], [45.8667, 0.6500], [45.7833, 0.6333], [45.7000, 0.6167],
    [45.6167, 0.5833], [45.5333, 0.5167], [45.4500, 0.4333], [45.3833, 0.3167],
    [45.3333, 0.2000], [45.3000, 0.0833], [45.2833, -0.0333], [45.3000, -0.1500],
    [45.3500, -0.2667], [45.4167, -0.3500], [45.5000, -0.4333], [45.5833, -0.4667],
    [45.6667, -0.4500], [45.7500, -0.3333], [45.8333, -0.2000], [45.9167, -0.1167],
    [46.0000, -0.0500], [46.0833, 0.0500], [46.1500, 0.1833]
  ];

  const HEADQUARTERS_LATLNG = [45.6580, 0.1920];
  const ANGOULEME_LATLNG = [45.6484, 0.1560];

  const CITY_LABELS = [
    { name: 'Angoulême', latlng: ANGOULEME_LATLNG, rank: 1 },
    { name: 'Cognac', latlng: [45.6958, -0.3287], rank: 1 },
    { name: 'Périgueux', latlng: [45.1843, 0.7210], rank: 1 },
    { name: 'Poitiers', latlng: [46.5802, 0.3404], rank: 2 },
    { name: 'Niort', latlng: [46.3231, -0.4588], rank: 2 },
    { name: 'Saintes', latlng: [45.7466, -0.6313], rank: 2 },
    { name: 'Barbezieux', latlng: [45.4739, -0.1523], rank: 2 },
    { name: 'Mansle', latlng: [45.8753, 0.1774], rank: 2 },
    { name: 'Jarnac', latlng: [45.6812, -0.1760], rank: 3 },
    { name: 'Ruffec', latlng: [46.0286, 0.1992], rank: 3 },
    { name: 'La Rochefoucauld', latlng: [45.7409, 0.3869], rank: 3 }
  ];

  const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const OSM_TILE_SUBDOMAINS = 'abc';

  const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  const LEAFLET_CSS_INTEGRITY = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';

  const LEAFLET_JS_CDNS = [
    {
      url: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
      integrity: 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    },
    {
      url: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
      integrity: ''
    }
  ];

  const MAP_READY_TIMEOUT_MS = 3500;
  const LEAFLET_WAIT_TIMEOUT_MS = 7000;
  const TILE_ERROR_THRESHOLD = 3;
  const FIT_PADDING = [18, 18];
  const FIT_MAX_ZOOM = 9;
  const MOBILE_MAX_ZOOM = 8;
  const MOBILE_DEZOOM_STEPS = 0;

  const ROUTE_URL =
    'https://www.google.com/maps/dir/?api=1&destination=136+Avenue+de+la+R%C3%A9publique,+16340+L%27Isle-d%27Espagnac';

  const FALLBACK_HTML = [
    '<div class="zone-map-fallback" role="note" aria-label="Carte indisponible">',
    '<div class="zone-map-fallback-title">Carte temporairement indisponible</div>',
    '<div class="zone-map-fallback-text">Consultez la zone d’intervention directement sur OpenStreetMap.</div>',
    '<a class="zone-map-fallback-link" href="https://www.openstreetmap.org/search?query=Charente%2C%20France#map=9/45.71/0.15" target="_blank" rel="noopener noreferrer">Ouvrir OpenStreetMap</a>',
    '</div>'
  ].join('');

  const NO_FALLBACK = { applied: false };

  function getCharentePolygonLatLngs() {
    return CHARANTE_POLYGON_LATLNGS.slice();
  }

  function getCharenteBounds() {
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    for (const [lat, lng] of CHARANTE_POLYGON_LATLNGS) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }

    return { southWest: [minLat, minLng], northEast: [maxLat, maxLng] };
  }

  function getBoundsCenter(bounds) {
    const lat = (bounds.southWest[0] + bounds.northEast[0]) / 2;
    const lng = (bounds.southWest[1] + bounds.northEast[1]) / 2;
    return [lat, lng];
  }

  function isAspectRatio16by9(width, height, tolerance = 0.02) {
    if (!Number.isFinite(width) || !Number.isFinite(height) || height <= 0) return false;
    const ratio = width / height;
    const target = 16 / 9;
    return Math.abs(ratio - target) <= target * tolerance;
  }

  function getAngoulemeLatLng() {
    return ANGOULEME_LATLNG.slice();
  }

  function getStaticMapOptions() {
    return {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      dragging: false,
      touchZoom: false,
      tap: false,
      preferCanvas: true,
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false,
      inertia: false,
      updateWhenZooming: false,
      updateWhenIdle: true,
      bounceAtZoomLimits: false
    };
  }

  function getRouteUrl() {
    return ROUTE_URL;
  }

  function applyFallback(mapContainer) {
    if (!mapContainer || mapContainer.dataset.osmFallbackApplied === '1') return NO_FALLBACK;
    mapContainer.dataset.osmFallbackApplied = '1';
    mapContainer.classList.remove('map-loading');
    mapContainer.classList.add('map-loaded');
    mapContainer.classList.add('osm-fallback');
    mapContainer.innerHTML = FALLBACK_HTML;
    return { applied: true };
  }

  function ensureLeafletCss() {
    if (!root.document) return;
    const hasLeafletCss = root.document.querySelector('link[href*="leaflet"][rel="stylesheet"]');
    if (hasLeafletCss) return;

    const link = root.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS_URL;
    link.integrity = LEAFLET_CSS_INTEGRITY;
    link.crossOrigin = '';
    root.document.head.appendChild(link);
  }

  function ensureLeafletScript() {
    if (!root.document) return;
    if (typeof root.L !== 'undefined') return;
    if (root.document.querySelector('script[data-leaflet="1"]')) return;

    let cdnIndex = 0;
    const s = root.document.createElement('script');
    s.async = true;
    s.dataset.leaflet = '1';

    const setCdn = (idx) => {
      const cdn = LEAFLET_JS_CDNS[idx];
      s.src = cdn.url;
      if (cdn.integrity) s.integrity = cdn.integrity;
      s.crossOrigin = '';
    };

    s.onerror = () => {
      cdnIndex += 1;
      if (cdnIndex < LEAFLET_JS_CDNS.length) {
        setCdn(cdnIndex);
        return;
      }
    };

    setCdn(cdnIndex);
    root.document.head.appendChild(s);
  }

  function ensureReadyContainer(mapContainer) {
    if (!mapContainer) return false;
    if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) return false;
    return true;
  }

  function setStatus(mapContainer, status) {
    if (!mapContainer) return;
    if (status === 'loading') {
      mapContainer.classList.add('map-loading');
      mapContainer.classList.remove('map-loaded');
      return;
    }
    if (status === 'loaded') {
      mapContainer.classList.remove('map-loading');
      mapContainer.classList.add('map-loaded');
      return;
    }
  }

  function getInstance(containerId) {
    const id = typeof containerId === 'string' ? containerId : 'zone-map';
    const el = root.document && root.document.getElementById(id);
    return el && el.__zoneLeafletInstance ? el.__zoneLeafletInstance : null;
  }

  function ensureRouteButton(mapContainer) {
    if (!root.document || !mapContainer) return;
    if (mapContainer.querySelector('.zone-map-route')) return;

    const link = root.document.createElement('a');
    link.className = 'zone-map-route zone-address-cta';
    link.href = getRouteUrl();
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = "Lancer l'itinéraire <i class=\"fa-solid fa-arrow-right\" aria-hidden=\"true\"></i>";
    mapContainer.appendChild(link);
  }

  function getRegionBounds(L) {
    const points = [
      ANGOULEME_LATLNG, // Angoulême
      [45.6958, -0.3287], // Cognac
      [45.7466, -0.6313], // Saintes
      [45.1843, 0.7210], // Périgueux
      HEADQUARTERS_LATLNG
    ];
    return L.latLngBounds(points);
  }

  function getViewportWidth() {
    if (root.visualViewport && typeof root.visualViewport.width === 'number') return root.visualViewport.width;
    if (typeof root.innerWidth === 'number') return root.innerWidth;
    return 1024;
  }

  function getCityLabelsForViewport(viewportWidth) {
    const w = Number.isFinite(viewportWidth) ? viewportWidth : 1024;
    if (w <= 420) return CITY_LABELS.filter((c) => c.rank <= 1);
    if (w <= 768) return CITY_LABELS.filter((c) => c.rank <= 2);
    return CITY_LABELS.slice();
  }

  function addCityLabels(mapContainer, map, renderer) {
    if (!mapContainer || !map || typeof root.L === 'undefined') return;
    if (mapContainer.dataset.osmCityLabelsInit === '1') return;
    mapContainer.dataset.osmCityLabelsInit = '1';

    const L = root.L;
    const labels = getCityLabelsForViewport(getViewportWidth());
    for (const city of labels) {
      const dot = L.circleMarker(city.latlng, {
        radius: 4,
        color: '#673A12',
        weight: 1,
        opacity: 0.9,
        fillColor: '#FBF7F1',
        fillOpacity: 0.95,
        interactive: false,
        renderer
      }).addTo(map);

      dot.bindTooltip(city.name, {
        permanent: true,
        direction: 'top',
        offset: [0, -8],
        className: 'zone-city-label',
        opacity: 1
      });
    }
  }

  function computeStaticZoom(map, bounds) {
    const viewportWidth = getViewportWidth();
    const isMobile = viewportWidth <= 768;
    const maxZoom = isMobile ? MOBILE_MAX_ZOOM : FIT_MAX_ZOOM;
    let z = Math.min(map.getBoundsZoom(bounds, false, FIT_PADDING), maxZoom);
    if (isMobile) z = Math.max(0, z - MOBILE_DEZOOM_STEPS);
    return z;
  }

  function attachResizeHandler(mapContainer, map, bounds) {
    const inst = mapContainer.__zoneLeafletInstance;
    if (!inst || inst.resizeAttached) return;
    inst.resizeAttached = true;
    inst.staticBounds = bounds;

    let t = null;
    const onResize = function () {
      if (t) root.clearTimeout(t);
      t = root.setTimeout(function () {
        const z = computeStaticZoom(map, bounds);
        map.setView(ANGOULEME_LATLNG, z, { animate: false });
        map.setMinZoom(z);
        map.setMaxZoom(z);
        map.invalidateSize(true);
      }, 120);
    };

    if (typeof root.addEventListener === 'function') {
      root.addEventListener('resize', onResize, { passive: true });
      root.addEventListener('orientationchange', onResize, { passive: true });
    }

    if (root.visualViewport && typeof root.visualViewport.addEventListener === 'function') {
      root.visualViewport.addEventListener('resize', onResize, { passive: true });
    }

    if (typeof root.ResizeObserver === 'function') {
      try {
        const ro = new root.ResizeObserver(onResize);
        ro.observe(mapContainer);
        inst.resizeObserver = ro;
      } catch (_) {}
    }
  }

  function startMap(mapContainer) {
    if (typeof root.L === 'undefined') return { missingLeaflet: true };
    if (mapContainer.dataset.osmMapInit === '1') return { started: false };
    mapContainer.dataset.osmMapInit = '1';

    if (mapContainer.dataset.osmFallbackApplied === '1') {
      mapContainer.innerHTML = '';
      mapContainer.classList.remove('osm-fallback');
      delete mapContainer.dataset.osmFallbackApplied;
    }

    mapContainer.innerHTML = '';
    mapContainer.classList.remove('osm-fallback');
    delete mapContainer.dataset.osmFallbackApplied;
    setStatus(mapContainer, 'loading');

    const L = root.L;
    const renderer = L.canvas({ padding: 0.55 });
    const mapOptions = getStaticMapOptions();
    mapOptions.renderer = renderer;
    const map = L.map(mapContainer, mapOptions);

    mapContainer.__zoneLeafletInstance = {
      map,
      overlays: []
    };

    if (map.attributionControl && map.attributionControl.setPrefix) {
      map.attributionControl.setPrefix('');
    }

    const polygon = L.polygon(getCharentePolygonLatLngs(), {
      color: '#673A12',
      weight: 2,
      opacity: 0.9,
      fillColor: '#A88B5E',
      fillOpacity: 0.14,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: false,
      renderer
    }).addTo(map);

    const bounds = getRegionBounds(L);
    const z = computeStaticZoom(map, bounds);
    map.setView(ANGOULEME_LATLNG, z, { animate: false });
    map.setMinZoom(z);
    map.setMaxZoom(z);
    attachResizeHandler(mapContainer, map, bounds);
    map.invalidateSize(true);

    let tileLoaded = false;
    let tileErrors = 0;

    const tiles = L.tileLayer(OSM_TILE_URL, {
      attribution: '&copy; OpenStreetMap',
      subdomains: OSM_TILE_SUBDOMAINS,
      maxZoom: 19,
      opacity: 0.9,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 1,
      className: 'osm-tiles',
      detectRetina: true,
      crossOrigin: true
    })
      .on('tileload', function () {
        if (!tileLoaded) {
          tileLoaded = true;
          setStatus(mapContainer, 'loaded');
          setTimeout(() => map.invalidateSize(true), 0);
          ensureRouteButton(mapContainer);
        }
      })
      .on('tileerror', function () {
        tileErrors += 1;
        if (!tileLoaded && tileErrors >= TILE_ERROR_THRESHOLD) {
          try {
            map.remove();
          } catch (_) {}
          applyFallback(mapContainer);
        }
      })
      .addTo(map);

    setTimeout(function () {
      if (!tileLoaded) {
        try {
          tiles.remove();
          map.remove();
        } catch (_) {}
        applyFallback(mapContainer);
      }
    }, MAP_READY_TIMEOUT_MS);

    const hqIcon = L.divIcon({
      className: 'hq-marker-centered',
      html: '<div class="hq-pulse-ring"></div><div class="hq-marker-dot"></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    L.marker(HEADQUARTERS_LATLNG, {
      icon: hqIcon,
      zIndexOffset: 1000,
      alt: "Siège VPRR - 136 Avenue de la République, L'Isle-d'Espagnac",
      title: "Siège VPRR - L'Isle-d'Espagnac"
    }).addTo(map);
    ensureRouteButton(mapContainer);
    addCityLabels(mapContainer, map, renderer);

    return { started: true };
  }

  function initZoneMap(options) {
    const opts = options || {};
    const containerId = typeof opts.containerId === 'string' ? opts.containerId : 'zone-map';
    const mapContainer = root.document && root.document.getElementById(containerId);
    if (!mapContainer) return { ok: false };
    if (mapContainer.dataset.zoneMapBooted === '1') return { ok: true, mode: 'already' };

    const run = function () {
      if (!ensureReadyContainer(mapContainer)) {
        setTimeout(run, 200);
        return;
      }

      mapContainer.dataset.zoneMapBooted = '1';
      setStatus(mapContainer, 'loading');

      const attempt = startMap(mapContainer);
      if (attempt && attempt.started === false) return;
      if (attempt && attempt.missingLeaflet !== true) return;

      ensureLeafletCss();
      ensureLeafletScript();

      const startAt = Date.now();
      const checkLeaflet = setInterval(function () {
        if (typeof root.L !== 'undefined') {
          clearInterval(checkLeaflet);
          startMap(mapContainer);
        } else if (Date.now() - startAt > LEAFLET_WAIT_TIMEOUT_MS) {
          clearInterval(checkLeaflet);
          applyFallback(mapContainer);
        }
      }, 250);
    };

    if ('IntersectionObserver' in root) {
      const observer = new root.IntersectionObserver(
        function (entries) {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              observer.disconnect();
              run();
              break;
            }
          }
        },
        { rootMargin: typeof opts.rootMargin === 'string' ? opts.rootMargin : '200px', threshold: 0.01 }
      );
      observer.observe(mapContainer);

      try {
        const rect = mapContainer.getBoundingClientRect();
        const marginPx = parseInt(typeof opts.rootMargin === 'string' ? opts.rootMargin : '200px', 10) || 0;
        if (rect.bottom >= -marginPx && rect.top <= (root.innerHeight || 0) + marginPx) {
          run();
        }
      } catch (_) {}

      return { ok: true, mode: 'observer' };
    }

    run();
    return { ok: true, mode: 'immediate' };
  }

  function addMarker(containerId, latlng, options) {
    const inst = getInstance(containerId);
    if (!inst || !inst.map || typeof root.L === 'undefined') return null;
    const L = root.L;
    const marker = L.marker(latlng, options || {}).addTo(inst.map);
    inst.overlays.push(marker);
    return marker;
  }

  function addPolygon(containerId, latlngs, options) {
    const inst = getInstance(containerId);
    if (!inst || !inst.map || typeof root.L === 'undefined') return null;
    const L = root.L;
    const polygon = L.polygon(latlngs, options || {}).addTo(inst.map);
    inst.overlays.push(polygon);
    return polygon;
  }

  function clearOverlays(containerId) {
    const inst = getInstance(containerId);
    if (!inst) return;
    for (const layer of inst.overlays) {
      try {
        layer.remove();
      } catch (_) {}
    }
    inst.overlays = [];
  }

  function autoInit() {
    try {
      initZoneMap({ containerId: 'zone-map', rootMargin: '200px' });
    } catch (_) {}
  }

  if (root && root.document) {
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', autoInit, { once: true });
    } else {
      setTimeout(autoInit, 0);
    }
    root.addEventListener('pageshow', autoInit);
  }

  return {
    initZoneMap,
    getAngoulemeLatLng,
    getStaticMapOptions,
    getRouteUrl,
    addMarker,
    addPolygon,
    clearOverlays,
    getInstance,
    getCharentePolygonLatLngs,
    getCharenteBounds,
    getBoundsCenter,
    isAspectRatio16by9
  };
});
