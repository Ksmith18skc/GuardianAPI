"""
Configuration settings for Guardian API
"""
import json
import os
from pathlib import Path
from typing import Optional, Union
from pydantic import field_validator, computed_field
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
    
    # CORS Configuration
    # CORS_ORIGINS is stored as a string to prevent Pydantic Settings from attempting
    # automatic JSON parsing (which fails for comma-separated strings).
    # 
    # Accepts multiple formats:
    #   1. JSON array string: '["https://example.com", "http://localhost:3000"]'
    #   2. Comma-separated string: 'https://example.com,http://localhost:3000'
    #   3. Empty/None: Falls back to default string
    # 
    # Recommended format for Render: Comma-separated string
    # Example: CORS_ORIGINS=https://guardian.korymsmith.dev
    # 
    # Use settings.cors_origins_list to get the parsed list for CORS middleware
    CORS_ORIGINS: str = "https://guardian.korymsmith.dev,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v: Union[str, None]) -> str:
        """
        Safely normalize CORS_ORIGINS from environment variable to a comma-separated string.
        
        Handles:
        - JSON array string: '["https://example.com"]' → 'https://example.com'
        - Comma-separated string: 'https://example.com,http://localhost:3000' → normalized
        - Empty string or None: Returns default comma-separated string
        
        Never raises exceptions - always returns a valid comma-separated string.
        """
        # If None or empty string, return default
        if not v or (isinstance(v, str) and not v.strip()):
            return "https://guardian.korymsmith.dev,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        
        # Ensure it's a string
        if not isinstance(v, str):
            v = str(v)
        
        v = v.strip()
        
        # Try parsing as JSON first (handles JSON array strings)
        if v.startswith('[') and v.endswith(']'):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    # Convert JSON array to comma-separated string
                    origins = [origin.strip() for origin in parsed if origin.strip()]
                    if origins:
                        return ",".join(origins)
            except (json.JSONDecodeError, ValueError):
                # If JSON parsing fails, treat as comma-separated string
                pass
        
        # Normalize comma-separated string (remove extra spaces, filter empty)
        origins = [origin.strip() for origin in v.split(",") if origin.strip()]
        if origins:
            return ",".join(origins)
        
        # Fallback to default if all else fails
        return "https://guardian.korymsmith.dev,http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
    
    @computed_field
    @property
    def cors_origins_list(self) -> list[str]:
        """
        Convert CORS_ORIGINS string to a list for use in CORS middleware.
        
        Returns a list of allowed origins, always valid (never empty).
        """
        if not self.CORS_ORIGINS or not self.CORS_ORIGINS.strip():
            return [
                "https://guardian.korymsmith.dev",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
            ]
        
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        return origins if origins else [
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

