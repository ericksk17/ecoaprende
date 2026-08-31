'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { categoryLabels, statusLabels, statusColors, type Report } from '../lib/data';
import FlutterIcon from './FlutterIcon';

function getImgSrc(photoUrl: string): string {
  if (photoUrl.startsWith('data:')) return photoUrl;
  return `/api${photoUrl}`;
}

type Props = {
  refreshKey: number;
  onExit: () => void;
};

const ADMIN_PIN = '1234';

export default function AdminReportsScreen({ refreshKey, onExit }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');

  // Auth
  const [authenticated, setAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Detail / Edit
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Cache for loaded photo URLs: reportId -> dataUrl
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
    } catch {
      /* ignore */
    } finally {
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
                if (d?.ok && Array.isArray(d.data)) {
          setReports(d.data);
          d.data.forEach((rep: Report) => {
            if (rep.hasPhoto || rep.photoUrl) {
              loadPhoto(rep.id);
            }
          });
        }
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

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('es-NI', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
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
    } catch {
      /* ignore */
    }
  };

  const handleAuth = () => {
    if (pinInput === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto');
    }
  };

  const openReport = async (r: Report) => {
    setSelectedReport(r);
    setEditStatus(r.status);
    setEditDescription(r.description);
    setEditLocation(r.location);
    setConfirmDelete(false);
    // Load photo for detail view
    if (r.hasPhoto || r.photoUrl) {
      await loadPhoto(r.id);
    }
  };

  const handleSave = async () => {
    if (!selectedReport) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          description: editDescription,
          location: editLocation,
        }),
      });
      const d = await r.json();
      if (d?.ok) {
        setToast('Reporte actualizado');
        setSelectedReport(d.data);
        setLocalRefresh(n => n + 1);
      } else {
        setToast(d?.error || 'Error al guardar');
      }
    } catch {
      setToast('Error de red');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReport || !confirmDelete) return;
    setDeleting(true);
    try {
      const r = await fetch(`/api/reports/${selectedReport.id}`, { method: 'DELETE' });
      const d = await r.json();
      if (d?.ok) {
        setToast('Reporte eliminado');
        setSelectedReport(null);
        setLocalRefresh(n => n + 1);
      } else {
        setToast(d?.error || 'Error al eliminar');
      }
    } catch {
      setToast('Error de red');
    } finally {
      setDeleting(false);
    }
  };

  // Filtered list
  const visible = reports.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  // ─── PIN screen ───
  if (!authenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
        <FlutterIcon name="lock" size={48} color="var(--m3-primary)" />
        <h3>Acceso Administrativo</h3>
        <p style={{ color: 'var(--m3-on-surface-variant)', fontSize: 13 }}>Ingresa el PIN para gestionar reportes</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="password"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAuth(); }}
            placeholder="PIN"
            maxLength={6}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid var(--m3-outline)',
              fontSize: 16,
              width: 140,
              textAlign: 'center',
              letterSpacing: 8,
              outline: 'none',
            }}
            autoFocus
          />
          <button
            className="eco-btn-primary"
            onClick={handleAuth}
            style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14 }}
          >
            Entrar
          </button>
        </div>
        {pinError && <div style={{ color: 'var(--m3-error)', fontSize: 13 }}>{pinError}</div>}
        <button onClick={onExit} className="eco-chip" style={{ marginTop: 8 }}>
          Volver
        </button>
      </div>
    );
  }

  // ─── Detail panel ───
  if (selectedReport) {
    const photo = photoCache[selectedReport.id];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Back button */}
        <button className="eco-chip" onClick={() => setSelectedReport(null)} style={{ alignSelf: 'flex-start' }}>
          <FlutterIcon name="arrow_back" size={16} /> Volver a la lista
        </button>

        {/* Photo */}
        {(selectedReport.hasPhoto || selectedReport.photoUrl) && (
          <div
            style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: photo ? 'pointer' : 'default' }}
            onClick={() => photo && openLightbox(selectedReport.id)}
          >
            {photo ? (
              <img
                src={getImgSrc(photo)}
                alt="Foto del reporte"
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ height: 120, background: 'var(--m3-surface-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="eco-spinner" />
              </div>
            )}
            {photo && (
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: '#fff' }}>
                <FlutterIcon name="zoom_in" size={14} color="#fff" /> Ampliar
              </div>
            )}
          </div>
        )}

        {/* Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--m3-on-surface-variant)' }}>Estado</label>
            <select
              value={editStatus}
              onChange={e => setEditStatus(e.target.value)}
              style={{
                width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 12,
                border: '1px solid var(--m3-outline)', fontSize: 14, background: 'var(--m3-surface-container)',
                outline: 'none',
              }}
            >
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--m3-on-surface-variant)' }}>Ubicación</label>
            <input
              value={editLocation}
              onChange={e => setEditLocation(e.target.value)}
              style={{
                width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 12,
                border: '1px solid var(--m3-outline)', fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--m3-on-surface-variant)' }}>Descripción</label>
            <textarea
              value={editDescription}
              onChange={e => setEditDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 12,
                border: '1px solid var(--m3-outline)', fontSize: 14, outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="eco-btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14 }}>
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </button>
            {!confirmDelete ? (
              <button
                className="eco-chip"
                onClick={() => setConfirmDelete(true)}
                style={{ color: 'var(--m3-error)', borderColor: 'var(--m3-error)' }}
              >
                Eliminar
              </button>
            ) : (
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding: '10px 20px', borderRadius: 12, fontSize: 14,
                  background: 'var(--m3-error)', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                {deleting ? 'Eliminando…' : '¿Confirmar eliminación?'}
              </button>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div style={{ fontSize: 12, color: 'var(--m3-on-surface-variant)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>ID: {selectedReport.id}</span>
          <span>Categoría: {categoryLabels[selectedReport.category] || selectedReport.category}</span>
          <span>Reportado por: {selectedReport.reporter || 'Anónimo'}</span>
          <span>Fecha: {formatDate(selectedReport.createdAt)}</span>
          {selectedReport.directedTo && <span>Dirigido a: {selectedReport.directedTo}</span>}
        </div>
      </div>
    );
  }

  // ─── Report list ───
  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Administración de Reportes</h3>
        <button className="eco-chip" onClick={onExit}>
          <FlutterIcon name="close" size={16} /> Cerrar
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map(s => (
          <button
            key={s}
            className={`eco-chip ${filter === s ? 'selected' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? `Todos (${reports.length})` : `${statusLabels[s]} (${reports.filter(r => r.status === s).length})`}
          </button>
        ))}
        <button
          className="eco-chip"
          onClick={() => setLocalRefresh(n => n + 1)}
          aria-label="Recargar"
          style={{ marginLeft: 'auto' }}
        >
          <FlutterIcon name="refresh" size={16} />
          Recargar
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--m3-inverse-surface)', color: 'var(--m3-inverse-on-surface)',
          padding: '10px 20px', borderRadius: 12, fontSize: 13, zIndex: 9000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
          <button onClick={() => setToast(null)} style={{ marginLeft: 12, background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      <div className="eco-reports-list">
        {/* Loading */}
        {loading && (
          <div className="eco-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="eco-spinner" />
            <span>Cargando reportes…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="eco-empty" style={{ color: 'var(--m3-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <FlutterIcon name="error" size={20} fill={1} color="var(--m3-error)" />
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && visible.length === 0 && (
          <div className="eco-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <FlutterIcon name="inbox" size={48} color="var(--m3-on-surface-variant)" weight={300} />
            <div>No hay reportes {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : 'aún'}.</div>
          </div>
        )}

        {/* Items */}
        {!loading && !error && visible.map(r => {
          const cachedPhoto = photoCache[r.id];
          const showPhoto = r.hasPhoto || r.photoUrl;
          return (
          <div key={r.id} className="eco-report-item" style={{ cursor: 'pointer' }} onClick={() => openReport(r)}>
            {showPhoto ? (
              <div style={{ position: 'relative', flexShrink: 0 }}>
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
                    onMouseEnter={() => loadPhoto(r.id)}
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
                background: 'var(--m3-secondary-container)',
                color: 'var(--m3-on-secondary-container)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FlutterIcon name="report" size={28} fill={1} />
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

      {/* Lightbox */}
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
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', zIndex: 10000, transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          >
            <FlutterIcon name="close" size={28} color="#fff" />
          </button>
          <img
            src={lightbox}
            alt="Foto ampliada"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 4px 32px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </>
  );
}