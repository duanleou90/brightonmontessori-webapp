'use client';

import { usePathname } from 'next/navigation';

export function PreviewBanner() {
  const pathname = usePathname() || '/';
  const exitHref = `/api/preview/exit?slug=${encodeURIComponent(pathname)}`;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#111827',
        color: '#fff',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ fontSize: 14, lineHeight: 1.3 }}>
        <strong style={{ marginRight: 8 }}>Preview mode</strong>
        You are viewing <strong>draft</strong> content.
      </div>

      <a
        href={exitHref}
        style={{
          background: '#fff',
          color: '#111827',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 13,
          textDecoration: 'none',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        Exit preview
      </a>
    </div>
  );
}

