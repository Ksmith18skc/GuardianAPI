/**
 * Individual toxicity bar component
 */

import { formatScore } from '../../utils/formatters';

interface ToxicityBarProps {
  label: string;
  score: number;
}

export function ToxicityBar({ label, score }: ToxicityBarProps) {
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
          fontSize: '0.75rem',
        }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        <span style={{ color: getColor(), fontWeight: 600 }}>
          {formatScore(score)}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--bg-grid)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
        }}
      >
        <div
          className="bar-fill"
          style={{
            width: `${score * 100}%`,
            height: '100%',
            backgroundColor: getColor(),
            boxShadow: `0 0 8px ${getColor()}`,
            transition: 'width 0.8s ease-out',
          }}
        />
      </div>
    </div>
  );
}

