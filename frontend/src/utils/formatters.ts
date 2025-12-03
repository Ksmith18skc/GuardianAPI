/**
 * Formatting utilities
 */

/**
 * Format score as percentage
 */
export function formatScore(score: number): string {
  return `${(score * 100).toFixed(1)}%`;
}

/**
 * Format processing time
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format severity for display
 */
export function formatSeverity(severity: string): string {
  return severity.split('_').map(capitalize).join(' ');
}

/**
 * Format primary issue for display
 */
export function formatPrimaryIssue(issue: string): string {
  return issue
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
}

