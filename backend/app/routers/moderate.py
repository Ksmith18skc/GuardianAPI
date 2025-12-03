"""
Moderation API routes
"""
import time
from typing import List
from fastapi import APIRouter, HTTPException
import logging

from app.schemas.request import TextModerationRequest, BatchModerationRequest
from app.schemas.response import (
    ModerationResponse, BatchModerationResponse, SexismResponse, 
    ToxicityResponse, RulesResponse, EnsembleResponse, MetaResponse
)
from app.models.sexism_classifier import sexism_classifier
from app.models.toxicity_model import toxicity_model
from app.models.rule_engine import rule_engine
from app.core.ensemble import aggregate_scores

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/moderate", tags=["moderation"])


def moderate_single_text(text: str) -> ModerationResponse:
    """
    Run moderation on a single text through all models
    
    Args:
        text: Text to moderate
        
    Returns:
        Complete moderation response
    """
    start_time = time.time()
    
    try:
        # Run all models
        sexism_result = sexism_classifier.predict(text)
        toxicity_result = toxicity_model.predict(text)
        rules_result = rule_engine.predict(text)
        
        # Aggregate scores
        ensemble_result = aggregate_scores(
            sexism_score=sexism_result.get("score", 0.0),
            toxicity_scores={
                "overall": toxicity_result.get("overall", 0.0),
                "insult": toxicity_result.get("insult", 0.0),
                "threat": toxicity_result.get("threat", 0.0),
                "identity_attack": toxicity_result.get("identity_attack", 0.0),
                "profanity": toxicity_result.get("profanity", 0.0)
            },
            rule_flags={
                "slur_detected": rules_result.get("slur_detected", False),
                "threat_detected": rules_result.get("threat_detected", False),
                "self_harm_flag": rules_result.get("self_harm_flag", False),
                "profanity_flag": rules_result.get("profanity_flag", False)
            }
        )
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # Build response
        return ModerationResponse(
            text=text,
            label={
                "sexism": SexismResponse(**sexism_result),
                "toxicity": ToxicityResponse(**toxicity_result),
                "rules": RulesResponse(**rules_result)
            },
            ensemble=EnsembleResponse(**ensemble_result),
            meta=MetaResponse(
                processing_time_ms=processing_time_ms,
                models_used=[
                    sexism_result.get("model_version", "unknown"),
                    toxicity_result.get("model_version", "unknown"),
                    rules_result.get("model_version", "unknown")
                ]
            )
        )
        
    except Exception as e:
        logger.error(f"Error moderating text: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing moderation: {str(e)}")


@router.post("/text", response_model=ModerationResponse)
async def moderate_text(request: TextModerationRequest):
    """
    Moderate a single text
    
    Returns multi-model, multi-label analysis
    """
    return moderate_single_text(request.text)


@router.post("/batch", response_model=BatchModerationResponse)
async def moderate_batch(request: BatchModerationRequest):
    """
    Moderate multiple texts in batch
    
    Returns list of moderation results
    """
    start_time = time.time()
    results = []
    
    for text in request.texts:
        try:
            result = moderate_single_text(text)
            results.append(result)
        except Exception as e:
            logger.error(f"Error processing text in batch: {e}")
            # Continue processing other texts
            continue
    
    total_time_ms = int((time.time() - start_time) * 1000)
    
    return BatchModerationResponse(
        results=results,
        total_processed=len(results),
        processing_time_ms=total_time_ms
    )

