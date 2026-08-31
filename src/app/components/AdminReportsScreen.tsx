'use client';

import { useEffect, useState } from 'react';
import { categoryLabels, statusLabels, statusColors, type Report } from '../lib/data';
import FlutterIcon from './FlutterIcon';

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

  // Fetch reports
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
    if (authenticated) run();
    return () => { cancelled = true; };
  }, [refreshKey, localRefresh, authenticated]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Filtered list
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
    } catch {
      return iso;
    }
  };

  const catIcon = (cat: string) =>
    cat === 'basura' ? 'delete'
    : cat === 'incendio' ? 'local_fire_department'
    : cat === 'tala' ? 'forest'
    : cat === 'contaminacion' ? 'water_drop'
    : 'report';

  const handlePinSubmit = () => {
    if (pinInput === ADMIN_PIN) {
      setAuthenticated(true);
      setPinError('');
    } else {
      setPinError('PIN incorrecto. Intenta de nuevo.');
      setPinInput('');
    }
  };

  const openDetail = (r: Report) => {
    setSelectedReport(r);
    setEditStatus(r.status);
    setEditDescription(r.description);
    setEditLocation(r.location || '');
    setConfirmDelete(false);
  };

  const closeDetail = () => {
    setSelectedReport(null);
    setConfirmDelete(false);
  };

  const handleSaveStatus = async () => {
    if (!selectedReport) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus }),
      });
      const d = await res.json();
      if (d.ok) {
        setToast('Estado actualizado correctamente');
        setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: editStatus } : r));
        setSelectedReport(prev => prev ? { ...prev, status: editStatus } : null);
      } else {
        setToast('Error al actualizar');
      }
    } catch {
      setToast('Error de red');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}`, { method: 'DELETE' });
      const d = await res.json();
      if (d.ok) {
        setToast('Reporte eliminado');
        setReports(prev => prev.filter(r => r.id !== selectedReport.id));
        setSelectedReport(null);
        setConfirmDelete(false);
      } else {
        setToast('Error al eliminar');
      }
    } catch {
      setToast('Error de red');
    } finally {
      setDeleting(false);
    }
  };

  // Stats
  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'reviewed').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  // Lightbox component (shared)
  const lightboxOverlay = lightbox && (
    <div
      onClick={() => setLightbox(null)}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, cursor: 'pointer',
        animation: 'ecoFadeIn 0.2s ease',
      }}
    >
      <img
        src={lightbox} alt="Foto del reporte"
        style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      />
      <button
        onClick={() => setLightbox(null)}
        style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Cerrar"
      >
        <FlutterIcon name="close" size={24} color="#fff" />
      </button>
    </div>
  );

  // ---- PIN screen ----
  if (!authenticated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'var(--m3-secondary-container)',
          color: 'var(--m3-on-secondary-container)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FlutterIcon name="admin_panel_settings" size={36} fill={1} />
        </div>
        <h3 style={{ margin: 0, color: 'var(--m3-on-surface)' }}>Panel de administración</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--m3-on-surface-variant)', textAlign: 'center', maxWidth: 280 }}>
          Ingresa el PIN de administrador para gestionar los reportes ambientales.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); handlePinSubmit(); }}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            placeholder="PIN"
            style={{
              width: 120, padding: '10px 14px',
              borderRadius: 'var(--m3-shape-sm)',
              border: '1.5px solid var(--m3-outline)',
              background: 'var(--eco-input-bg)',
              color: 'var(--m3-on-surface)',
              fontSize: 18, textAlign: 'center', letterSpacing: 6, outline: 'none',
            }}
            autoFocus
          />
          <button type="submit" className="eco-btn-primary" style={{ padding: '10px 20px' }}>
            Entrar
          </button>
        </form>
        {pinError && (
          <div style={{ color: 'var(--m3-error)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <FlutterIcon name="error" size={16} fill={1} color="var(--m3-error)" />
            {pinError}
          </div>
        )}
        <button onClick={onExit} className="eco-btn-secondary" style={{ marginTop: 8 }}>
          <FlutterIcon name="arrow_back" size={16} />
          Volver
        </button>
      </div>
    );
  }

  // ---- Detail / Edit panel ----
  if (selectedReport) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <button onClick={closeDetail} className="eco-icon-btn" aria-label="Volver">
            <FlutterIcon name="arrow_back" size={22} />
          </button>
          <h3 style={{ margin: 0, flex: 1, color: 'var(--m3-on-surface)' }}>Detalle del reporte</h3>
        </div>

        <div style={{
          background: 'var(--m3-surface-container-low)',
          borderRadius: 'var(--m3-shape-lg)',
          border: '1px solid var(--m3-outline-variant)',
          overflow: 'hidden',
        }}>
          {/* Photo */}
          {selectedReport.photoUrl && (
            <div
              style={{ position: 'relative', cursor: 'pointer' }}
              onClick={() => setLightbox(selectedReport.photoUrl!)}
              role="button" tabIndex={0}
            >
              <img
                src={selectedReport.photoUrl}
                alt="Foto del reporte"
                style={{ width: '100%', maxHeight: 260, objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div style={{
                position: 'absolute', bottom: 10, right: 10,
                padding: '6px 12px', borderRadius: 20,
                background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'none',
              }}>
                <FlutterIcon name="zoom_in" size={16} color="#fff" />
                Ver imagen
              </div>
            </div>
          )}

          <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Category + Status badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: 'var(--m3-secondary-container)',
                color: 'var(--m3-on-secondary-container)',
                padding: '4px 12px', borderRadius: 'var(--m3-shape-full)',
                fontWeight: 500, fontSize: 12,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <FlutterIcon name={catIcon(selectedReport.category)} size={14} fill={1} />
                {categoryLabels[selectedReport.category] || selectedReport.category}
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: 'var(--m3-shape-full)',
                fontWeight: 600, color: '#fff', fontSize: 11,
                background: statusColors[selectedReport.status] || '#666',
                letterSpacing: 0.4, textTransform: 'uppercase',
              }}>
                {statusLabels[selectedReport.status] || selectedReport.status}
              </span>
            </div>

            {/* Location */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--m3-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Ubicación
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--m3-on-surface)', marginTop: 2 }}>
                <FlutterIcon name="location_on" size={16} fill={1} color="var(--m3-error)" />
                <span>{selectedReport.location || 'Sin ubicación'}</span>
              </div>
            </div>

            {/* Reporter + Date */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--m3-on-surface-variant)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FlutterIcon name="person" size={14} />
                {selectedReport.reporter || 'Anónimo'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FlutterIcon name="schedule" size={14} />
                {formatDate(selectedReport.createdAt)}
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 11, color: 'var(--m3-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Descripción
              </label>
              <p style={{ margin: '4px 0 0', color: 'var(--m3-on-surface)', lineHeight: 1.5, fontSize: 14 }}>
                {selectedReport.description}
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--m3-outline-variant)', margin: '4px 0' }} />

            {/* Edit status */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--m3-on-surface-variant)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Cambiar estado
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['pending', 'reviewed', 'resolved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setEditStatus(s)}
                    style={{
                      flex: 1, padding: '10px 8px',
                      borderRadius: 'var(--m3-shape-sm)',
                      border: editStatus === s ? '2px solid ' + (statusColors[s] || '#666') : '1.5px solid var(--m3-outline)',
                      background: editStatus === s ? colorMixAlpha(statusColors[s], 0.12) : 'transparent',
                      color: editStatus === s ? statusColors[s] : 'var(--m3-on-surface-variant)',
                      fontWeight: editStatus === s ? 600 : 400, fontSize: 12,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 4, transition: 'all 0.15s',
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[s] || '#666' }} />
                    {statusLabels[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveStatus}
              disabled={saving || editStatus === selectedReport.status}
              className="eco-btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: (saving || editStatus === selectedReport.status) ? 0.5 : 1 }}
            >
              {saving ? (
                <><span className="eco-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Guardando...</>
              ) : (
                <><FlutterIcon name="save" size={18} /> Guardar cambios</>
              )}
            </button>

            {/* Delete */}
            <div style={{ borderTop: '1px solid var(--m3-outline-variant)', paddingTop: 14 }}>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    width: '100%', padding: '10px', borderRadius: 'var(--m3-shape-sm)',
                    border: '1.5px solid var(--m3-error)', background: 'transparent',
                    color: 'var(--m3-error)', fontWeight: 500, fontSize: 13,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <FlutterIcon name="delete" size={18} fill={1} color="var(--m3-error)" />
                  Eliminar reporte
                </button>
              ) : (
                <div style={{ background: 'color-mix(in srgb, var(--m3-error) 8%, transparent)', borderRadius: 'var(--m3-shape-sm)', padding: 14, textAlign: 'center' }}>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--m3-error)', fontWeight: 500 }}>
                    ¿Seguro que deseas eliminar este reporte? Esta acción no se puede deshacer.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setConfirmDelete(false)} className="eco-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete} disabled={deleting}
                      style={{
                        flex: 1, padding: '10px', borderRadius: 'var(--m3-shape-sm)',
                        border: 'none', background: 'var(--m3-error)', color: '#fff',
                        fontWeight: 500, fontSize: 13, cursor: deleting ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {deleting ? (
                        <><span className="eco-spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff' }} /> Eliminando...</>
                      ) : (
                        <><FlutterIcon name="delete_forever" size={18} fill={1} color="#fff" /> Eliminar</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--m3-inverse-surface)', color: 'var(--m3-inverse-on-surface)',
            padding: '10px 20px', borderRadius: 'var(--m3-shape-sm)',
            fontSize: 13, fontWeight: 500, zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', animation: 'ecoFadeIn 0.2s ease',
          }}>
            {toast}
          </div>
        )}

        {lightboxOverlay}
      </>
    );
  }

  // ---- Main admin list ----
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={onExit} className="eco-icon-btn" aria-label="Salir">
          <FlutterIcon name="arrow_back" size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--m3-on-surface)' }}>Panel de administración</h3>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--m3-on-surface-variant)' }}>
            Gestiona y revisa los reportes ambientales
          </p>
        </div>
        <button onClick={() => setLocalRefresh(n => n + 1)} className="eco-icon-btn" aria-label="Recargar">
          <FlutterIcon name="refresh" size={20} />
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'Total', value: stats.total, color: 'var(--m3-primary)', icon: 'assignment' },
          { label: 'Pendientes', value: stats.pending, color: statusColors.pending, icon: 'schedule' },
          { label: 'En revisión', value: stats.reviewed, color: statusColors.reviewed, icon: 'visibility' },
          { label: 'Resueltos', value: stats.resolved, color: statusColors.resolved, icon: 'check_circle' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--m3-surface-container-low)',
            borderRadius: 'var(--m3-shape-md)', padding: '12px 8px', textAlign: 'center',
            border: '1px solid var(--m3-outline-variant)',
          }}>
            <FlutterIcon name={s.icon} size={20} fill={0} color={s.color} weight={500} />
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1.2, marginTop: 4 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--m3-on-surface-variant)', marginTop: 2, letterSpacing: 0.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {(['all', 'pending', 'reviewed', 'resolved'] as const).map(s => (
          <button
            key={s}
            className={`eco-chip ${filter === s ? 'selected' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? `Todos (${reports.length})` : `${statusLabels[s]} (${reports.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="eco-reports-list">
        {loading && (
          <div className="eco-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span className="eco-spinner" />
            <span>Cargando reportes…</span>
          </div>
        )}
        {!loading && error && (
          <div className="eco-empty" style={{ color: 'var(--m3-error)' }}>
            <FlutterIcon name="error" size={20} fill={1} color="var(--m3-error)" />
            {error}
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="eco-empty">
            <FlutterIcon name="inbox" size={48} color="var(--m3-on-surface-variant)" weight={300} />
            <div>No hay reportes {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : 'aún'}.</div>
          </div>
        )}
        {!loading && !error && visible.map(r => (
          <div
            key={r.id}
            className="eco-report-item"
            style={{ cursor: 'pointer' }}
            onClick={() => openDetail(r)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') openDetail(r); }}
          >
            {r.photoUrl ? (
              <div
                style={{ position: 'relative', flexShrink: 0, cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setLightbox(r.photoUrl!); }}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') setLightbox(r.photoUrl!); }}
              >
                <img
                  src={r.photoUrl}
                  alt={categoryLabels[r.category] || r.category}
                  loading="lazy"
                  style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 12 }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }}
                />
                <div style={{
                  position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                }}>
                  <FlutterIcon name="zoom_in" size={14} color="#fff" />
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
              <p>{r.description.length > 80 ? r.description.substring(0, 80) + '…' : r.description}</p>
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
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'var(--m3-on-surface-variant)', opacity: 0.5 }}>
              <FlutterIcon name="chevron_right" size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--m3-inverse-surface)', color: 'var(--m3-inverse-on-surface)',
          padding: '10px 20px', borderRadius: 'var(--m3-shape-sm)',
          fontSize: 13, fontWeight: 500, zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          {toast}
        </div>
      )}

      {lightboxOverlay}
    </>
  );
}

// Helper: mix color with alpha (since we can't use CSS color-mix in inline JS)
function colorMixAlpha(hex: string, alpha: number): string {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  } catch {
    return hex;
  }
}
