"""
Guardian API Python Client
"""
import requests
from typing import List, Dict, Any, Optional
from .exceptions import GuardianAPIError, GuardianAPIException


class GuardianClient:
    """
    Python client for Guardian API
    
    Example:
        >>> client = GuardianClient(base_url="http://localhost:8000")
        >>> result = client.moderate_text("This is a test message")
        >>> print(result.ensemble.score)
    """
    
    def __init__(
        self,
        base_url: str = "http://localhost:8000",
        api_key: Optional[str] = None,
        timeout: int = 30
    ):
        """
        Initialize Guardian API client
        
        Args:
            base_url: Base URL of the Guardian API (default: http://localhost:8000)
            api_key: Optional API key for authentication (future use)
            timeout: Request timeout in seconds (default: 30)
        """
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
        
        self.session.headers.update({
            "Content-Type": "application/json",
            "Accept": "application/json"
        })
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make HTTP request to API
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint path
            data: Request body data
            params: Query parameters
            
        Returns:
            Response JSON as dictionary
            
        Raises:
            GuardianAPIError: For API errors
            GuardianAPIException: For network/connection errors
        """
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=self.timeout
            )
            
            # Handle HTTP errors
            if response.status_code >= 400:
                error_detail = "Unknown error"
                try:
                    error_data = response.json()
                    error_detail = error_data.get("detail", str(response.status_code))
                except:
                    error_detail = response.text or f"HTTP {response.status_code}"
                
                raise GuardianAPIError(
                    f"API error: {error_detail}",
                    status_code=response.status_code,
                    response=response
                )
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise GuardianAPIException(f"Network error: {str(e)}") from e
        except GuardianAPIError:
            raise
        except Exception as e:
            raise GuardianAPIException(f"Unexpected error: {str(e)}") from e
    
    def moderate_text(self, text: str) -> Dict[str, Any]:
        """
        Moderate a single text
        
        Args:
            text: Text to moderate (1-10000 characters)
            
        Returns:
            Moderation response dictionary with:
            - text: The analyzed text
            - label: Per-model labels (sexism, toxicity, rules)
            - ensemble: Aggregated results (summary, primary_issue, score, severity)
            - meta: Metadata (processing_time_ms, models_used)
            
        Example:
            >>> result = client.moderate_text("Women are terrible at coding")
            >>> print(f"Score: {result['ensemble']['score']}")
            >>> print(f"Severity: {result['ensemble']['severity']}")
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        if len(text) > 10000:
            raise ValueError("Text cannot exceed 10000 characters")
        
        return self._request(
            method="POST",
            endpoint="/v1/moderate/text",
            data={"text": text.strip()}
        )
    
    def moderate_batch(self, texts: List[str]) -> Dict[str, Any]:
        """
        Moderate multiple texts in batch
        
        Args:
            texts: List of texts to moderate (1-100 items, each 1-10000 characters)
            
        Returns:
            Batch moderation response dictionary with:
            - results: List of moderation results
            - total_processed: Number of texts processed
            - processing_time_ms: Total processing time
            
        Example:
            >>> results = client.moderate_batch([
            ...     "This is normal text",
            ...     "This is harmful text"
            ... ])
            >>> for result in results['results']:
            ...     print(f"Score: {result['ensemble']['score']}")
        """
        if not texts:
            raise ValueError("Texts list cannot be empty")
        
        if len(texts) > 100:
            raise ValueError("Maximum 100 texts per batch")
        
        # Validate each text
        for i, text in enumerate(texts):
            if not text or not text.strip():
                raise ValueError(f"Text at index {i} cannot be empty")
            if len(text) > 10000:
                raise ValueError(f"Text at index {i} cannot exceed 10000 characters")
        
        return self._request(
            method="POST",
            endpoint="/v1/moderate/batch",
            data={"texts": [t.strip() for t in texts]}
        )
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check API health status
        
        Returns:
            Health response dictionary with:
            - status: Service status (healthy/degraded)
            - version: API version
            - models_loaded: Whether all models are loaded
            
        Example:
            >>> health = client.health_check()
            >>> print(f"Status: {health['status']}")
            >>> print(f"Models loaded: {health['models_loaded']}")
        """
        return self._request(method="GET", endpoint="/v1/health")
    
    def get_models(self) -> Dict[str, Any]:
        """
        Get information about loaded models
        
        Returns:
            Models response dictionary with:
            - models: List of model information (name, version, loaded, description)
            
        Example:
            >>> models = client.get_models()
            >>> for model in models['models']:
            ...     print(f"{model['name']}: {model['loaded']}")
        """
        return self._request(method="GET", endpoint="/v1/models")
    
    def is_healthy(self) -> bool:
        """
        Quick health check (returns boolean)
        
        Returns:
            True if API is healthy and all models are loaded
            
        Example:
            >>> if client.is_healthy():
            ...     print("API is ready")
        """
        try:
            health = self.health_check()
            return health.get("status") == "healthy" and health.get("models_loaded", False)
        except:
            return False
    
    def close(self):
        """Close the HTTP session"""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()

