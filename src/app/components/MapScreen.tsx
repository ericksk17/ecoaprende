'use client';

import { useRef, useState } from 'react';
import { places, type Place } from '../lib/data';
import FlutterIcon from './FlutterIcon';

type Props = {
  onOpen: (p: Place) => void;
};

// Color for each pin type
const pinColor: Record<Place['type'], string> = {
  recycling: 'var(--m3-primary)',
  protected: 'var(--m3-tertiary)',
  polluted: 'var(--m3-error)',
  eco_tour: 'var(--m3-secondary)',
};

// Icon name for each pin type
const pinIcon: Record<Place['type'], string> = {
  recycling: 'recycling',
  protected: 'shield',
  polluted: 'warning',
  eco_tour: 'eco',
};

export default function MapScreen({ onOpen }: Props) {
  const [selected, setSelected] = useState<Place | null>(null);
  const [filter, setFilter] = useState<Place['type'] | 'all'>('all');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // bbox chosen to show the island with a comfortable margin
  const bbox = [-85.634, 11.31, -85.37, 11.61]; // left,bottom,right,top (lon/lat)
  const marker = '11.455,-85.503'; // center marker (lat,lon)
  const iframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox[0]}%2C${bbox[1]}%2C${bbox[2]}%2C${bbox[3]}&layer=mapnik&marker=${marker}`;

  const filtered = filter === 'all' ? places : places.filter(p => p.type === filter);

  // "Adjust state during render" — clear selection if it falls outside the filter
  const [prevFilter, setPrevFilter] = useState(filter);
  if (prevFilter !== filter) {
    setPrevFilter(filter);
    if (selected && filter !== 'all' && selected.type !== filter) {
      setSelected(null);
    }
  }

  return (
    <>
      <div className="eco-map-sim">
        <div className="eco-map-iframe-wrap">
          <iframe
            ref={iframeRef}
            title="Mapa de Isla Ometepe (OpenStreetMap)"
            src={iframeSrc}
            style={{ width: '100%', height: 260, border: 0, display: 'block' }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="eco-map-legend">
          <button
            className={`eco-chip ${filter === 'all' ? 'selected' : ''}`}
            onClick={() => setFilter('all')}
          >
            <FlutterIcon name="select_all" size={16} fill={filter === 'all' ? 1 : 0} />
            Todos
          </button>
          <button
            className={`eco-chip ${filter === 'recycling' ? 'selected' : ''}`}
            onClick={() => setFilter('recycling')}
          >
            <span className="eco-pin eco-pin-recycling" />
            Reciclaje
          </button>
          <button
            className={`eco-chip ${filter === 'protected' ? 'selected' : ''}`}
            onClick={() => setFilter('protected')}
          >
            <span className="eco-pin eco-pin-protected" />
            Protegidas
          </button>
          <button
            className={`eco-chip ${filter === 'polluted' ? 'selected' : ''}`}
            onClick={() => setFilter('polluted')}
          >
            <span className="eco-pin eco-pin-polluted" />
            Contaminadas
          </button>
          <button
            className={`eco-chip ${filter === 'eco_tour' ? 'selected' : ''}`}
            onClick={() => setFilter('eco_tour')}
          >
            <span className="eco-pin eco-pin-eco" />
            Eco-turismo
          </button>
        </div>
      </div>

      <div className="eco-cards">
        {filtered.map(p => (
          <div
            key={p.id}
            className="eco-card"
            tabIndex={0}
            role="button"
            onClick={() => onOpen(p)}
            onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p); }}
          >
            <span
              className="eco-pin-tag"
              style={{ background: pinColor[p.type] }}
              aria-hidden="true"
            />
            <img
              src={p.gallery[0]}
              alt={p.title}
              loading="lazy"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  'data:image/svg+xml;utf8,' +
                  encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="96" viewBox="0 0 200 96"><rect width="200" height="96" fill="#e8f5ee"/><text x="100" y="48" font-family="sans-serif" font-size="12" fill="#666" text-anchor="middle">Sin imagen</text></svg>'
                  );
              }}
            />
            <h4>{p.title}</h4>
            <p>{p.text}</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: pinColor[p.type], fontSize: 11, fontWeight: 500 }}>
              <FlutterIcon name={pinIcon[p.type]} size={14} fill={1} />
              {p.type === 'recycling' ? 'Reciclaje'
                : p.type === 'protected' ? 'Protegida'
                : p.type === 'polluted' ? 'Contaminada'
                : 'Eco-turismo'}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
