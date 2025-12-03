/**
 * Individual rule flag component
 */

interface RuleFlagProps {
  label: string;
  detected: boolean;
  icon?: string;
}

export function RuleFlag({ label, detected, icon = '⚡' }: RuleFlagProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        padding: 'var(--spacing-sm)',
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${detected ? 'var(--color-danger)' : 'var(--bg-grid)'}`,
        backgroundColor: detected ? 'rgba(255, 51, 102, 0.1)' : 'transparent',
        transition: 'all 0.3s ease',
        opacity: detected ? 1 : 0.5,
      }}
    >
      <div
        style={{
          fontSize: '1.5rem',
          filter: detected ? `drop-shadow(0 0 8px var(--color-danger))` : 'none',
          animation: detected ? 'pulse-glow 2s infinite' : 'none',
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: detected ? 'var(--color-danger)' : 'var(--text-secondary)',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}

