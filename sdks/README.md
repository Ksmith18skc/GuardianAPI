# Guardian API SDKs

Official SDKs for the Guardian API content moderation service.

## Available SDKs

- **[Python SDK](./python/)** - Python client library
- **[JavaScript/TypeScript SDK](./javascript/)** - JavaScript/TypeScript client library

## Quick Links

### Python SDK

```bash
cd python
pip install .
```

```python
from guardian_api import GuardianClient

client = GuardianClient(base_url="http://localhost:8000")
result = client.moderate_text("This is a test")
print(result['ensemble']['score'])
```

### JavaScript/TypeScript SDK

```bash
cd javascript
npm install
npm run build
```

```typescript
import { GuardianClient } from '@guardian-api/client';

const client = new GuardianClient({ baseUrl: 'http://localhost:8000' });
const result = await client.moderateText('This is a test');
console.log(result.ensemble.score);
```

## Features

Both SDKs provide:

- ✅ Single text moderation
- ✅ Batch text moderation
- ✅ Health check
- ✅ Model information
- ✅ Full TypeScript/Python type definitions
- ✅ Comprehensive error handling
- ✅ Usage examples

## Documentation

- [Python SDK Documentation](./python/README.md)
- [JavaScript/TypeScript SDK Documentation](./javascript/README.md)

## License

MIT

