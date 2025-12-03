# Guardian API - Test Suite

Comprehensive test suite for Guardian API covering preprocessing, ensemble logic, model predictions, and API endpoints.

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures and configuration
├── test_preprocessing.py    # Preprocessing function tests
├── test_ensemble.py         # Ensemble aggregation tests
├── test_models.py           # Model prediction tests
├── test_api_endpoints.py   # API endpoint tests
└── test_integration.py     # End-to-end workflow tests
```

## Running Tests

### Install Test Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Run All Tests

```bash
pytest
```

### Run Specific Test Files

```bash
# Preprocessing tests only
pytest tests/test_preprocessing.py

# Model tests only
pytest tests/test_models.py

# API endpoint tests only
pytest tests/test_api_endpoints.py

# Integration tests only
pytest tests/test_integration.py
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage

```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
```

### Run Specific Test Classes or Functions

```bash
# Run specific test class
pytest tests/test_preprocessing.py::TestTextCleaning

# Run specific test function
pytest tests/test_ensemble.py::TestAggregateScores::test_basic_aggregation
```

## Test Categories

### Unit Tests
- **Preprocessing**: Text cleaning, normalization, caps abuse, repetition detection
- **Ensemble**: Score aggregation, severity computation, conflict resolution
- **Models**: Individual model predictions and outputs

### Integration Tests
- **API Endpoints**: All REST endpoints (health, models, moderate/text, moderate/batch)
- **Workflow**: End-to-end moderation pipeline
- **Error Handling**: Validation errors, edge cases

## Test Fixtures

The `conftest.py` file provides shared fixtures:

- `setup_models`: Loads all models once per test session
- `sample_texts`: Provides various test text samples
- `test_client`: FastAPI test client for API testing

## Notes

- Model tests may skip if models aren't loaded (toxicity model may not be available)
- Some tests require the API server models to be loaded
- Integration tests verify the full request/response cycle
- Rate limiting tests will pass even if Redis is not configured (fail-open design)

## Continuous Integration

These tests are designed to run in CI/CD pipelines. Ensure:
1. All dependencies are installed
2. Model files exist in `backend/app/models/sexism/`
3. Test data is available in `data/` directory

