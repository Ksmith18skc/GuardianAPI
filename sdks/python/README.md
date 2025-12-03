# Guardian API Python SDK

Python client library for the Guardian API content moderation service.

## Installation

```bash
pip install guardian-api
```

Or install from source:

```bash
cd sdks/python
pip install .
```

## Quick Start

```python
from guardian_api import GuardianClient

# Initialize client
client = GuardianClient(base_url="http://localhost:8000")

# Moderate a single text
result = client.moderate_text("This is a test message")
print(f"Score: {result['ensemble']['score']}")
print(f"Severity: {result['ensemble']['severity']}")

# Moderate multiple texts
results = client.moderate_batch([
    "This is normal text",
    "This is harmful text"
])

# Check API health
health = client.health_check()
print(f"Status: {health['status']}")
```

## Usage Examples

See `examples/` directory for more detailed examples.

## API Reference

### GuardianClient

#### `__init__(base_url, api_key=None, timeout=30)`

Initialize the client.

- `base_url`: Base URL of the Guardian API (default: "http://localhost:8000")
- `api_key`: Optional API key for authentication
- `timeout`: Request timeout in seconds (default: 30)

#### `moderate_text(text)`

Moderate a single text.

- `text`: Text to moderate (1-10000 characters)
- Returns: Moderation response dictionary

#### `moderate_batch(texts)`

Moderate multiple texts in batch.

- `texts`: List of texts to moderate (1-100 items)
- Returns: Batch moderation response dictionary

#### `health_check()`

Check API health status.

- Returns: Health response dictionary

#### `get_models()`

Get information about loaded models.

- Returns: Models response dictionary

#### `is_healthy()`

Quick health check (returns boolean).

- Returns: True if API is healthy

## Error Handling

```python
from guardian_api import GuardianClient, GuardianAPIError, GuardianAPIException

client = GuardianClient()

try:
    result = client.moderate_text("test")
except GuardianAPIError as e:
    print(f"API error: {e} (Status: {e.status_code})")
except GuardianAPIException as e:
    print(f"Network error: {e}")
```

## License

MIT

