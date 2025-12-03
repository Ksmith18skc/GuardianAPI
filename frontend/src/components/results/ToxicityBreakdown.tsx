/**
 * Toxicity breakdown component
 */

import { ToxicityBar } from './ToxicityBar';
import type { ToxicityResponse } from '../../types/api';

interface ToxicityBreakdownProps {
  toxicity: ToxicityResponse;
}

export function ToxicityBreakdown({ toxicity }: ToxicityBreakdownProps) {
  return (
    <div className="panel fade-in stagger-2">
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
        Toxicity Breakdown
      </h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-md)',
        }}
      >
        <ToxicityBar label="Overall" score={toxicity.overall} />
        <ToxicityBar label="Insult" score={toxicity.insult} />
        <ToxicityBar label="Threat" score={toxicity.threat} />
        <ToxicityBar label="Identity Attack" score={toxicity.identity_attack} />
        <ToxicityBar label="Profanity" score={toxicity.profanity} />
      </div>
    </div>
  );
}

