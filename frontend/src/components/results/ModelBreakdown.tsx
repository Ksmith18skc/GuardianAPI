/**
 * Model breakdown component
 */

import { SexismBar } from './SexismBar';
import { ToxicityBreakdown } from './ToxicityBreakdown';
import { RulesGrid } from './RulesGrid';
import type { ModerationResponse } from '../../types/api';

interface ModelBreakdownProps {
  result: ModerationResponse;
}

export function ModelBreakdown({ result }: ModelBreakdownProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}
    >
      <div className="panel fade-in stagger-1">
        <h3
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: 'var(--spacing-md)',
            color: 'var(--neon-secondary)',
          }}
        >
          Model Scores
        </h3>
        <SexismBar
          score={result.label.sexism.score}
          severity={result.label.sexism.severity}
          thresholdMet={result.label.sexism.threshold_met}
        />
      </div>
      <ToxicityBreakdown toxicity={result.label.toxicity} />
      <RulesGrid rules={result.label.rules} />
    </div>
  );
}

