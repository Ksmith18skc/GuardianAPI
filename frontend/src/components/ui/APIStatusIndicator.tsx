/**
 * API status indicator component with loading state
 */

import { useAPIStatus } from '../../hooks/useAPIStatus';
import type { APIStatus } from '../../types/api';

const statusConfig: Record<APIStatus, { label: string; color: string }> = {
  healthy: { label: 'Online', color: 'var(--neon-tertiary)' },
  degraded: { label: 'Degraded', color: 'var(--color-warning)' },
  offline: { label: 'Offline', color: 'var(--color-danger)' },
};

export function APIStatusIndicator() {
  const { status, isChecking } = useAPIStatus();
  const config = statusConfig[status];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        fontFamily: 'JetBrains Mono, monospace',
      }}
      title={isChecking ? 'Checking API status...' : `API Status: ${config.label}`}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isChecking ? 'var(--text-secondary)' : config.color,
          boxShadow: isChecking ? 'none' : `0 0 8px ${config.color}`,
          animation: status === 'healthy' && !isChecking ? 'pulse-glow 2s infinite' : 'none',
          opacity: isChecking ? 0.5 : 1,
          transition: 'all 0.3s ease',
        }}
        aria-hidden="true"
      />
      <span style={{ opacity: isChecking ? 0.7 : 1 }}>
        {isChecking ? 'Checking...' : config.label}
      </span>
    </div>
  );
}
