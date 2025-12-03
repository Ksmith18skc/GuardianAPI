/**
 * Code example generators for Python and JavaScript
 */

import type { ModerationResponse } from '../types/api';

/**
 * Generate Python code example
 */
export function generatePythonExample(result: ModerationResponse): string {
  return `import requests

# Moderate text
response = requests.post(
    "http://localhost:8000/v1/moderate/text",
    json={"text": ${JSON.stringify(result.text)}}
)

data = response.json()

print(f"Score: {result.ensemble.score:.2f}")
print(f"Severity: {result.ensemble.severity}")
print(f"Primary Issue: {result.ensemble.primary_issue}")
print(f"Sexism Score: {result.label.sexism.score:.2f}")
print(f"Toxicity Score: {result.label.toxicity.overall:.2f}")`;
}

/**
 * Generate JavaScript/TypeScript code example
 */
export function generateJavaScriptExample(result: ModerationResponse): string {
  return `const response = await fetch("http://localhost:8000/v1/moderate/text", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: ${JSON.stringify(result.text)} })
});

const data = await response.json();

console.log(\`Score: \${data.ensemble.score.toFixed(2)}\`);
console.log(\`Severity: \${data.ensemble.severity}\`);
console.log(\`Primary Issue: \${data.ensemble.primary_issue}\`);
console.log(\`Sexism Score: \${data.label.sexism.score.toFixed(2)}\`);
console.log(\`Toxicity Score: \${data.label.toxicity.overall.toFixed(2)}\`);`;
}

