/**
 * Rules grid component
 */

import { RuleFlag } from './RuleFlag';
import type { RulesResponse } from '../../types/api';

interface RulesGridProps {
  rules: RulesResponse;
}

const ruleConfig = [
  { key: 'slur_detected' as const, label: 'Slur', icon: '🚫' },
  { key: 'threat_detected' as const, label: 'Threat', icon: '⚠️' },
  { key: 'self_harm_flag' as const, label: 'Self-Harm', icon: '🆘' },
  { key: 'profanity_flag' as const, label: 'Profanity', icon: '💬' },
  { key: 'caps_abuse' as const, label: 'Caps Abuse', icon: '📢' },
  { key: 'character_repetition' as const, label: 'Repetition', icon: '🔁' },
];

export function RulesGrid({ rules }: RulesGridProps) {
  return (
    <div className="panel fade-in stagger-3">
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
        Rule Engine Flags
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--spacing-sm)',
        }}
      >
        {ruleConfig.map(({ key, label, icon }) => (
          <RuleFlag
            key={key}
            label={label}
            detected={rules[key]}
            icon={icon}
          />
        ))}
      </div>
    </div>
  );
}

