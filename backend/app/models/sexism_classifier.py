"""
Model 1: Sexism Classifier (LASSO model)
"""
import pickle
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional
import logging
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import Lasso
from scipy.sparse import hstack, csr_matrix
import nltk
from nltk.tokenize import word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

from app.config import settings
from app.core.preprocessing import preprocess_text

logger = logging.getLogger(__name__)

# Initialize NLTK components
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

sia = SentimentIntensityAnalyzer()


class SexismClassifier:
    """Sexism classifier using LASSO model"""
    
    def __init__(self):
        self.vectorizer: Optional[CountVectorizer] = None
        self.model: Optional[Lasso] = None
        self.model_version: str = "sexism_lasso_v1"
        self.loaded: bool = False
    
    def load_model(self, model_path: Optional[Path] = None, vectorizer_path: Optional[Path] = None) -> bool:
        """
        Load the trained LASSO model and vectorizer
        
        Args:
            model_path: Path to saved LASSO model pickle file
            vectorizer_path: Path to saved vectorizer pickle file
            
        Returns:
            True if loaded successfully
        """
        try:
            if model_path is None:
                model_path = settings.SEXISM_MODEL_DIR / "classifier.pkl"
            if vectorizer_path is None:
                vectorizer_path = settings.SEXISM_MODEL_DIR / "vectorizer.pkl"
            
            # Load vectorizer
            if vectorizer_path.exists():
                with open(vectorizer_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
                logger.info(f"Loaded vectorizer from {vectorizer_path}")
            else:
                logger.warning(f"Vectorizer not found at {vectorizer_path}, will create new one")
                self._create_vectorizer()
            
            # Load model
            if model_path.exists():
                with open(model_path, "rb") as f:
                    self.model = pickle.load(f)
                logger.info(f"Loaded LASSO model from {model_path}")
            else:
                logger.warning(f"Model not found at {model_path}, model will need to be trained")
                return False
            
            self.loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading sexism model: {e}")
            return False
    
    def _create_vectorizer(self):
        """Create a new vectorizer matching training configuration"""
        from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
        
        stopwords_list = set(ENGLISH_STOP_WORDS)
        gendered_words = {
            'he', 'him', 'his', 'himself',
            'she', 'her', 'hers', 'herself',
            'man', 'men', 'woman', 'women',
            'boy', 'girl', 'male', 'female',
            'lady', 'gentleman', 'gentlemen', 'thin',
            'thick', 'you', 'yourself'
        }
        filtered_stopwords = stopwords_list - gendered_words
        
        self.vectorizer = CountVectorizer(
            stop_words=list(filtered_stopwords),
            max_features=settings.SEXISM_VECTORIZER_MAX_FEATURES,
            ngram_range=settings.SEXISM_VECTORIZER_NGRAM_RANGE,
            min_df=settings.SEXISM_VECTORIZER_MIN_DF,
            max_df=settings.SEXISM_VECTORIZER_MAX_DF
        )
    
    def _extract_additional_features(self, text: str) -> np.ndarray:
        """
        Extract additional features: length, exclamation marks, sentiment
        Matches the features used during training
        """
        tokens = word_tokenize(text)
        length = len(tokens)
        num_exclaims = text.count('!')
        sentiment = sia.polarity_scores(text)['compound']
        
        return np.array([[length, num_exclaims, sentiment]])
    
    def predict(self, text: str) -> Dict[str, Any]:
        """
        Predict sexism probability for given text
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary with score, severity, and metadata
        """
        if not self.loaded or self.model is None or self.vectorizer is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        
        # Preprocess text
        processed_text = preprocess_text(text, normalize=True)
        
        # Vectorize
        try:
            X_text = self.vectorizer.transform([processed_text])
            
            # Extract additional features (matching training)
            extra_features = self._extract_additional_features(text)
            extra_features_sparse = csr_matrix(extra_features)
            
            # Combine features (matching training)
            X_combined = hstack([X_text, extra_features_sparse])
            
            # Convert to dense array (LASSO expects dense)
            X = X_combined.toarray()
            
        except Exception as e:
            logger.error(f"Error vectorizing text: {e}")
            return {
                "score": 0.0,
                "severity": "low",
                "model_version": self.model_version,
                "error": str(e)
            }
        
        # Predict
        try:
            raw_score = self.model.predict(X)[0]
            # LASSO outputs continuous values, clamp to [0, 1] and apply threshold logic
            probability = max(0.0, min(1.0, raw_score))
            
            # Apply threshold from training (0.373 for subset)
            is_sexist = probability >= settings.SEXISM_THRESHOLD
            
            severity = "high" if probability >= settings.SEVERITY_HIGH else \
                      "moderate" if probability >= settings.SEVERITY_MODERATE else "low"
            
            return {
                "score": round(float(probability), 4),
                "severity": severity,
                "model_version": self.model_version,
                "threshold_met": bool(is_sexist)
            }
        except Exception as e:
            logger.error(f"Error predicting: {e}")
            return {
                "score": 0.0,
                "severity": "low",
                "model_version": self.model_version,
                "error": str(e)
            }


# Global instance
sexism_classifier = SexismClassifier()

