"""
Response schemas for Guardian API
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, List, Optional


class GuardianBaseModel(BaseModel):
    """Base model that disables protected namespace conflicts (e.g., model_version)."""
    model_config = ConfigDict(protected_namespaces=())


class SexismResponse(GuardianBaseModel):
    """Sexism model response"""
    score: float = Field(..., ge=0.0, le=1.0, description="Sexism probability score")
    severity: str = Field(..., description="Severity level: low, moderate, or high")
    model_version: str = Field(..., description="Model version identifier")
    threshold_met: Optional[bool] = Field(None, description="Whether threshold was met")


class ToxicityResponse(GuardianBaseModel):
    """Toxicity model response"""
    overall: float = Field(..., ge=0.0, le=1.0, description="Overall toxicity score")
    insult: float = Field(..., ge=0.0, le=1.0, description="Insult score")
    threat: float = Field(..., ge=0.0, le=1.0, description="Threat score")
    identity_attack: float = Field(..., ge=0.0, le=1.0, description="Identity attack score")
    profanity: float = Field(..., ge=0.0, le=1.0, description="Profanity score")
    model_version: str = Field(..., description="Model version identifier")


class RulesResponse(GuardianBaseModel):
    """Rule-based engine response"""
    slur_detected: bool = Field(..., description="Whether slur was detected")
    threat_detected: bool = Field(..., description="Whether threat pattern was detected")
    self_harm_flag: bool = Field(..., description="Whether self-harm phrase was detected")
    profanity_flag: bool = Field(..., description="Whether profanity was detected")
    caps_abuse: bool = Field(..., description="Whether excessive capitalization detected")
    character_repetition: bool = Field(..., description="Whether excessive character repetition detected")
    model_version: str = Field(..., description="Model version identifier")


class EnsembleResponse(GuardianBaseModel):
    """Ensemble model response"""
    summary: str = Field(..., description="Overall summary: likely_safe, potentially_harmful, likely_harmful, highly_harmful")
    primary_issue: str = Field(..., description="Primary detected issue category")
    score: float = Field(..., ge=0.0, le=1.0, description="Final harmfulness score")
    severity: str = Field(..., description="Severity level: low, moderate, or high")


class MetaResponse(BaseModel):
    """Metadata about the moderation request"""
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    models_used: List[str] = Field(..., description="List of model versions used")


class ModerationResponse(GuardianBaseModel):
    """Complete moderation response"""
    text: str = Field(..., description="The analyzed text")
    label: Dict[str, Any] = Field(..., description="Per-model labels")
    ensemble: EnsembleResponse = Field(..., description="Ensemble aggregation results")
    meta: MetaResponse = Field(..., description="Metadata about the request")


class BatchModerationResponse(BaseModel):
    """Batch moderation response"""
    results: List[ModerationResponse] = Field(..., description="List of moderation results")
    total_processed: int = Field(..., description="Total number of texts processed")
    processing_time_ms: int = Field(..., description="Total processing time in milliseconds")


class ModelInfoResponse(GuardianBaseModel):
    """Model information response"""
    name: str = Field(..., description="Model name")
    version: str = Field(..., description="Model version")
    loaded: bool = Field(..., description="Whether model is loaded")
    description: Optional[str] = Field(None, description="Model description")


class ModelsResponse(BaseModel):
    """Response for GET /v1/models"""
    models: List[ModelInfoResponse] = Field(..., description="List of available models")


class HealthResponse(GuardianBaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    models_loaded: bool = Field(..., description="Whether all models are loaded")

