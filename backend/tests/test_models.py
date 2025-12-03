"""
Unit tests for model predictions
"""
import pytest
from app.models.sexism_classifier import sexism_classifier
from app.models.toxicity_model import toxicity_model
from app.models.rule_engine import rule_engine


class TestSexismClassifier:
    """Tests for sexism classifier"""
    
    def test_model_loaded(self, setup_models):
        """Test that model loads successfully"""
        assert sexism_classifier.loaded is True
        assert sexism_classifier.model is not None
        assert sexism_classifier.vectorizer is not None
    
    def test_predict_sexist_text(self, setup_models, sample_texts):
        """Test prediction on sexist text"""
        result = sexism_classifier.predict(sample_texts["sexist"])
        
        assert "score" in result
        assert "severity" in result
        assert "model_version" in result
        assert "threshold_met" in result
        assert 0.0 <= result["score"] <= 1.0
        assert result["severity"] in ["low", "moderate", "high"]
        # Sexist text should have high score
        assert result["score"] > 0.3
    
    def test_predict_clean_text(self, setup_models, sample_texts):
        """Test prediction on clean text"""
        result = sexism_classifier.predict(sample_texts["clean"])
        
        assert "score" in result
        assert result["score"] >= 0.0
        # Clean text should have low score
        assert result["score"] < 0.5
    
    def test_predict_empty_string(self, setup_models):
        """Test prediction on empty string"""
        result = sexism_classifier.predict("")
        assert "score" in result
        assert result["score"] >= 0.0
    
    def test_threshold_met_flag(self, setup_models, sample_texts):
        """Test threshold_met flag"""
        result = sexism_classifier.predict(sample_texts["sexist"])
        assert isinstance(result["threshold_met"], bool)
        assert result["threshold_met"] == (result["score"] >= 0.4)


class TestToxicityModel:
    """Tests for toxicity model"""
    
    def test_model_loaded(self, setup_models):
        """Test that model loads (may fail if HF model unavailable)"""
        # This test may be skipped if model not available
        if not toxicity_model.loaded:
            pytest.skip("Toxicity model not available")
    
    def test_predict_toxic_text(self, setup_models, sample_texts):
        """Test prediction on toxic text"""
        if not toxicity_model.loaded:
            pytest.skip("Toxicity model not available")
        
        result = toxicity_model.predict(sample_texts["toxic"])
        
        assert "overall" in result
        assert "insult" in result
        assert "threat" in result
        assert "identity_attack" in result
        assert "profanity" in result
        assert "model_version" in result
        
        # All scores should be in [0, 1]
        for key in ["overall", "insult", "threat", "identity_attack", "profanity"]:
            assert 0.0 <= result[key] <= 1.0
    
    def test_predict_clean_text(self, setup_models, sample_texts):
        """Test prediction on clean text"""
        if not toxicity_model.loaded:
            pytest.skip("Toxicity model not available")
        
        result = toxicity_model.predict(sample_texts["clean"])
        
        # Clean text should have low toxicity scores
        assert result["overall"] < 0.5
    
    def test_fallback_when_not_loaded(self, sample_texts):
        """Test fallback behavior when model not loaded"""
        # Temporarily mark as not loaded
        original_loaded = toxicity_model.loaded
        toxicity_model.loaded = False
        
        result = toxicity_model.predict(sample_texts["toxic"])
        
        assert result["overall"] == 0.0
        assert "error" in result
        
        # Restore
        toxicity_model.loaded = original_loaded


class TestRuleEngine:
    """Tests for rule-based engine"""
    
    def test_rules_loaded(self, setup_models):
        """Test that rules load successfully"""
        assert rule_engine.loaded is True
    
    def test_threat_detection(self, setup_models, sample_texts):
        """Test threat pattern detection"""
        result = rule_engine.predict(sample_texts["threat"])
        assert result["threat_detected"] is True
    
    def test_self_harm_detection(self, setup_models, sample_texts):
        """Test self-harm phrase detection"""
        result = rule_engine.predict(sample_texts["self_harm"])
        assert result["self_harm_flag"] is True
    
    def test_caps_abuse_detection(self, setup_models, sample_texts):
        """Test caps abuse detection"""
        result = rule_engine.predict(sample_texts["caps_abuse"])
        assert result["caps_abuse"] is True
    
    def test_character_repetition_detection(self, setup_models, sample_texts):
        """Test character repetition detection"""
        result = rule_engine.predict(sample_texts["repetition"])
        assert result["character_repetition"] is True
    
    def test_clean_text_no_flags(self, setup_models, sample_texts):
        """Test clean text produces no flags"""
        result = rule_engine.predict(sample_texts["clean"])
        assert result["slur_detected"] is False
        assert result["threat_detected"] is False
        assert result["self_harm_flag"] is False
        assert result["caps_abuse"] is False
        assert result["character_repetition"] is False
    
    def test_all_flags_present(self, setup_models):
        """Test that all expected flags are in response"""
        result = rule_engine.predict("test")
        
        required_flags = [
            "slur_detected",
            "threat_detected",
            "self_harm_flag",
            "profanity_flag",
            "caps_abuse",
            "character_repetition",
            "model_version"
        ]
        
        for flag in required_flags:
            assert flag in result

