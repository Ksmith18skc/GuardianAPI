/**
 * Severity badge component
 */

import type { Severity } from '../../types/api';

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const className = `badge badge-${severity}`;

  return (
    <span className={className}>
      {severity.toUpperCase()}
    </span>
  );
}

