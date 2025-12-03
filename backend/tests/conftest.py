"""
Pytest configuration and shared fixtures
"""
import pytest
import sys
from pathlib import Path

# Add backend to path for imports
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.models.sexism_classifier import sexism_classifier
from app.models.toxicity_model import toxicity_model
from app.models.rule_engine import rule_engine
from app.config import settings


@pytest.fixture(scope="session")
def setup_models():
    """Load all models once for the test session"""
    # Load sexism classifier
    sexism_loaded = sexism_classifier.load_model()
    if not sexism_loaded:
        pytest.skip("Sexism model not available")
    
    # Load toxicity model (may fail, that's okay for some tests)
    toxicity_loaded = toxicity_model.load_model()
    
    # Load rule engine
    rules_loaded = rule_engine.load_rules()
    if not rules_loaded:
        pytest.skip("Rule engine not available")
    
    return {
        "sexism": sexism_loaded,
        "toxicity": toxicity_loaded,
        "rules": rules_loaded
    }


@pytest.fixture
def sample_texts():
    """Sample texts for testing"""
    return {
        "clean": "This is a normal sentence without any issues.",
        "sexist": "Women are terrible at coding and should stick to cooking.",
        "toxic": "You're an idiot and I hope you fail at everything.",
        "threat": "I will find you and hurt you badly.",
        "self_harm": "I want to kill myself and end it all.",
        "profanity": "This is a test with bad words.",
        "caps_abuse": "WHY ARE YOU YELLING AT ME LIKE THIS",
        "repetition": "Nooooooo way this is happening",
        "mixed": "Women are stupid idiots who should die!",
        "empty": "",
        "long": "word " * 1000  # Very long text
    }


@pytest.fixture(scope="session")
def test_client():
    """Create a test client for API endpoints with models loaded"""
    from fastapi.testclient import TestClient
    from app.main import app
    from app.models.sexism_classifier import sexism_classifier
    from app.models.toxicity_model import toxicity_model
    from app.models.rule_engine import rule_engine
    
    # TestClient doesn't trigger lifespan, so we need to load models manually
    # Load sexism classifier
    if not sexism_classifier.loaded:
        sexism_classifier.load_model()
    
    # Load rule engine
    if not rule_engine.loaded:
        rule_engine.load_rules()
    
    # Load toxicity model (may fail, that's okay)
    if not toxicity_model.loaded:
        toxicity_model.load_model()
    
    return TestClient(app)

