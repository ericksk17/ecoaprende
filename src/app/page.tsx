'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { places, tips, carouselSlides, type Place } from './lib/data';
import DetailModal, { type DetailData } from './components/DetailModal';
import ReportModal from './components/ReportModal';
import ProfileMenu from './components/ProfileMenu';
import MapScreen from './components/MapScreen';
import ReportsScreen from './components/ReportsScreen';
import AdminReportsScreen from './components/AdminReportsScreen';
import FlutterIcon from './components/FlutterIcon';
import StatusBar from './components/StatusBar';

type Screen = 'home' | 'places' | 'tips' | 'info' | 'reports' | 'admin';

// ---------- localStorage with reactive subscribe ----------
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}
function notifyListeners() {
  listeners.forEach(cb => cb());
}
function getSnapshot<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = localStorage.getItem(key);
    return (v === null ? fallback : v) as T;
  } catch {
    return fallback;
  }
}
function getServerSnapshot<T>(fallback: T): T {
  return fallback;
}
function useLocalStorageValue(key: string, fallback: string): string {
  return useSyncExternalStore(
    subscribe,
    () => getSnapshot(key, fallback),
    () => getServerSnapshot(fallback)
  );
}

// Theme is stored as '' (light) or 'dark'
function useTheme(): [boolean, () => void] {
  const stored = useLocalStorageValue('eco-theme', '');
  const isDark = stored === 'dark';
  const toggle = () => {
    const next = isDark ? '' : 'dark';
    try { localStorage.setItem('eco-theme', next); } catch { /* ignore */ }
    document.documentElement.setAttribute('data-theme', next);
    // Notify all useSyncExternalStore subscribers so React re-renders
    notifyListeners();
  };
  // Apply attribute on client (the inline script in layout already does this on first paint)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', stored);
  }, [stored]);
  return [isDark, toggle];
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const storedAppName = useLocalStorageValue('eco-app-name', 'Ometepe Palehuia');
  const appName = storedAppName || 'Ometepe Palehuia';
  const [isDark, toggleTheme] = useTheme();

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<DetailData>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);

  const [heroLightbox, setHeroLightbox] = useState<string | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Carousel auto-scroll & observer
  useEffect(() => {
    const c = carouselRef.current;
    if (!c) return;

    const onScroll = () => {
      const slides = c.querySelectorAll('.eco-slide');
      const cRect = c.getBoundingClientRect();
      let bestIdx = 0;
      let bestDist = Infinity;
      slides.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        const center = r.left + r.width / 2;
        const cCenter = cRect.left + cRect.width / 2;
        const d = Math.abs(center - cCenter);
        if (d < bestDist) { bestDist = d; bestIdx = i; }
      });
      setActiveSlide(bestIdx);
    };
    c.addEventListener('scroll', onScroll, { passive: true });
    return () => c.removeEventListener('scroll', onScroll as any);
  }, [screen]);

  // Auto rotate every 5s when on home
  useEffect(() => {
    if (screen !== 'home') return;
    const id = setInterval(() => {
      const c = carouselRef.current;
      if (!c) return;
      const next = (activeSlide + 1) % carouselSlides.length;
      const slides = c.querySelectorAll('.eco-slide');
      if (slides[next]) {
        (slides[next] as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [screen, activeSlide]);

  // App name editing
  const editAppName = () => {
    const v = prompt('Editar nombre de la app', appName);
    if (v !== null) {
      const clean = v.trim() || appName;
      try {
        localStorage.setItem('eco-app-name', clean);
        notifyListeners();
      } catch { /* ignore */ }
    }
  };

  // Open detail for a place
  const openPlace = (p: Place) => {
    setDetailData({
      title: p.title,
      text: p.text,
      gallery: p.gallery,
    });
    setDetailOpen(true);
  };

  // Open detail for a tip
  const openTip = (t: typeof tips[number]) => {
    setDetailData({
      title: t.title,
      text: t.text,
      gallery: [`/${t.img}`],
    });
    setDetailOpen(true);
  };

  // Search filtering
  const q = searchQuery.toLowerCase().trim();
  const filteredPlaces = q
    ? places.filter(p => (p.title + ' ' + p.text).toLowerCase().includes(q))
    : places;
  const filteredTips = q
    ? tips.filter(t => (t.title + ' ' + t.text).toLowerCase().includes(q))
    : tips;

  // When user searches, switch to relevant screen automatically (derived, not effect)
  let effectiveScreen = screen;
  if (q) {
    if (filteredTips.length && !filteredPlaces.length && screen !== 'tips') {
      // don't auto-switch; let user pick — but show inline results in current screen
    }
  }

  return (
    <div className="eco-device" role="application" aria-label="ecoOmetepe app">
      {/* Status bar removed per user request */}

      {/* ===== Desktop NavigationRail (Material 3) — hidden on mobile, visible ≥ 768px ===== */}
      <aside className="eco-nav-rail" aria-label="Navegación de escritorio">
        <div className="eco-nav-rail-brand">
          <img
            src="/icon_128x128.png"
            alt="Logo Ometepe Palehuia"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="eco-nav-rail-brand-text">
            <div
              className="eco-nav-rail-brand-title"
              onClick={editAppName}
              title="Toca para editar el nombre de la app"
            >
              <span>{appName}</span>
              <img
                src="/nicaragua-flag.svg"
                alt="Bandera de Nicaragua"
                className="eco-flag-mini"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <div className="eco-nav-rail-brand-sub">Guardianes de Altagracia</div>
          </div>
        </div>

        <nav className="eco-nav-rail-list" aria-label="Secciones">
          <button
            className={`eco-nav-rail-item ${effectiveScreen === 'home' ? 'active' : ''}`}
            onClick={() => setScreen('home')}
          >
            <span className="eco-rail-icon">
              <FlutterIcon
                name="home"
                size={24}
                fill={effectiveScreen === 'home' ? 1 : 0}
                weight={effectiveScreen === 'home' ? 700 : 400}
              />
            </span>
            <span className="eco-rail-label">Inicio</span>
          </button>
          <button
            className={`eco-nav-rail-item ${effectiveScreen === 'places' ? 'active' : ''}`}
            onClick={() => { setScreen('places'); setSearchOpen(false); setSearchQuery(''); }}
          >
            <span className="eco-rail-icon">
              <FlutterIcon
                name="map"
                size={24}
                fill={effectiveScreen === 'places' ? 1 : 0}
                weight={effectiveScreen === 'places' ? 700 : 400}
              />
            </span>
            <span className="eco-rail-label">Mapa ecológico</span>
          </button>
          <button
            className={`eco-nav-rail-item ${effectiveScreen === 'tips' ? 'active' : ''}`}
            onClick={() => { setScreen('tips'); setSearchOpen(false); setSearchQuery(''); }}
          >
            <span className="eco-rail-icon">
              <FlutterIcon
                name="eco"
                size={24}
                fill={effectiveScreen === 'tips' ? 1 : 0}
                weight={effectiveScreen === 'tips' ? 700 : 400}
              />
            </span>
            <span className="eco-rail-label">Consejos</span>
          </button>
          <button
            className={`eco-nav-rail-item ${effectiveScreen === 'reports' ? 'active' : ''}`}
            onClick={() => { setScreen('reports'); setSearchOpen(false); setSearchQuery(''); }}
          >
            <span className="eco-rail-icon">
              <FlutterIcon
                name="assignment"
                size={24}
                fill={effectiveScreen === 'reports' ? 1 : 0}
                weight={effectiveScreen === 'reports' ? 700 : 400}
              />
            </span>
            <span className="eco-rail-label">Reportes</span>
          </button>
          <button
            className={`eco-nav-rail-item ${effectiveScreen === 'info' ? 'active' : ''}`}
            onClick={() => { setScreen('info'); setSearchOpen(false); setSearchQuery(''); }}
          >
            <span className="eco-rail-icon">
              <FlutterIcon
                name="menu_book"
                size={24}
                fill={effectiveScreen === 'info' ? 1 : 0}
                weight={effectiveScreen === 'info' ? 700 : 400}
              />
            </span>
            <span className="eco-rail-label">Información</span>
          </button>
        </nav>

        <div className="eco-nav-rail-footer">
          <div className="eco-nav-rail-theme-row">
            <button
              className={`eco-nav-rail-theme-btn ${!isDark ? 'active' : ''}`}
              onClick={() => { if (isDark) toggleTheme(); }}
              aria-label="Tema claro"
            >
              <FlutterIcon name="light_mode" size={18} fill={!isDark ? 1 : 0} />
              Claro
            </button>
            <button
              className={`eco-nav-rail-theme-btn ${isDark ? 'active' : ''}`}
              onClick={() => { if (!isDark) toggleTheme(); }}
              aria-label="Tema oscuro"
            >
              <FlutterIcon name="dark_mode" size={18} fill={isDark ? 1 : 0} />
              Oscuro
            </button>
          </div>
          <ProfileMenu onOpenReports={() => setScreen('reports')} onOpenAdmin={() => setScreen('admin')} railMode />
        </div>
      </aside>

      {/* Header */}
      <header className="eco-header">
        <div className="eco-header-left">
          <button
            className="eco-icon-btn"
            aria-label="Buscar"
            onClick={() => {
              const next = !searchOpen;
              setSearchOpen(next);
              if (!next) setSearchQuery('');
            }}
          >
            <FlutterIcon name="search" size={24} weight={400} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, alignItems: 'center' }}>
          <div
            className="eco-title"
            onClick={editAppName}
            title="Toca para editar el nombre de la app"
          >
            <img
              src="/icon_128x128.png"
              alt="Logo Ometepe Palehuia"
              className="eco-app-icon"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = 'eco';
                span.style.marginRight = '8px';
                span.style.fontSize = '20px';
                span.style.verticalAlign = 'middle';
                img.parentNode?.insertBefore(span, img);
              }}
            />
            <span>{appName}</span>
            <img
              src="/nicaragua-flag.svg"
              alt="Bandera de Nicaragua"
              className="eco-flag-mini"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <div className="eco-subtitle">Guardianes de Altagracia</div>
        </div>

        <div className="eco-header-right">
          <button
            className={`eco-icon-btn ${isDark ? 'theme-dark' : ''}`}
            aria-label="Cambiar tema"
            onClick={toggleTheme}
          >
            <FlutterIcon name={isDark ? 'light_mode' : 'dark_mode'} size={22} fill={isDark ? 1 : 0} />
          </button>
          <ProfileMenu onOpenReports={() => setScreen('reports')} onOpenAdmin={() => setScreen('admin')} />
        </div>

        {/* Search bar — overlay on mobile (toggle), inline on desktop (CSS-controlled) */}
        <div className={`eco-search-wrap ${searchOpen ? 'open' : ''}`}>
          <FlutterIcon name="search" size={22} color="var(--m3-on-surface-variant)" />
          <input
            type="search"
            placeholder="Buscar lugares o consejos..."
            aria-label="Buscar"
            value={searchQuery}
            autoFocus={searchOpen}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="eco-icon-btn eco-search-close"
            aria-label="Cerrar búsqueda"
            onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
          >
            <FlutterIcon name="close" size={22} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="eco-main">
        {/* Home Screen */}
        <section className={`eco-screen ${effectiveScreen === 'home' ? 'active' : ''}`}>
          <div className="eco-hero">
            <div className="eco-carousel-wrap">
              <div className="eco-carousel" ref={carouselRef}>
                {carouselSlides.map(s => (
                  <div
                    key={s.id}
                    className="eco-slide eco-hero-clickable"
                    onClick={() => {
                      setHeroLightbox(s.img);
                    }}
                  >
                    <img src={s.img} alt={s.title} loading="lazy" />
                    <div className="eco-caption">{s.title}</div>
                    <div className="eco-hero-zoom-hint">
                      <FlutterIcon name="zoom_in" size={20} color="#fff" fill={1} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="eco-carousel-indicators">
                {carouselSlides.map((_, i) => (
                  <button
                    key={i}
                    className={`eco-ind-dot ${i === activeSlide ? 'active' : ''}`}
                    onClick={() => {
                      const c = carouselRef.current;
                      if (!c) return;
                      const slides = c.querySelectorAll('.eco-slide');
                      (slides[i] as HTMLElement)?.scrollIntoView({
                        behavior: 'smooth',
                        inline: 'center',
                        block: 'nearest',
                      });
                    }}
                    aria-label={`Ir a slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="eco-hero-actions" role="group" aria-label="Acciones principales">
              <div style={{ flex: 1 }} />
              <button
                className="eco-action-btn"
                onClick={() => setReportOpen(true)}
                style={{ maxWidth: 280 }}
              >
                <span className="a-icon">
                  <FlutterIcon name="report" size={22} fill={1} />
                </span>
                <span className="eco-a-label">Reportar problema</span>
              </button>
              <div style={{ flex: 1 }} />
            </div>

            <div className="eco-info-card" style={{ marginTop: 10 }}>
              <h3>Por qué y cómo cuidar Ometepe</h3>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, lineHeight: 1.4, color: 'var(--eco-text)' }}>
                <li><strong>Reciclar:</strong> Reduce la contaminación, evita que residuos lleguen al lago y fomenta la economía local.</li>
                <li><strong>No tirar basura:</strong> Protege la fauna y la calidad del agua; la basura provoca daños a animales y ecosistemas.</li>
                <li><strong>Proteger playas, ríos y bosques:</strong> Evita verter químicos, respeta senderos y participa en limpiezas para mantener hábitats sanos.</li>
                <li><strong>Turismo ecológico:</strong> Apoya guías y emprendimientos locales; el turismo responsable genera recursos para conservación.</li>
              </ul>
            </div>

            <div className="eco-info-card" style={{ marginTop: 10 }}>
              <h3>Conoce Ometepe</h3>
              <p>
                Ometepe no es una isla cualquiera: es el corazón palpitante de Nicaragua y uno de los rincones
                más auténticos de todo Centroamérica. Formada por dos volcanes gigantes — el activo
                <strong> Volcán Concepción</strong> y el místico <strong>Volcán Maderas</strong> — emergiendo
                de las aguas sagradas del <strong>Lago Cocibolca</strong>, este lugar te agarra el alma desde
                el primer vistazo.
              </p>
              <p>
                Es naturaleza en estado puro: playas de arena negra, ojos de agua cristalina y más de
                <strong> 1,700 petroglifos</strong> que cuentan historias de los antiguos chorotegas. Por eso
                la <strong>UNESCO</strong> la declaró <strong>Reserva de la Biosfera</strong>, reconociendo su
                valor ecológico y cultural como patrimonio vivo de la humanidad.
              </p>
              <p>
                Pero ojo, esto no es un cuento de hadas: Ometepe está sufriendo. La basura, el plástico y el
                descuido están manchando su belleza. Cada residuo que llega al lago, cada playa sucia y cada
                sendero abandonado es una herida que podemos evitar.
              </p>
            </div>
          </div>
        </section>

        {/* Places / Mapa Screen */}
        <section className={`eco-screen ${effectiveScreen === 'places' ? 'active' : ''}`}>
          {q ? (
            <div className="eco-cards">
              {filteredPlaces.map(p => (
                <div
                  key={p.id}
                  className="eco-card"
                  tabIndex={0}
                  role="button"
                  onClick={() => openPlace(p)}
                  onKeyDown={(e) => { if (e.key === 'Enter') openPlace(p); }}
                >
                  <img
                    src={p.gallery[0]}
                    alt={p.title}
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                  />
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                </div>
              ))}
              {filteredPlaces.length === 0 && (
                <div className="eco-empty">Sin resultados para &quot;{q}&quot;</div>
              )}
            </div>
          ) : (
            <MapScreen onOpen={openPlace} />
          )}
        </section>

        {/* Tips Screen */}
        <section className={`eco-screen ${effectiveScreen === 'tips' ? 'active' : ''}`}>
          {/* Tips Hero Banner — clickable to view full image */}
          <div
            className="eco-reports-hero eco-hero-clickable"
            style={{ marginBottom: 14 }}
            onClick={() => setHeroLightbox('/escuela-municipal.jpeg')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setHeroLightbox('/escuela-municipal.jpeg'); }}
            aria-label="Ver imagen ampliada"
          >
            <img
              src="/escuela-municipal.jpeg"
              alt="Escuela Municipal - Comunidad de Ometepe"
              className="eco-reports-hero-img"
            />
            <div className="eco-reports-hero-overlay">
              <h3>Consejos de los guardianes</h3>
              <p>Personajes amigables que enseñan a cuidar la isla. Toca cualquiera para leer su consejo.</p>
            </div>
            {/* Zoom icon indicator */}
            <div className="eco-hero-zoom-hint">
              <FlutterIcon name="zoom_in" size={22} color="#fff" fill={1} />
            </div>
          </div>
          <div className="eco-tip-grid">
            {filteredTips.map(t => (
              <div
                key={t.key}
                className="eco-tip-card"
                tabIndex={0}
                role="button"
                onClick={() => openTip(t)}
                onKeyDown={(e) => { if (e.key === 'Enter') openTip(t); }}
              >
                <div className="eco-tip-img-wrap">
                  <img
                    src={`/${t.img}`}
                    alt={t.title}
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.style.display = 'none';
                    }}
                  />
                  <div className="eco-tip-img-overlay">
                    <FlutterIcon name="zoom_in" size={24} color="#fff" fill={1} />
                  </div>
                </div>
                <span className="eco-tip-emoji" aria-hidden="true">{t.icon}</span>
                <div className="eco-tip-text-area">
                  <h4>{t.title}</h4>
                  <p>{t.text}</p>
                </div>
              </div>
            ))}
            {filteredTips.length === 0 && (
              <div className="eco-empty">Sin resultados para &quot;{q}&quot;</div>
            )}
          </div>
        </section>

        {/* Reports Screen */}
        <section className={`eco-screen ${effectiveScreen === 'reports' ? 'active' : ''}`}>
          <ReportsScreen refreshKey={reportsRefreshKey} />
        </section>

        {/* Admin Screen */}
        <section className={`eco-screen ${effectiveScreen === 'admin' ? 'active' : ''}`}>
          <AdminReportsScreen refreshKey={reportsRefreshKey} onExit={() => setScreen('reports')} />
        </section>

        {/* Info Screen */}
        <section className={`eco-screen ${effectiveScreen === 'info' ? 'active' : ''}`}>
          <div className="eco-info-card">
            <h3>Sobre Ometepe</h3>
            <p>
              Ometepe es una isla formada por dos volcanes (Concepción y Maderas) ubicada en el
              Lago Cocibolca. Su biodiversidad y ecosistemas lacustres y volcánicos la convierten
              en un área de gran importancia ecológica.
            </p>

            <h4>Importancia ecológica</h4>
            <p>
              La isla alberga bosques, humedales y especies endémicas; conservar estos hábitats
              mantiene la biodiversidad y los medios de vida locales.
            </p>

            <h4>Educación ambiental</h4>
            <ul className="educ-list" style={{ margin: '8px 0 12px', paddingLeft: 18 }}>
              <li><strong>Reciclar:</strong> Reduce la contaminación y apoya la economía circular local.</li>
              <li><strong>No tirar basura:</strong> Protege fauna y evita obstrucciones en ecosistemas acuáticos.</li>
              <li><strong>Cuidar playas y ríos:</strong> Mantiene hábitats para especies marinas y aves.</li>
              <li><strong>Turismo ecológico:</strong> Genera ingresos sostenibles y incentiva la conservación.</li>
            </ul>

            <h4>Consejos rápidos</h4>
            <p>
              Apoya iniciativas locales, respeta señalizaciones, lleva tus residuos fuera de áreas
              naturales y usa productos biodegradables.
            </p>

            <h4>Sobre esta app</h4>
            <p>
              ecoOmetepe es una herramienta comunitaria para registrar problemas ambientales,
              descubrir lugares naturales de Altagracia y aprender con los guardianes de la isla.
              Los reportes se guardan en un servidor y son visibles para toda la comunidad.
            </p>
          </div>
        </section>
      </main>

      {/* Bottom Nav — M3 with pill indicator */}
      <nav className="eco-bottom-nav" role="navigation" aria-label="Navegación principal">
        <button
          className={`eco-nav-btn ${effectiveScreen === 'home' ? 'active' : ''}`}
          onClick={() => setScreen('home')}
          aria-label="Inicio"
        >
          <span className="icon-wrap">
            <span className="icon">
              <FlutterIcon
                name="home"
                size={24}
                fill={effectiveScreen === 'home' ? 1 : 0}
                weight={effectiveScreen === 'home' ? 700 : 400}
              />
            </span>
          </span>
          <span className="label">Inicio</span>
        </button>
        <button
          className={`eco-nav-btn ${effectiveScreen === 'places' ? 'active' : ''}`}
          onClick={() => { setScreen('places'); setSearchOpen(false); setSearchQuery(''); }}
          aria-label="Mapa ecológico"
        >
          <span className="icon-wrap">
            <span className="icon">
              <FlutterIcon
                name="map"
                size={24}
                fill={effectiveScreen === 'places' ? 1 : 0}
                weight={effectiveScreen === 'places' ? 700 : 400}
              />
            </span>
          </span>
          <span className="label">Mapa</span>
        </button>
        <button
          className={`eco-nav-btn ${effectiveScreen === 'tips' ? 'active' : ''}`}
          onClick={() => { setScreen('tips'); setSearchOpen(false); setSearchQuery(''); }}
          aria-label="Consejos"
        >
          <span className="icon-wrap">
            <span className="icon">
              <FlutterIcon
                name="eco"
                size={24}
                fill={effectiveScreen === 'tips' ? 1 : 0}
                weight={effectiveScreen === 'tips' ? 700 : 400}
              />
            </span>
          </span>
          <span className="label">Consejos</span>
        </button>
        <button
          className={`eco-nav-btn ${effectiveScreen === 'reports' ? 'active' : ''}`}
          onClick={() => { setScreen('reports'); setSearchOpen(false); setSearchQuery(''); }}
          aria-label="Reportes"
        >
          <span className="icon-wrap">
            <span className="icon">
              <FlutterIcon
                name="assignment"
                size={24}
                fill={effectiveScreen === 'reports' ? 1 : 0}
                weight={effectiveScreen === 'reports' ? 700 : 400}
              />
            </span>
          </span>
          <span className="label">Reportes</span>
        </button>
        <button
          className={`eco-nav-btn ${effectiveScreen === 'info' ? 'active' : ''}`}
          onClick={() => { setScreen('info'); setSearchOpen(false); setSearchQuery(''); }}
          aria-label="Información"
        >
          <span className="icon-wrap">
            <span className="icon">
              <FlutterIcon
                name="menu_book"
                size={24}
                fill={effectiveScreen === 'info' ? 1 : 0}
                weight={effectiveScreen === 'info' ? 700 : 400}
              />
            </span>
          </span>
          <span className="label">Info</span>
        </button>
      </nav>

      {/* FAB — M3 Floating Action Button (visible on all screens for quick report) */}
      {effectiveScreen !== 'reports' && effectiveScreen !== 'admin' && (
        <button
          className="eco-fab"
          aria-label="Crear reporte"
          onClick={() => setReportOpen(true)}
        >
          <FlutterIcon name="add" size={28} weight={500} />
        </button>
      )}

      {/* Modals */}
      <DetailModal
        open={detailOpen}
        data={detailData}
        onClose={() => setDetailOpen(false)}
      />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmitted={() => setReportsRefreshKey(k => k + 1)}
      />

      {/* Hero Lightbox — full-screen image viewer */}
      {heroLightbox && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
          }}
          onClick={() => setHeroLightbox(null)}
          role="dialog"
          aria-label="Imagen ampliada"
        >
          <button
            onClick={() => setHeroLightbox(null)}
            aria-label="Cerrar"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10000,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <FlutterIcon name="close" size={28} color="#fff" />
          </button>
          <img
            src={heroLightbox}
            alt="Imagen ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 12,
              boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
            }}
          />
        </div>
      )}
    </div>
  );
}
