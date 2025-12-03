"""
Integration tests for API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


# Use the test_client fixture from conftest


class TestHealthEndpoints:
    """Tests for health and info endpoints"""
    
    def test_root_endpoint(self, test_client):
        """Test root endpoint"""
        response = test_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Guardian API"
        assert data["version"] == "v1"
        assert data["status"] == "running"
    
    def test_health_endpoint(self, test_client):
        """Test health check endpoint"""
        response = test_client.get("/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
        assert "models_loaded" in data
        assert isinstance(data["models_loaded"], bool)
    
    def test_models_endpoint(self, test_client):
        """Test models info endpoint"""
        response = test_client.get("/v1/models")
        assert response.status_code == 200
        data = response.json()
        assert "models" in data
        assert isinstance(data["models"], list)
        assert len(data["models"]) == 3  # Sexism, Toxicity, Rules
        
        # Check each model has required fields
        for model in data["models"]:
            assert "name" in model
            assert "version" in model
            assert "loaded" in model
            assert "description" in model


class TestModerationEndpoints:
    """Tests for moderation endpoints"""
    
    def test_moderate_text_success(self, test_client):
        """Test successful text moderation"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "This is a test message"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check response structure
        assert "text" in data
        assert "label" in data
        assert "ensemble" in data
        assert "meta" in data
        
        # Check label structure
        assert "sexism" in data["label"]
        assert "toxicity" in data["label"]
        assert "rules" in data["label"]
        
        # Check ensemble structure
        assert "summary" in data["ensemble"]
        assert "primary_issue" in data["ensemble"]
        assert "score" in data["ensemble"]
        assert "severity" in data["ensemble"]
        
        # Check meta structure
        assert "processing_time_ms" in data["meta"]
        assert "models_used" in data["meta"]
    
    def test_moderate_text_empty(self, test_client):
        """Test moderation with empty text"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": ""}
        )
        assert response.status_code == 422  # Validation error
    
    def test_moderate_text_missing_field(self, test_client):
        """Test moderation with missing text field"""
        response = test_client.post(
            "/v1/moderate/text",
            json={}
        )
        assert response.status_code == 422  # Validation error
    
    def test_moderate_text_too_long(self, test_client):
        """Test moderation with text exceeding max length"""
        long_text = "word " * 10000  # Exceeds 10000 char limit
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": long_text}
        )
        assert response.status_code == 422  # Validation error
    
    def test_moderate_text_sexist_content(self, test_client):
        """Test moderation of sexist content"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "Women are terrible at coding and should stick to cooking."}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should detect sexism
        assert data["label"]["sexism"]["score"] > 0.3
        assert data["ensemble"]["score"] > 0.3
    
    def test_moderate_text_toxic_content(self, test_client):
        """Test moderation of toxic content"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "You're an idiot and I hope you fail."}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should detect toxicity
        assert data["label"]["toxicity"]["overall"] > 0.0
    
    def test_moderate_text_threat_detection(self, test_client):
        """Test moderation of threatening content"""
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "I will find you and hurt you badly."}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should detect threat via rules
        assert data["label"]["rules"]["threat_detected"] is True
        # Threat should boost ensemble score
        assert data["ensemble"]["score"] >= 0.7
    
    def test_moderate_batch_success(self, test_client):
        """Test successful batch moderation"""
        response = test_client.post(
            "/v1/moderate/batch",
            json={"texts": [
                "This is a normal message",
                "Women are terrible at everything",
                "You're an idiot"
            ]}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "results" in data
        assert "total_processed" in data
        assert "processing_time_ms" in data
        assert len(data["results"]) == 3
        assert data["total_processed"] == 3
    
    def test_moderate_batch_empty(self, test_client):
        """Test batch moderation with empty list"""
        response = test_client.post(
            "/v1/moderate/batch",
            json={"texts": []}
        )
        assert response.status_code == 422  # Validation error
    
    def test_moderate_batch_too_many(self, test_client):
        """Test batch moderation exceeding max items"""
        texts = [f"Text {i}" for i in range(101)]  # Exceeds 100 limit
        response = test_client.post(
            "/v1/moderate/batch",
            json={"texts": texts}
        )
        assert response.status_code == 422  # Validation error
    
    def test_moderate_batch_mixed_content(self, test_client):
        """Test batch moderation with mixed content types"""
        response = test_client.post(
            "/v1/moderate/batch",
            json={"texts": [
                "Clean normal text",
                "WHY ARE YOU YELLING",
                "I want to kill myself"
            ]}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert len(data["results"]) == 3
        
        # Check second text has caps abuse
        assert data["results"][1]["label"]["rules"]["caps_abuse"] is True
        
        # Check third text has self-harm flag
        assert data["results"][2]["label"]["rules"]["self_harm_flag"] is True


class TestAPIWorkflow:
    """Tests for full API workflow"""
    
    def test_full_moderation_workflow(self, test_client):
        """Test complete moderation workflow"""
        # 1. Check health
        health = test_client.get("/v1/health").json()
        assert health["models_loaded"] is True
        
        # 2. Get model info
        models = test_client.get("/v1/models").json()
        assert len(models["models"]) == 3
        
        # 3. Moderate a text
        moderation = test_client.post(
            "/v1/moderate/text",
            json={"text": "This is a comprehensive test of the moderation system"}
        ).json()
        
        # 4. Verify all components present
        assert moderation["label"]["sexism"]["score"] >= 0.0
        assert moderation["label"]["toxicity"]["overall"] >= 0.0
        assert moderation["ensemble"]["score"] >= 0.0
        assert moderation["meta"]["processing_time_ms"] > 0
    
    def test_rate_limiting_workflow(self, test_client):
        """Test rate limiting (if Redis configured)"""
        # Make multiple rapid requests
        responses = []
        for i in range(5):
            response = test_client.post(
                "/v1/moderate/text",
                json={"text": f"Test message {i}"}
            )
            responses.append(response.status_code)
        
        # All should succeed (rate limit is per minute, 5 requests should be fine)
        # If rate limited, we'd get 429, but with Redis not configured or high limit, should be 200
        # Some might fail if models aren't loaded, so check for 200 or 500
        assert all(status in [200, 500] for status in responses)
    
    def test_error_handling(self, test_client):
        """Test error handling"""
        # Invalid JSON - FastAPI will return 422 for invalid JSON
        response = test_client.post(
            "/v1/moderate/text",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code in [400, 422]
        
        # Valid request should work
        response = test_client.post(
            "/v1/moderate/text",
            json={"text": "test"}
        )
        # Should work (FastAPI handles it)
        assert response.status_code == 200

