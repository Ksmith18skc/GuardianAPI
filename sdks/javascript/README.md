# Guardian API JavaScript/TypeScript SDK

JavaScript/TypeScript client library for the Guardian API content moderation service.

## Installation

```bash
npm install @guardian-api/client
```

Or using yarn:

```bash
yarn add @guardian-api/client
```

## Quick Start

### TypeScript

```typescript
import { GuardianClient } from '@guardian-api/client';

// Initialize client
const client = new GuardianClient({
  baseUrl: 'http://localhost:8000'
});

// Moderate a single text
const result = await client.moderateText('This is a test message');
console.log(`Score: ${result.ensemble.score}`);
console.log(`Severity: ${result.ensemble.severity}`);

// Moderate multiple texts
const results = await client.moderateBatch([
  'This is normal text',
  'This is harmful text'
]);

// Check API health
const health = await client.healthCheck();
console.log(`Status: ${health.status}`);
```

### JavaScript

```javascript
const { GuardianClient } = require('@guardian-api/client');

const client = new GuardianClient({
  baseUrl: 'http://localhost:8000'
});

async function main() {
  const result = await client.moderateText('This is a test message');
  console.log(`Score: ${result.ensemble.score}`);
}
```

## Usage Examples

See `examples/` directory for more detailed examples.

## API Reference

### GuardianClient

#### Constructor

```typescript
new GuardianClient(options?: GuardianClientOptions)
```

Options:
- `baseUrl?: string` - Base URL of the Guardian API (default: "http://localhost:8000")
- `apiKey?: string` - Optional API key for authentication
- `timeout?: number` - Request timeout in milliseconds (default: 30000)

#### Methods

##### `moderateText(text: string): Promise<ModerationResponse>`

Moderate a single text.

##### `moderateBatch(texts: string[]): Promise<BatchModerationResponse>`

Moderate multiple texts in batch.

##### `healthCheck(): Promise<HealthResponse>`

Check API health status.

##### `getModels(): Promise<ModelsResponse>`

Get information about loaded models.

##### `isHealthy(): Promise<boolean>`

Quick health check (returns boolean).

## Error Handling

```typescript
import { GuardianClient, GuardianAPIError, GuardianAPIException } from '@guardian-api/client';

const client = new GuardianClient();

try {
  const result = await client.moderateText('test');
} catch (error) {
  if (error instanceof GuardianAPIError) {
    console.error(`API error: ${error.message} (Status: ${error.statusCode})`);
  } else if (error instanceof GuardianAPIException) {
    console.error(`Network error: ${error.message}`);
  }
}
```

## TypeScript Support

Full TypeScript type definitions are included. All response types are exported:

```typescript
import {
  ModerationResponse,
  BatchModerationResponse,
  HealthResponse,
  ModelsResponse,
  // ... and more
} from '@guardian-api/client';
```

## License

MIT

