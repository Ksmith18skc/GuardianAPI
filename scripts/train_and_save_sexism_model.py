"""
Script to train and save the LASSO sexism classifier and vectorizer
This should be run from the project directory to use existing training data
"""
import sys
from pathlib import Path
import pickle
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import Lasso, LassoLarsCV
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from scipy.sparse import hstack, csr_matrix
import nltk
from nltk.tokenize import word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

# Add project to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "project"))

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

sia = SentimentIntensityAnalyzer()


def extract_features(text):
    """Extract additional features (length, exclamation marks, sentiment)"""
    tokens = word_tokenize(text)
    length = len(tokens)
    num_exclaims = text.count('!')
    sentiment = sia.polarity_scores(text)['compound']
    return pd.Series({
        'length': length,
        'num_exclaims': num_exclaims,
        'sentiment': sentiment
    })


def main():
    """Train and save the LASSO model"""
    print("Loading training data...")
    
    # Load training data
    data_dir = project_root / "data"
    train_path = data_dir / "train_sexism.csv"
    
    if not train_path.exists():
        print(f"Error: Training data not found at {train_path}")
        print("Please ensure train_sexism.csv exists in the data/ directory")
        return
    
    train_df = pd.read_csv(train_path, index_col=0)
    print(f"Loaded {len(train_df)} training samples")
    
    # Prepare labels
    y_train = train_df["label"].map({'not sexist': 0, 'sexist': 1})
    
    # Create vectorizer with filtered stopwords
    print("Creating vectorizer...")
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
    
    vectorizer = CountVectorizer(
        stop_words=list(filtered_stopwords),
        max_features=2500,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )
    
    # Fit vectorizer and transform text
    print("Vectorizing text...")
    X_train_text = vectorizer.fit_transform(train_df["text"])
    
    # Extract additional features
    print("Extracting additional features...")
    extra_features_train = train_df["text"].apply(extract_features)
    extra_train_sparse = csr_matrix(extra_features_train.values)
    
    # Combine features
    X_combined_train = hstack([X_train_text, extra_train_sparse])
    
    # Train LASSO with cross-validation
    print("Training LASSO model with cross-validation...")
    lasso_cv = LassoLarsCV(cv=25, max_iter=500)
    lasso_cv.fit(X_combined_train.toarray(), y_train)
    
    best_alpha = lasso_cv.alpha_
    print(f"Best alpha from CV: {best_alpha}")
    
    # Train final model with best alpha
    print("Training final LASSO model...")
    lasso_final = Lasso(alpha=best_alpha)
    lasso_final.fit(X_combined_train.toarray(), y_train)
    
    # Create models directory
    models_dir = project_root / "backend" / "app" / "models" / "sexism"
    models_dir.mkdir(parents=True, exist_ok=True)
    
    # Save vectorizer
    vectorizer_path = models_dir / "vectorizer.pkl"
    with open(vectorizer_path, "wb") as f:
        pickle.dump(vectorizer, f)
    print(f"Saved vectorizer to {vectorizer_path}")
    
    # Save model
    model_path = models_dir / "classifier.pkl"
    with open(model_path, "wb") as f:
        pickle.dump(lasso_final, f)
    print(f"Saved LASSO model to {model_path}")
    
    # Save feature extractor info (for inference)
    # Note: We'll need to recreate the feature extraction during inference
    print("\nModel training complete!")
    print(f"Model saved to: {model_path}")
    print(f"Vectorizer saved to: {vectorizer_path}")
    print(f"\nNote: During inference, you'll need to extract the same additional features")
    print("(length, exclamation marks, sentiment) and combine with vectorized text.")


if __name__ == "__main__":
    main()

