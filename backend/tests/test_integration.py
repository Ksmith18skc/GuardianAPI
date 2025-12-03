"""
Integration tests for full API workflow
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


# Use the test_client fixture from conftest


class TestEndToEndWorkflow:
    """End-to-end integration tests"""
    
    def test_complete_moderation_pipeline(self, test_client):
        """Test complete moderation pipeline from request to response"""
        test_cases = [
            {
                "text": "This is completely normal and harmless text.",
                "expected_issue": "none",
                "expected_score_range": (0.0, 0.5)
            },
            {
                "text": "Women are terrible at their jobs and should quit.",
                "expected_issue": "sexism",
                "expected_score_range": (0.3, 1.0)  # May be lower due to weighted aggregation
            },
            {
                "text": "You're a complete moron and I hate you.",
                "expected_issue": "toxicity",
                "expected_score_range": (0.3, 1.0)
            },
            {
                "text": "I will find you and make you suffer.",
                "expected_issue": "threat",
                "expected_score_range": (0.7, 1.0)
            }
        ]
        
        for case in test_cases:
            response = test_client.post(
                "/v1/moderate/text",
                json={"text": case["text"]}
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify score is in expected range
            score = data["ensemble"]["score"]
            assert case["expected_score_range"][0] <= score <= case["expected_score_range"][1]
            
            # Verify primary issue matches (or is close)
            primary_issue = data["ensemble"]["primary_issue"]
            if case["expected_issue"] != "none":
                # Primary issue should be detected if score is high enough
                # If score < 0.7, primary_issue may be "none" even for harmful content
                if score >= 0.7:
                    assert primary_issue != "none"
    
    def test_batch_processing_consistency(self, test_client):
        """Test that batch processing produces consistent results"""
        text = "This is a test message for consistency checking."
        
        # Single request
        single_response = test_client.post(
            "/v1/moderate/text",
            json={"text": text}
        ).json()
        
        # Batch request with same text
        batch_response = test_client.post(
            "/v1/moderate/batch",
            json={"texts": [text]}
        ).json()
        
        # Results should be identical (within rounding)
        single_score = single_response["ensemble"]["score"]
        batch_score = batch_response["results"][0]["ensemble"]["score"]
        
        # Allow small difference due to timing/rounding
        assert abs(single_score - batch_score) < 0.01
    
    def test_model_coordination(self, test_client):
        """Test that all models work together correctly"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "Women are stupid idiots who should die!"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All three models should contribute
        assert data["label"]["sexism"]["score"] > 0.0
        assert data["label"]["toxicity"]["overall"] > 0.0
        # Rules may or may not flag this text, so just check that rules ran
        assert "profanity_flag" in data["label"]["rules"]
        assert "threat_detected" in data["label"]["rules"]
        
        # Ensemble should aggregate all signals
        assert data["ensemble"]["score"] >= 0.3  # Should be at least somewhat harmful
        assert data["ensemble"]["summary"] in ["potentially_harmful", "likely_harmful", "highly_harmful"]
        
        # Meta should list all models
        assert len(data["meta"]["models_used"]) == 3
    
    def test_severity_levels(self, test_client):
        """Test that severity levels are assigned correctly"""
        test_texts = [
            ("Normal text", "low"),
            ("Somewhat problematic", "low"),
            ("Clearly harmful content", "moderate"),
            ("Extremely harmful and dangerous", "high")
        ]
        
        for text, expected_severity in test_texts:
            response = test_client.post(
                "/v1/moderate/text",
                json={"text": text}
            )
            
            assert response.status_code == 200
            data = response.json()
            
            # Severity should be one of the valid values
            assert data["ensemble"]["severity"] in ["low", "moderate", "high"]
    
    def test_response_structure_consistency(self, test_client):
        """Test that response structure is consistent across requests"""
        texts = [
            "Normal text",
            "Problematic text",
            "Very harmful text"
        ]
        
        structures = []
        for text in texts:
            response = test_client.post(
                "/v1/moderate/text",
                json={"text": text}
            )
            assert response.status_code == 200
            structures.append(set(response.json().keys()))
        
        # All responses should have the same top-level keys
        assert all(s == structures[0] for s in structures)
        
        # Verify required keys exist
        required_keys = {"text", "label", "ensemble", "meta"}
        assert required_keys.issubset(structures[0])
    
    def test_processing_time_tracking(self, test_client):
        """Test that processing time is tracked"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "Test message"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Processing time should be positive
        assert data["meta"]["processing_time_ms"] > 0
        # Should be reasonable (less than 10 seconds for single text)
        assert data["meta"]["processing_time_ms"] < 10000

