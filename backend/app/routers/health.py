"""
Health and model info API routes
"""
from fastapi import APIRouter
from app.schemas.response import HealthResponse, ModelsResponse, ModelInfoResponse
from app.models.sexism_classifier import sexism_classifier
from app.models.toxicity_model import toxicity_model
from app.models.rule_engine import rule_engine
from app import __version__

router = APIRouter(prefix="/v1", tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns service status and model loading state
    """
    models_loaded = (
        sexism_classifier.loaded and
        toxicity_model.loaded and
        rule_engine.loaded
    )
    
    return HealthResponse(
        status="healthy" if models_loaded else "degraded",
        version=__version__,
        models_loaded=models_loaded
    )


@router.get("/models", response_model=ModelsResponse)
async def get_models():
    """
    Get information about loaded models
    
    Returns list of models with their versions and load status
    """
    models = [
        ModelInfoResponse(
            name="Sexism Classifier (LASSO)",
            version=sexism_classifier.model_version,
            loaded=sexism_classifier.loaded,
            description="Custom LASSO model trained on ~40k sexist/non-sexist tweets"
        ),
        ModelInfoResponse(
            name="Toxicity Transformer",
            version=toxicity_model.model_version,
            loaded=toxicity_model.loaded,
            description="HuggingFace transformer model for multi-label toxicity detection"
        ),
        ModelInfoResponse(
            name="Rule-Based Engine",
            version=rule_engine.model_version,
            loaded=rule_engine.loaded,
            description="Heuristics engine for slur detection, threats, self-harm, and profanity"
        )
    ]
    
    return ModelsResponse(models=models)

