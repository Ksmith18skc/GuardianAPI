/**
 * Ensemble results panel
 */

import { ScoreGauge } from './ScoreGauge';
import { SeverityBadge } from './SeverityBadge';
import { PrimaryIssueLabel } from './PrimaryIssueLabel';
import type { EnsembleResponse } from '../../types/api';

interface EnsemblePanelProps {
  ensemble: EnsembleResponse;
}

export function EnsemblePanel({ ensemble }: EnsemblePanelProps) {
  return (
    <div className="panel fade-in">
      <h2
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '1.25rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--neon-primary)',
        }}
      >
        Ensemble Analysis
      </h2>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--spacing-lg)',
        }}
      >
        <ScoreGauge score={ensemble.score} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
          }}
        >
          <SeverityBadge severity={ensemble.severity as any} />
          <PrimaryIssueLabel issue={ensemble.primary_issue} />
        </div>
      </div>
    </div>
  );
}

