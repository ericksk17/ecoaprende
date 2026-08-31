'use client';

import { useEffect, useRef, useState } from 'react';
import FlutterIcon from './FlutterIcon';

type Props = {
  onOpenReports: () => void;
  onOpenAdmin?: () => void;
  /** When true, renders a rail-style profile chip (avatar + name) instead of an icon button */
  railMode?: boolean;
};

const STORAGE_KEY = 'eco-user-name';

export default function ProfileMenu({ onOpenReports, onOpenAdmin, railMode = false }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState<string>('');
  const [reportsCount, setReportsCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Read name from localStorage
  useEffect(() => {
    const read = () => {
      try {
        setName((localStorage.getItem(STORAGE_KEY) || '').trim());
      } catch { /* ignore */ }
    };
    read();
    window.addEventListener('storage', read);
    return () => window.removeEventListener('storage', read);
  }, []);

  // Refresh count whenever menu opens
  useEffect(() => {
    if (!open) return;
    fetch('/api/reports?limit=1000')
      .then(r => r.json())
      .then(d => {
        if (d?.ok && Array.isArray(d.data)) {
          const me = (localStorage.getItem(STORAGE_KEY) || '').trim();
          const count = me
            ? d.data.filter((r: any) => (r.reporter || '').trim().toLowerCase() === me.toLowerCase()).length
            : d.data.length;
          setReportsCount(count);
        }
      })
      .catch(() => { /* ignore */ });
  }, [open]);

  // Click away
  useEffect(() => {
    if (!open) return;
    const onDoc = (ev: MouseEvent) => {
      if (btnRef.current?.contains(ev.target as Node)) return;
      if (menuRef.current?.contains(ev.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  const initials = name
    ? name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '';

  const editName = () => {
    const v = prompt('Nombre para mostrar (ej: Juan Pérez)', name);
    if (v !== null) {
      const clean = v.trim();
      if (clean) localStorage.setItem(STORAGE_KEY, clean);
      else localStorage.removeItem(STORAGE_KEY);
      setName(clean);
      setOpen(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setName('');
    setOpen(false);
  };

  // ----- Rail mode: profile chip with avatar + name + dropdown menu -----
  if (railMode) {
    return (
      <>
        <button
          ref={btnRef}
          className="eco-nav-rail-profile"
          aria-label="Perfil"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(o => !o);
          }}
        >
          {name ? (
            <span className="eco-nav-rail-profile-avatar">{initials}</span>
          ) : (
            <span className="eco-nav-rail-profile-avatar">
              <FlutterIcon name="person" size={20} />
            </span>
          )}
          <span className="eco-nav-rail-profile-info">
            <span className="eco-nav-rail-profile-name">{name || 'Invitado'}</span>
            <span className="eco-nav-rail-profile-sub">
              {name ? `${reportsCount} reporte(s)` : 'Toca para iniciar'}
            </span>
          </span>
          <FlutterIcon name="more_vert" size={18} color="var(--m3-on-surface-variant)" />
        </button>

        {open && (
          <div ref={menuRef} className="eco-profile-menu open" onClick={(e) => e.stopPropagation()}>
            <div className="eco-profile-header">{name || 'Perfil'}</div>
            <div className="eco-profile-sub">
              {name ? `Sesión local · ${reportsCount} reporte(s)` : 'Invitado'}
            </div>
            <div className="eco-menu-item" onClick={editName}>
              <FlutterIcon name={name ? 'edit' : 'login'} size={20} />
              {name ? 'Cambiar nombre' : 'Iniciar sesión'}
            </div>
            <div className="eco-menu-item" onClick={() => { onOpenReports(); setOpen(false); }}>
              <FlutterIcon name="assignment" size={20} />
              Ver reportes enviados
            </div>
            {onOpenAdmin && (
              <div className="eco-menu-item" onClick={() => { onOpenAdmin(); setOpen(false); }}>
                <FlutterIcon name="admin_panel_settings" size={20} />
                Panel de administración
              </div>
            )}
            {name && (
              <div className="eco-menu-item" onClick={signOut} style={{ color: 'var(--m3-error)' }}>
                <FlutterIcon name="logout" size={20} color="var(--m3-error)" />
                Cerrar sesión
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  // ----- Default mode: icon button + dropdown menu -----
  return (
    <>
      <button
        ref={btnRef}
        className="eco-icon-btn"
        aria-label="Perfil"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(o => !o);
        }}
      >
        {name ? (
          <span
            style={{
              fontWeight: 700,
              color: 'var(--m3-primary)',
              fontSize: 14,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--m3-primary-container)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initials}
          </span>
        ) : (
          <FlutterIcon name="person" size={24} />
        )}
      </button>

      {open && (
        <div ref={menuRef} className="eco-profile-menu open" onClick={(e) => e.stopPropagation()}>
          <div className="eco-profile-header">{name || 'Perfil'}</div>
          <div className="eco-profile-sub">
            {name ? `Sesión local · ${reportsCount} reporte(s)` : 'Invitado'}
          </div>
          <div className="eco-menu-item" onClick={editName}>
            <FlutterIcon name={name ? 'edit' : 'login'} size={20} />
            {name ? 'Cambiar nombre' : 'Iniciar sesión'}
          </div>
          <div className="eco-menu-item" onClick={() => { onOpenReports(); setOpen(false); }}>
            <FlutterIcon name="assignment" size={20} />
            Ver reportes enviados
          </div>
          {onOpenAdmin && (
            <div className="eco-menu-item" onClick={() => { onOpenAdmin(); setOpen(false); }}>
              <FlutterIcon name="admin_panel_settings" size={20} />
              Panel de administración
            </div>
          )}
          {name && (
            <div className="eco-menu-item" onClick={signOut} style={{ color: 'var(--m3-error)' }}>
              <FlutterIcon name="logout" size={20} color="var(--m3-error)" />
              Cerrar sesión
            </div>
          )}
        </div>
      )}
    </>
  );
}
