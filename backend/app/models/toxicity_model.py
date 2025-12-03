"""
Model 2: General Toxicity Transformer (HuggingFace)
"""
import logging
from typing import Dict, Any, Optional
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

from app.config import settings
from app.core.preprocessing import preprocess_text

logger = logging.getLogger(__name__)


class ToxicityModel:
    """Toxicity classifier using HuggingFace transformer"""
    
    def __init__(self):
        self.tokenizer: Optional[AutoTokenizer] = None
        self.model: Optional[AutoModelForSequenceClassification] = None
        self.device: str = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_version: str = "distilroberta_toxic_v1"  # Updated for new model
        self.loaded: bool = False
        
        # Label mapping for multi-label classification
        self.label_map = {
            "toxicity": 0,
            "severe_toxicity": 1,
            "obscene": 2,
            "threat": 3,
            "insult": 4,
            "identity_attack": 5,
            "sexual_explicit": 6
        }
    
    def load_model(self, model_name: Optional[str] = None) -> bool:
        """
        Load the HuggingFace toxicity model
        
        Args:
            model_name: Name of the HuggingFace model to load
            
        Returns:
            True if loaded successfully
        """
        try:
            if model_name is None:
                model_name = settings.TOXICITY_MODEL_NAME
            
            logger.info(f"Loading toxicity model: {model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Load model with float16 for memory efficiency (reduces memory by ~50%)
            # This is especially important for low-memory hosting environments
            try:
                # Try loading with float16 if CUDA is available, otherwise use default
                if torch.cuda.is_available():
                    self.model = AutoModelForSequenceClassification.from_pretrained(
                        model_name,
                        dtype=torch.float16  # Use dtype instead of torch_dtype (deprecated)
                    )
                    logger.info("Loaded model with float16 precision for memory efficiency")
                else:
                    # For CPU, use default dtype (float32) as float16 on CPU can be slower
                    self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
                    logger.info("Loaded model with float32 precision (CPU mode)")
            except Exception as e:
                # Fallback to default loading if float16 fails
                logger.warning(f"Could not load with float16, falling back to default: {e}")
                self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
            
            self.model.to(self.device)
            self.model.eval()
            
            # Log model memory usage estimate
            if hasattr(self.model, 'num_parameters'):
                param_count = self.model.num_parameters()
                # Rough estimate: float16 = 2 bytes per param, float32 = 4 bytes per param
                dtype_size = 2 if torch.cuda.is_available() and self.model.dtype == torch.float16 else 4
                estimated_mb = (param_count * dtype_size) / (1024 * 1024)
                logger.info(f"Model estimated memory: ~{estimated_mb:.1f} MB ({param_count:,} parameters)")
            
            self.loaded = True
            logger.info(f"Successfully loaded toxicity model on {self.device}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading toxicity model: {e}")
            # Fallback to a simpler model if the specified one fails
            try:
                logger.info("Attempting fallback to distilroberta-base...")
                model_name = "distilroberta-base"
                self.tokenizer = AutoTokenizer.from_pretrained(model_name)
                # Note: This would need a fine-tuned model for toxicity
                # For now, we'll use a placeholder approach
                self.loaded = False
                return False
            except Exception as e2:
                logger.error(f"Fallback also failed: {e2}")
                return False
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict toxicity scores for given text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with multi-label toxicity scores
        """
        if not self.loaded or self.model is None or self.tokenizer is None:
            # Return default scores if model not loaded
            logger.warning("Toxicity model not loaded, returning default scores")
            return {
                "overall": 0.0,
                "insult": 0.0,
                "threat": 0.0,
                "identity_attack": 0.0,
                "profanity": 0.0,
                "model_version": self.model_version,
                "error": "Model not loaded"
            }
        
        # Preprocess text (light preprocessing for transformer)
        processed_text = preprocess_text(text, normalize=False)  # Keep original case for transformers
        
        try:
            # Tokenize
            inputs = self.tokenizer(
                processed_text,
                padding=True,
                truncation=True,
                return_tensors="pt",
                max_length=512
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                
                # Apply sigmoid for multi-label classification
                probabilities = torch.sigmoid(logits).cpu().numpy()[0]
            
            # Map to our label structure
            # Note: Actual mapping depends on the model's output structure
            # This is a generic implementation that may need adjustment
            result = {
                "overall": float(probabilities[0]) if len(probabilities) > 0 else 0.0,
                "insult": float(probabilities[4]) if len(probabilities) > 4 else 0.0,
                "threat": float(probabilities[3]) if len(probabilities) > 3 else 0.0,
                "identity_attack": float(probabilities[5]) if len(probabilities) > 5 else 0.0,
                "profanity": float(probabilities[2]) if len(probabilities) > 2 else 0.0,
                "model_version": self.model_version
            }
            
            # Ensure overall is at least the max of sub-scores
            result["overall"] = max(
                result["overall"],
                result["insult"],
                result["threat"],
                result["identity_attack"],
                result["profanity"]
            )
            
            # Round scores
            for key in result:
                if isinstance(result[key], float):
                    result[key] = round(result[key], 4)
            
            return result
            
        except Exception as e:
            logger.error(f"Error predicting toxicity: {e}")
            return {
                "overall": 0.0,
                "insult": 0.0,
                "threat": 0.0,
                "identity_attack": 0.0,
                "profanity": 0.0,
                "model_version": self.model_version,
                "error": str(e)
            }


# Global instance
toxicity_model = ToxicityModel()

