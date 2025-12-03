"""
Configuration settings for Guardian API
"""
import os
from pathlib import Path
from typing import Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    API_TITLE: str = "Guardian API"
    API_VERSION: str = "v1"
    API_DESCRIPTION: str = "Multi-model, multi-label content moderation service"
    
    # Model Paths
    PROJECT_ROOT: Path = Path(__file__).parent.parent.parent
    MODELS_DIR: Path = PROJECT_ROOT / "backend" / "app" / "models"
    SEXISM_MODEL_DIR: Path = MODELS_DIR / "sexism"
    TOXICITY_MODEL_NAME: str = "unitary/unbiased-toxic-roberta"
    RULES_DIR: Path = MODELS_DIR / "rules"
    
    # Model Configuration
    SEXISM_THRESHOLD: float = 0.400  # Optimized via threshold verification (F1: 0.8200)
    SEXISM_VECTORIZER_MAX_FEATURES: int = 2500
    SEXISM_VECTORIZER_NGRAM_RANGE: tuple = (1, 2)
    SEXISM_VECTORIZER_MIN_DF: int = 2
    SEXISM_VECTORIZER_MAX_DF: float = 0.95
    
    # Severity Thresholds
    SEVERITY_LOW: float = 0.3
    SEVERITY_MODERATE: float = 0.6
    SEVERITY_HIGH: float = 0.8
    
    # Rate Limiting (Upstash Redis - to be configured)
    # Option 1: Redis URL (preferred) - Format: rediss://default:<token>@<host>:<port>
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)
    # Option 2: REST API credentials (fallback, requires upstash-py package)
    UPSTASH_REDIS_REST_URL: Optional[str] = os.getenv("UPSTASH_REDIS_REST_URL", None)
    UPSTASH_REDIS_REST_TOKEN: Optional[str] = os.getenv("UPSTASH_REDIS_REST_TOKEN", None)
    RATE_LIMIT_PER_MINUTE: int = 60

    # HuggingFace / model hub token (optional, for private models)
    HUGGINGFACE_HUB_TOKEN: Optional[str] = os.getenv("HUGGINGFACE_HUB_TOKEN", None)
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS
    # Parse CORS_ORIGINS from environment variable or use defaults
    CORS_ORIGINS: list = [
        "https://guardian.korymsmith.dev",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from environment variable (comma-separated string)"""
        if isinstance(v, str):
            # Handle comma-separated string from environment variable
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        # If it's already a list, return as-is
        return v if v else [
            "https://guardian.korymsmith.dev",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

