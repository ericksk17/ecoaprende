'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { categoryLabels, statusLabels, statusColors, emergencyContacts, whatsappNumber, type Report } from '../lib/data';
import FlutterIcon from './FlutterIcon';

function getImgSrc(photoUrl: string): string {
  if (photoUrl.startsWith('data:')) return photoUrl;
  return `/api${photoUrl}`;
}

type Props = {
  refreshKey: number;
};

export default function ReportsScreen({ refreshKey }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [localRefresh, setLocalRefresh] = useState(0);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [photoCache, setPhotoCache] = useState<Record<string, string>>({});
  const loadingPhotos = useRef<Set<string>>(new Set());

  const loadPhoto = useCallback(async (reportId: string) => {
    if (photoCache[reportId] || loadingPhotos.current.has(reportId)) return;
    loadingPhotos.current.add(reportId);
    try {
      const r = await fetch(`/api/reports/${reportId}?photo=true`);
      const d = await r.json();
      if (d?.ok && d.data?.photoUrl) {
        setPhotoCache(prev => ({ ...prev, [reportId]: d.data.photoUrl }));
      }
    } catch { /* ignore */ } finally {
      loadingPhotos.current.delete(reportId);
    }
  }, [photoCache]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch('/api/reports?limit=200');
        const d = await r.json();
        if (cancelled) return;
        if (d?.ok && Array.isArray(d.data)) setReports(d.data);
        else setError(d?.error || 'Error al cargar');
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Error de red');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [refreshKey, localRefresh]);

  const visible = reports.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-NI', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return iso; }
  };

  const catIcon = (cat: string) =>
    cat === 'basura' ? 'delete'
    : cat === 'incendio' ? 'local_fire_department'
    : cat === 'tala' ? 'forest'
    : cat === 'contaminacion' ? 'water_drop'
    : 'report';

  const contactLabel = (key: string | null) => {
    if (!key) return null;
    const c = emergencyContacts.find(e => e.key === key);
    return c ? `${c.name} · ${c.phone}` : key;
  };

  const openLightbox = async (reportId: string) => {
    if (photoCache[reportId]) {
      setLightbox(getImgSrc(photoCache[reportId]));
      return;
    }
    try {
      const r = await fetch(`/api/reports/${reportId}?photo=true`);
      const d = await r.json();
      if (d?.ok && d.data?.photoUrl) {
        setPhotoCache(prev => ({ ...prev, [reportId]: d.data.photoUrl }));
        setLightbox(getImgSrc(d.data.photoUrl));
      }
    } catch { /* ignore */ }
  };

  return (
    <>
      <div
        className="eco-reports-hero eco-hero-clickable"
        onClick={() => setLightbox('/reports-hero.jpeg')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setLightbox('/reports-hero.jpeg'); }}
        aria-label="Ver imagen ampliada"
      >
        <img src="/reports-hero.jpeg" alt="Bomberos y comunidad de Ometepe" className="eco-reports-hero-img" />
        <div className="eco-reports-hero-overlay">
          <h3>Reportes ambientales</h3>
          <p>
            Lista de problemas reportados por la comunidad. Cada reporte incluye categoría, ubicación,
            foto y estado de resolución. Ayuda a priorizar revisando y aprobando los que se han resuelto.
          </p>
        </div>
        <div className="eco-hero-zoom-hint">
          <FlutterIcon name="zoom_in" size={22} color="#fff" fill={1} />
        </div>
      </div>

      <a
        className="eco-whatsapp-btn"
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enviar WhatsApp"
        style={{ marginBottom: 14 }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span>+505 8836 3931</span>
      </a>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map(s => (
          <button key={s} className={`eco-chip ${filter === s ? 'selected' : ''}`} onClick={() => setFilter(s)}>
            {s === 'all' ? `Todos (${reports.length})` : `${statusLabels[s]} (${reports.filter(r => r.status === s).length})`}
          </button>
        ))}
        <button className="eco-chip" onClick={() => setLocalRefresh(n => n + 1)} aria-label="Recargar" style={{ marginLeft: 'auto' }}>
          <FlutterIcon name="refresh" size={16} />
          Recargar
        </button>
      </div>

      <div className="eco-reports-list">
        {loading && (
          <div className="eco-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="eco-spinner" />
            <span>Cargando reportes…</span>
          </div>
        )}

        {!loading && error && (
          <div className="eco-empty" style={{ color: 'var(--m3-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FlutterIcon name="error" size={20} fill={1} color="var(--m3-error)" />
            {error}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="eco-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <FlutterIcon name="inbox" size={48} color="var(--m3-on-surface-variant)" weight={300} />
            <div>No hay reportes {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : 'aún'}.</div>
            <div style={{ fontSize: 12 }}>¡Sé el primero en reportar un problema ambiental!</div>
          </div>
        )}

        {!loading && !error && visible.map(r => {
          const cachedPhoto = photoCache[r.id];
          const showPhoto = r.hasPhoto || r.photoUrl;
          return (
          <div key={r.id} className="eco-report-item">
            {showPhoto ? (
              <div
                style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                onClick={() => openLightbox(r.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(r.id); }}
                aria-label="Ver foto ampliada"
              >
                {cachedPhoto ? (
                  <img
                    src={getImgSrc(cachedPhoto)}
                    alt={categoryLabels[r.category] || r.category}
                    loading="lazy"
                    style={{ width: 88, height: 88, borderRadius: 12, objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div
                    style={{
                      width: 88, height: 88, borderRadius: 12,
                      background: 'var(--m3-surface-container, #f0f0f0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <FlutterIcon name="image" size={28} color="var(--m3-on-surface-variant)" />
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s',
                  }}
                  className="eco-img-overlay"
                >
                  <FlutterIcon name="zoom_in" size={28} color="#fff" fill={1} />
                </div>
              </div>
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 8,
                background: 'var(--m3-secondary-container)', color: 'var(--m3-on-secondary-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FlutterIcon name={catIcon(r.category)} size={28} fill={1} />
              </div>
            )}

            <div className="eco-report-body">
              <div className="eco-report-meta">
                <span className="eco-report-cat">{categoryLabels[r.category] || r.category}</span>
                <span className="eco-report-status" style={{ background: statusColors[r.status] || '#666' }}>
                  {statusLabels[r.status] || r.status}
                </span>
              </div>
              <h4>{r.location || 'Sin ubicación'}</h4>
              <p>{r.description}</p>
              {contactLabel(r.directedTo) && (
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--m3-primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <FlutterIcon name="phone_in_talk" size={12} fill={1} color="var(--m3-primary)" />
                  Dirigido a: {contactLabel(r.directedTo)}
                </div>
              )}
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--m3-on-surface-variant)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FlutterIcon name="schedule" size={12} />
                {formatDate(r.createdAt)}
                {r.reporter ? (
                  <>
                    <span style={{ margin: '0 4px' }}>·</span>
                    <FlutterIcon name="person" size={12} />
                    {r.reporter}
                  </>
                ) : null}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-label="Imagen ampliada"
        >
          <button
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10000, transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <FlutterIcon name="close" size={28} color="#fff" />
          </button>
          <img
            src={lightbox} alt="Foto ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </>
  );
}