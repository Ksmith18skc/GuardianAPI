/**
 * Header component
 */

import { ThemeToggle } from '../ui/ThemeToggle';
import { APIStatusIndicator } from '../ui/APIStatusIndicator';
import { UIModeToggle } from '../ui/UIModeToggle';

export function Header() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--bg-grid)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
      }}
    >
      <h1
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1.5rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'var(--neon-primary)',
          margin: 0,
        }}
      >
        Guardian<span style={{ color: 'var(--neon-tertiary)' }}>API</span> Playground
      </h1>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-lg)',
        }}
      >
        <UIModeToggle />
        <APIStatusIndicator />
        <ThemeToggle />
      </div>
    </header>
  );
}

