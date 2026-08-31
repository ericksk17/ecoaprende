'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { categoryLabels, statusLabels, statusColors, emergencyContacts, type Report } from '../lib/data';
import FlutterIcon from './FlutterIcon';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */
type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: (r: Report) => void;
};

/* ------------------------------------------------------------------ */
/*  Allowed MIME types & max size                                      */
/* ------------------------------------------------------------------ */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ------------------------------------------------------------------ */
/*  ReportModal                                                        */
/* ------------------------------------------------------------------ */
export default function ReportModal({ open, onClose, onSubmitted }: Props) {
  /* ---- state ---- */
  const [category, setCategory] = useState('basura');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [directedTo, setDirectedTo] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---- cleanup object URL when photo changes or modal closes ---- */
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  /* ---- reset form on close with timeout ---- */
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setCategory('basura');
        setDescription('');
        setLocation('');
        setDirectedTo('');
        setPhoto(null);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview('');
        setSubmitting(false);
        setUploading(false);
        setUploadProgress(0);
        setStatus(null);
        setDragOver(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, photoPreview]);

  /* ---- Escape key closes modal ---- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, submitting]);

  /* ---- file validation helper ---- */
  const validateFile = useCallback((f: File): string | null => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return 'Tipo de archivo no permitido. Usa JPG, PNG, WEBP o GIF.';
    }
    if (f.size > MAX_SIZE) {
      return `La foto supera el tamaño máximo de ${formatBytes(MAX_SIZE)}.`;
    }
    return null;
  }, []);

  /* ---- handle file selection (from input or drop) ---- */
  const handleFile = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        setStatus({ msg: err, isError: true });
        return;
      }
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhoto(f);
      setPhotoPreview(URL.createObjectURL(f));
      setStatus(null);
    },
    [validateFile, photoPreview],
  );

  /* ---- input change ---- */
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset value so re-selecting same file works
    e.target.value = '';
  };

  /* ---- drag-and-drop handlers ---- */
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  /* ---- remove photo ---- */
  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview('');
    setUploadProgress(0);
    setUploading(false);
  };

  /* ---- submit ---- */
  const submit = async () => {
    if (!description.trim()) {
      setStatus({ msg: 'Por favor agrega una descripción.', isError: true });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      let photoUrl: string | null = null;

      /* -- upload photo first -- */
      if (photo) {
        setUploading(true);
        setUploadProgress(0);

        const fd = new FormData();
        fd.append('photo', photo);

        // Use XMLHttpRequest to track upload progress
        const uploadPromise = new Promise<string>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', '/api/reports/upload');

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(pct);
            }
          };

          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);
              if (xhr.status >= 200 && xhr.status < 300 && data?.ok) {
                resolve(data.url as string);
              } else {
                reject(new Error(data?.error || 'Error al subir la foto'));
              }
            } catch {
              reject(new Error('Error al procesar la respuesta del servidor'));
            }
          };

          xhr.onerror = () => reject(new Error('Error de red al subir la foto'));
          xhr.send(fd);
        });

        photoUrl = await uploadPromise;
        setUploading(false);
        setUploadProgress(100);
      }

      /* -- create report -- */
      setStatus({ msg: 'Enviando reporte...' });

      let reporter: string | null = null;
      try {
        reporter = localStorage.getItem('eco-user-name') || null;
      } catch {
        /* ignore */
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description: description.trim(),
          location: location.trim() || null,
          photoUrl,
          reporter,
          directedTo: directedTo || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Error al crear el reporte');
      }

      setStatus({ msg: 'Reporte enviado. ¡Gracias por colaborar!' });
      onSubmitted?.(data.data as Report);
      setTimeout(() => onClose(), 900);
    } catch (err: any) {
      console.error(err);
      setStatus({ msg: err?.message || 'Error al enviar. Intenta de nuevo.', isError: true });
      setSubmitting(false);
      setUploading(false);
    }
  };

  /* ---- early return when closed ---- */
  if (!open) return null;

  /* ---- inline style helpers ---- */
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.45)',
    animation: 'fadeIn .2s ease',
  };

  const sheetStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    maxHeight: '92vh',
    background: 'var(--m3-surface, #fff)',
    borderRadius: '28px 28px 0 0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp .3s cubic-bezier(.2,0,0,1)',
  };

  const bodyStyle: React.CSSProperties = {
    padding: '8px 24px 32px',
    overflowY: 'auto',
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--m3-on-surface-variant, #444)',
    marginBottom: 6,
    marginTop: 16,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 12,
    border: '1.5px solid var(--m3-outline-variant, #ccc)',
    background: 'var(--m3-surface-container, #f6f6f6)',
    color: 'var(--m3-on-surface, #1a1a1a)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color .15s',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: 80,
    fontFamily: 'inherit',
  };

  /* ---- render ---- */
  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-label="Reportar problema ambiental"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div style={sheetStyle}>
        {/* Close button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
          <button
            aria-label="Cerrar"
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--m3-surface-container-highest, #e0e0e0)',
              color: 'var(--m3-on-surface-variant, #555)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            <FlutterIcon name="close" size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={bodyStyle}>
          <h3
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--m3-on-surface, #1a1a1a)',
            }}
          >
            Reportar problema ambiental
          </h3>
          <p
            style={{
              marginTop: 6,
              fontSize: 13,
              color: 'var(--m3-on-surface-variant, #666)',
              lineHeight: 1.5,
            }}
          >
            Describe el problema y, si puedes, adjunta una foto. Tu reporte quedará registrado y
            visible para la comunidad.
          </p>

          {/* ---- Category ---- */}
          <label htmlFor="reportCategory" style={labelStyle}>
            Categoría
          </label>
          <select
            id="reportCategory"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={submitting}
            style={selectStyle}
          >
            {Object.entries(categoryLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>

          {/* ---- Description ---- */}
          <label htmlFor="reportDesc" style={labelStyle}>
            Descripción
          </label>
          <textarea
            id="reportDesc"
            rows={4}
            placeholder="Descripción breve del problema..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            required
            style={textareaStyle}
          />

          {/* ---- Photo upload zone ---- */}
          <label style={labelStyle}>Foto (opcional)</label>

          {!photo ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              style={{
                border: `2px dashed ${dragOver ? 'var(--m3-primary, #4a8c5c)' : 'var(--m3-outline-variant, #bbb)'}`,
                borderRadius: 16,
                background: dragOver
                  ? 'color-mix(in srgb, var(--m3-primary, #4a8c5c) 8%, transparent)'
                  : 'var(--m3-surface-container, #f6f6f6)',
                padding: '28px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all .2s ease',
                transform: dragOver ? 'scale(1.01)' : 'none',
              }}
            >
              <FlutterIcon
                name="add_a_camera"
                size={36}
                color="var(--m3-primary, #4a8c5c)"
              />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--m3-on-surface, #1a1a1a)',
                }}
              >
                Toca para agregar una foto
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--m3-on-surface-variant, #888)',
                }}
              >
                o arrastra y suelta
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--m3-outline, #aaa)',
                  marginTop: 2,
                }}
              >
                JPG, PNG, WEBP o GIF · Máximo 8 MB
              </span>
            </div>
          ) : (
            /* ---- Photo preview ---- */
            <div
              style={{
                position: 'relative',
                borderRadius: 16,
                overflow: 'hidden',
                marginTop: 4,
              }}
            >
              {/* Upload progress bar on top */}
              {uploading && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 3,
                    height: 4,
                    background: 'rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'var(--m3-primary, #4a8c5c)',
                      borderRadius: uploadProgress >= 100 ? 0 : '0 4px 4px 0',
                      transition: 'width .25s ease',
                    }}
                  />
                </div>
              )}

              <img
                src={photoPreview}
                alt="Vista previa de la foto"
                style={{
                  width: '100%',
                  display: 'block',
                  maxHeight: 260,
                  objectFit: 'cover',
                  borderRadius: 16,
                }}
              />

              {/* Bottom gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
                  padding: '28px 14px 12px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  gap: 8,
                  borderRadius: '0 0 16px 16px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#fff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {photo.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>
                    {formatBytes(photo.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto();
                  }}
                  disabled={submitting}
                  style={{
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(6px)',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={onFileChange}
            disabled={submitting}
            style={{ display: 'none' }}
            aria-hidden="true"
          />

          {/* ---- Location ---- */}
          <label htmlFor="reportLocation" style={labelStyle}>
            Ubicación
          </label>
          <input
            id="reportLocation"
            type="text"
            placeholder="Ej: Moyogalpa, playa Santa Cruz..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={submitting}
            style={inputStyle}
          />

          {/* ---- Directed to ---- */}
          <label htmlFor="reportDirectedTo" style={labelStyle}>
            Dirigido a
          </label>
          <select
            id="reportDirectedTo"
            value={directedTo}
            onChange={(e) => setDirectedTo(e.target.value)}
            disabled={submitting}
            style={selectStyle}
          >
            <option value="">— Selecciona una opción —</option>
            {emergencyContacts.map(c => (
              <option key={c.key} value={c.key}>
                {c.name} · {c.phone}
              </option>
            ))}
          </select>

          {/* ---- Buttons ---- */}
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                borderRadius: 16,
                border: 'none',
                background: submitting
                  ? 'var(--m3-surface-container-highest, #ccc)'
                  : 'var(--m3-primary, #4a8c5c)',
                color: submitting
                  ? 'var(--m3-on-surface-variant, #666)'
                  : 'var(--m3-on-primary, #fff)',
                fontSize: 15,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all .15s ease',
              }}
            >
              {uploading ? (
                <>
                  <span
                    className="eco-spinner"
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 2,
                      borderTopColor: 'var(--m3-on-primary, #fff)',
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin .7s linear infinite',
                    }}
                  />
                  <span>Subiendo imagen...</span>
                </>
              ) : submitting ? (
                <>
                  <span
                    className="eco-spinner"
                    style={{
                      width: 18,
                      height: 18,
                      borderWidth: 2,
                      borderTopColor: 'var(--m3-on-primary, #fff)',
                      borderStyle: 'solid',
                      borderColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin .7s linear infinite',
                    }}
                  />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <FlutterIcon name="send" size={18} />
                  <span>Enviar reporte</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => !submitting && onClose()}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: 16,
                border: '1.5px solid var(--m3-outline-variant, #ccc)',
                background: 'transparent',
                color: 'var(--m3-on-surface, #1a1a1a)',
                fontSize: 15,
                fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all .15s ease',
              }}
            >
              Cancelar
            </button>
          </div>

          {/* ---- Status message ---- */}
          {status && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 12,
                background: status.isError
                  ? 'color-mix(in srgb, var(--m3-error, #b3261e) 10%, transparent)'
                  : 'color-mix(in srgb, var(--m3-primary, #4a8c5c) 10%, transparent)',
                color: status.isError
                  ? 'var(--m3-error, #b3261e)'
                  : 'var(--m3-primary, #4a8c5c)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {status.isError ? (
                <FlutterIcon name="error" size={18} color="var(--m3-error, #b3261e)" />
              ) : (
                <span
                  className="eco-spinner"
                  style={{
                    width: 16,
                    height: 16,
                    borderWidth: 2,
                    borderTopColor: 'var(--m3-primary, #4a8c5c)',
                    borderStyle: 'solid',
                    borderColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin .7s linear infinite',
                    flexShrink: 0,
                  }}
                />
              )}
              <span>{status.msg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes spin    { to   { transform:rotate(360deg) } }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ReportStatusBadge — exported for reuse                             */
/* ------------------------------------------------------------------ */
export function ReportStatusBadge({ status: s }: { status: string }) {
  const label = statusLabels[s] || s;
  const color = statusColors[s] || '#666';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 8,
        background: color,
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}
