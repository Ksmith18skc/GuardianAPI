/**
 * UI Mode Toggle Component
 */

import { useUIMode } from '../../contexts/UIModeContext';

export function UIModeToggle() {
  const { uiMode, toggleUIMode } = useUIMode();

  return (
    <button
      onClick={toggleUIMode}
      style={{
        background: 'transparent',
        color: 'var(--neon-primary)',
        border: '1px solid var(--neon-primary)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        borderRadius: '4px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--neon-primary)';
        e.currentTarget.style.color = 'var(--bg-primary)';
        e.currentTarget.style.boxShadow = '0 0 10px var(--neon-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = 'var(--neon-primary)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      title={`Switch to ${uiMode === 'playground' ? 'Terminal' : 'Playground'} Mode`}
    >
      {uiMode === 'playground' ? '🖥️ TERMINAL' : '🎮 PLAYGROUND'}
    </button>
  );
}

