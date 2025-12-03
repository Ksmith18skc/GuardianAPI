/**
 * Collapsible component
 */

import { useState } from 'react';
import type { ReactNode } from 'react';

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="panel">
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          cursor: 'pointer',
          padding: 'var(--spacing-sm) 0',
        }}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

