'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import FlutterIcon from './FlutterIcon';

export type DetailData = {
  title: string;
  text: string;
  gallery: string[];
} | null;

type Props = {
  open: boolean;
  data: DetailData;
  onClose: () => void;
};

export default function DetailModal({ open, data, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const touchStartY = useRef<number | null>(null);

  const gallery = data?.gallery ?? [];
  const mainSrc = gallery[currentIndex] || '';

  // "Adjust state during render" pattern (avoids setState-in-effect).
  // When data identity changes, reset currentIndex and zoom.
  const dataKey = data ? `${data.title}|${data.text}` : null;
  const [prevDataKey, setPrevDataKey] = useState<string | null>(null);
  if (open && dataKey && dataKey !== prevDataKey) {
    setPrevDataKey(dataKey);
    setCurrentIndex(0);
    setZoomed(false);
  }
  if (!open && prevDataKey !== null) {
    setPrevDataKey(null);
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false);
        else onClose();
      } else if (e.key === 'ArrowRight' && gallery.length > 1) {
        setCurrentIndex(i => (i + 1) % gallery.length);
      } else if (e.key === 'ArrowLeft' && gallery.length > 1) {
        setCurrentIndex(i => (i - 1 + gallery.length) % gallery.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, zoomed, gallery.length, onClose]);

  const showIndex = useCallback((idx: number) => {
    if (!gallery.length) return;
    setCurrentIndex((idx + gallery.length) % gallery.length);
  }, [gallery.length]);

  // Touch swipe for gallery navigation
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dy) > 30 && gallery.length > 1) {
      if (dy < 0) showIndex(currentIndex + 1);
      else showIndex(currentIndex - 1);
    }
    touchStartY.current = null;
  };

  if (!open || !data) return null;

  return (
    <div
      className="eco-modal open"
      role="dialog"
      aria-modal="true"
      aria-hidden="false"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="eco-modal-sheet">
        <button className="eco-close" aria-label="Cerrar" onClick={onClose}>
          <FlutterIcon name="close" size={22} />
        </button>

        <div className="eco-detail-image-wrap">
          <img
            ref={imgRef}
            src={mainSrc}
            alt={data.title}
            onClick={() => setZoomed(true)}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                'data:image/svg+xml;utf8,' +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" fill="#e8f5ee"/><text x="200" y="120" font-family="sans-serif" font-size="14" fill="#666" text-anchor="middle">Imagen no disponible</text></svg>'
                );
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          />
        </div>

        <div className="eco-detail-body">
          <h3>{data.title}</h3>
          <p>{data.text}</p>
        </div>

        {gallery.length > 1 && (
          <div className="eco-detail-thumbs">
            {gallery.map((src, idx) => (
              <div
                key={idx}
                className={`eco-detail-thumb${idx === currentIndex ? ' selected' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                <img src={src} alt={`thumb-${idx}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen image viewer */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 201,
            cursor: 'zoom-out',
            padding: 16,
          }}
        >
          <img
            src={mainSrc}
            alt={data.title}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 12,
            }}
          />
        </div>
      )}
    </div>
  );
}
