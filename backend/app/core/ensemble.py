"""
Ensemble model for aggregating multi-model moderation results
"""
from typing import Dict, Any, List
from app.config import settings


def compute_severity(score: float) -> str:
    """
    Compute severity level from a score
    
    Args:
        score: Score between 0 and 1
        
    Returns:
        Severity level: "low", "moderate", or "high"
    """
    if score >= settings.SEVERITY_HIGH:
        return "high"
    elif score >= settings.SEVERITY_MODERATE:
        return "moderate"
    else:
        return "low"


def aggregate_scores(
    sexism_score: float,
    toxicity_scores: Dict[str, float],
    rule_flags: Dict[str, bool]
) -> Dict[str, Any]:
    """
    Aggregate scores from all models into final ensemble output
    
    Args:
        sexism_score: Sexism probability from Model 1
        toxicity_scores: Dictionary of toxicity sub-scores from Model 2
        rule_flags: Dictionary of rule-based flags from Model 3
        
    Returns:
        Dictionary with ensemble summary, primary issue, and final score
    """
    # Weighted fusion weights
    WEIGHT_SEXISM = 0.35
    WEIGHT_TOXICITY = 0.35
    WEIGHT_RULES = 0.30
    
    # Get overall toxicity score (use overall if available, else max of sub-scores)
    overall_toxicity = toxicity_scores.get("overall", 0.0)
    if overall_toxicity == 0.0:
        overall_toxicity = max(
            toxicity_scores.get("insult", 0.0),
            toxicity_scores.get("threat", 0.0),
            toxicity_scores.get("identity_attack", 0.0),
            toxicity_scores.get("profanity", 0.0)
        )
    
    # Rule-based penalty/boost
    rule_score = 0.0
    rule_penalties = []
    
    if rule_flags.get("slur_detected", False):
        rule_score = max(rule_score, 0.9)
        rule_penalties.append("slur")
    if rule_flags.get("self_harm_flag", False):
        rule_score = max(rule_score, 0.95)
        rule_penalties.append("self_harm")
    if rule_flags.get("threat_detected", False):
        rule_score = max(rule_score, 0.85)
        rule_penalties.append("threat")
    if rule_flags.get("profanity_flag", False):
        rule_score = max(rule_score, 0.4)
    
    # If rules detect critical issues, override with high score
    if rule_penalties:
        rule_score = max(rule_score, 0.7)
    
    # Weighted fusion
    base_score = (
        WEIGHT_SEXISM * sexism_score +
        WEIGHT_TOXICITY * overall_toxicity +
        WEIGHT_RULES * rule_score
    )
    
    # Conflict resolution: rules override low scores for critical issues
    if rule_flags.get("slur_detected") or rule_flags.get("self_harm_flag"):
        final_score = max(base_score, 0.8)
    elif rule_flags.get("threat_detected"):
        final_score = max(base_score, 0.7)
    else:
        final_score = base_score
    
    # Determine primary issue
    primary_issue = "none"
    if final_score >= 0.7:
        if sexism_score >= 0.6:
            primary_issue = "sexism"
        elif overall_toxicity >= 0.6:
            primary_issue = "toxicity"
        elif rule_penalties:
            primary_issue = rule_penalties[0]
        else:
            primary_issue = "harmful_content"
    
    # Determine summary
    if final_score >= settings.SEVERITY_HIGH:
        summary = "highly_harmful"
    elif final_score >= settings.SEVERITY_MODERATE:
        summary = "likely_harmful"
    elif final_score >= settings.SEVERITY_LOW:
        summary = "potentially_harmful"
    else:
        summary = "likely_safe"
    
    return {
        "summary": summary,
        "primary_issue": primary_issue,
        "score": round(final_score, 3),
        "severity": compute_severity(final_score)
    }

