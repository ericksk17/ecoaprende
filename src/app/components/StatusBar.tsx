'use client';

import { useEffect, useState } from 'react';

/**
 * Simulated iOS-style status bar to make the web app feel like a native app
 * even when running inside a mobile browser. Shows real time, signal, wifi
 * and battery icons. Hidden on tablet/desktop (the app shell has its own
 * header chrome there).
 */
export default function StatusBar() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      setTime(`${hh}:${mm}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="eco-status-bar" aria-hidden="true">
      <span className="eco-status-time">{time}</span>
      <div className="eco-status-right">
        {/* Signal bars */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" />
          <rect x="10" y="2" width="3" height="10" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
          <path d="M8 11.2a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2Z" />
          <path d="M8 7.4c1.1 0 2.1.4 2.9 1.1l1.2-1.4A6 6 0 0 0 8 5.4c-1.6 0-3 .6-4.1 1.7l1.2 1.4A4.3 4.3 0 0 1 8 7.4Z" />
          <path d="M8 3.4c2.2 0 4.2.8 5.7 2.3l1.2-1.4A9.5 9.5 0 0 0 8 1.6 9.5 9.5 0 0 0 1.1 4.3l1.2 1.4A8 8 0 0 1 8 3.4Z" />
        </svg>
        {/* Battery */}
        <div className="eco-status-battery">
          <div className="eco-status-battery-fill" />
          <div className="eco-status-battery-cap" />
        </div>
      </div>
    </div>
  );
}
