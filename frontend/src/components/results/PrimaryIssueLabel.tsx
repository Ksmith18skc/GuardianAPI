/**
 * Primary issue label component
 */

import { formatPrimaryIssue } from '../../utils/formatters';

interface PrimaryIssueLabelProps {
  issue: string;
}

export function PrimaryIssueLabel({ issue }: PrimaryIssueLabelProps) {
  return (
    <div
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>Primary Issue:</span>{' '}
      <span style={{ color: 'var(--neon-primary)' }}>{formatPrimaryIssue(issue)}</span>
    </div>
  );
}

