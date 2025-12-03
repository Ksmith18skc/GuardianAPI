/**
 * Sexism score bar component
 */

import { formatScore } from '../../utils/formatters';

interface SexismBarProps {
  score: number;
  severity: string;
  thresholdMet?: boolean;
}

export function SexismBar({ score, severity, thresholdMet }: SexismBarProps) {
  const getColor = () => {
    if (score < 0.3) return 'var(--neon-tertiary)';
    if (score < 0.6) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.875rem',
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
          Sexism
        </span>
        <span style={{ color: getColor(), fontWeight: 600 }}>
          {formatScore(score)}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '12px',
          backgroundColor: 'var(--bg-grid)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="bar-fill"
          style={{
            width: `${score * 100}%`,
            height: '100%',
            backgroundColor: getColor(),
            boxShadow: `0 0 10px ${getColor()}`,
            transition: 'width 0.8s ease-out',
          }}
        />
        {thresholdMet && (
          <div
            style={{
              position: 'absolute',
              right: '0',
              top: '0',
              bottom: '0',
              width: '2px',
              backgroundColor: 'var(--neon-primary)',
              boxShadow: '0 0 8px var(--neon-primary)',
            }}
          />
        )}
      </div>
    </div>
  );
}

