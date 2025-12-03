/**
 * UI Mode Toggle Component for Terminal Mode (AppV2)
 */

import { useUIMode } from '../../contexts/UIModeContext';

export function UIModeToggleV2() {
  const { uiMode, toggleUIMode } = useUIMode();

  return (
    <button
      onClick={toggleUIMode}
      style={{
        background: 'transparent',
        color: 'var(--ci-primary)',
        border: '1px solid var(--ci-primary)',
        padding: 'var(--space-xs) var(--space-md)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (uiMode === 'terminal') {
          e.currentTarget.style.boxShadow = '0 0 15px var(--ci-primary-glow)';
        }
      }}
      onMouseLeave={(e) => {
        if (uiMode === 'terminal') {
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      title={`Switch to ${uiMode === 'playground' ? 'Terminal' : 'Playground'} Mode`}
    >
      {uiMode === 'playground' ? '🖥️ TERMINAL' : '🎮 PLAYGROUND'}
    </button>
  );
}

