"""
Script to verify and optimize SEXISM_THRESHOLD value
Evaluates the trained model on test data with different threshold values
"""
import sys
from pathlib import Path
import pickle
import pandas as pd
import numpy as np
from sklearn.metrics import confusion_matrix, classification_report, f1_score, precision_score, recall_score
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import Lasso
from scipy.sparse import hstack, csr_matrix
import nltk
from nltk.tokenize import word_tokenize
from nltk.sentiment import SentimentIntensityAnalyzer

# Add project to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / "backend"))

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
    """Evaluate model with different thresholds"""
    print("=" * 60)
    print("SEXISM_THRESHOLD Verification Script")
    print("=" * 60)
    
    # Load test data
    print("\n1. Loading test data...")
    data_dir = project_root / "data"
    test_path = data_dir / "test_sexism.csv"
    
    if not test_path.exists():
        print(f"Error: Test data not found at {test_path}")
        print("Please ensure test_sexism.csv exists in the data/ directory")
        return
    
    test_df = pd.read_csv(test_path, index_col=0)
    print(f"   Loaded {len(test_df)} test samples")
    
    # Prepare labels
    y_test = test_df["label"].map({'not sexist': 0, 'sexist': 1})
    print(f"   Sexist samples: {y_test.sum()}, Non-sexist: {(y_test == 0).sum()}")
    
    # Load trained model and vectorizer
    print("\n2. Loading trained model...")
    models_dir = project_root / "backend" / "app" / "models" / "sexism"
    vectorizer_path = models_dir / "vectorizer.pkl"
    model_path = models_dir / "classifier.pkl"
    
    if not vectorizer_path.exists() or not model_path.exists():
        print(f"Error: Model files not found in {models_dir}")
        print("Please train the model first using train_and_save_sexism_model.py")
        return
    
    with open(vectorizer_path, "rb") as f:
        vectorizer = pickle.load(f)
    print(f"   ✓ Vectorizer loaded")
    
    with open(model_path, "rb") as f:
        model = pickle.load(f)
    print(f"   ✓ Model loaded")
    
    # Prepare test features
    print("\n3. Preparing test features...")
    X_test_text = vectorizer.transform(test_df["text"])
    
    extra_features_test = test_df["text"].apply(extract_features)
    extra_test_sparse = csr_matrix(extra_features_test.values)
    
    X_combined_test = hstack([X_test_text, extra_test_sparse])
    X_test = X_combined_test.toarray()
    
    # Get raw predictions (probabilities)
    print("\n4. Generating predictions...")
    y_pred_raw = model.predict(X_test)
    # Clamp to [0, 1]
    y_pred_raw = np.clip(y_pred_raw, 0, 1)
    
    print(f"   Raw score range: [{y_pred_raw.min():.4f}, {y_pred_raw.max():.4f}]")
    print(f"   Mean score: {y_pred_raw.mean():.4f}")
    
    # Test different thresholds
    print("\n5. Evaluating different thresholds...")
    print("=" * 60)
    
    thresholds = [0.3, 0.35, 0.373, 0.4, 0.44, 0.5, 0.55, 0.6]
    results = []
    
    for threshold in thresholds:
        y_pred = (y_pred_raw >= threshold).astype(int)
        
        # Calculate metrics
        f1 = f1_score(y_test, y_pred, average='weighted')
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
        
        # Calculate rates
        true_positive_rate = tp / (tp + fn) if (tp + fn) > 0 else 0
        false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0
        
        results.append({
            'threshold': threshold,
            'f1': f1,
            'precision': precision,
            'recall': recall,
            'tp': tp,
            'fp': fp,
            'fn': fn,
            'tn': tn,
            'tpr': true_positive_rate,
            'fpr': false_positive_rate
        })
    
    # Display results
    print(f"{'Threshold':<12} {'F1':<8} {'Precision':<10} {'Recall':<10} {'TP':<6} {'FP':<6} {'FN':<6} {'TN':<6}")
    print("-" * 60)
    
    best_f1 = 0
    best_threshold = None
    
    for r in results:
        marker = " <-- CURRENT" if abs(r['threshold'] - 0.373) < 0.001 else ""
        marker = " <-- BEST" if r['f1'] > best_f1 else marker
        if r['f1'] > best_f1:
            best_f1 = r['f1']
            best_threshold = r['threshold']
        
        print(f"{r['threshold']:<12.3f} {r['f1']:<8.4f} {r['precision']:<10.4f} {r['recall']:<10.4f} "
              f"{r['tp']:<6} {r['fp']:<6} {r['fn']:<6} {r['tn']:<6}{marker}")
    
    print("=" * 60)
    
    # Detailed analysis for current threshold
    print("\n6. Detailed analysis for current threshold (0.373):")
    print("-" * 60)
    current_result = next((r for r in results if abs(r['threshold'] - 0.373) < 0.001), None)
    if current_result:
        y_pred_current = (y_pred_raw >= 0.373).astype(int)
        print(classification_report(y_test, y_pred_current, target_names=['Not Sexist', 'Sexist']))
        
        print(f"\nConfusion Matrix:")
        cm = confusion_matrix(y_test, y_pred_current)
        print(f"                Predicted")
        print(f"              Not Sexist  Sexist")
        print(f"Actual Not Sexist    {cm[0][0]:4d}      {cm[0][1]:4d}")
        print(f"       Sexist        {cm[1][0]:4d}      {cm[1][1]:4d}")
    
    # Recommendation
    print("\n7. Recommendation:")
    print("-" * 60)
    if best_threshold:
        if abs(best_threshold - 0.373) < 0.01:
            print(f"✓ Current threshold (0.373) is optimal!")
            print(f"  F1 Score: {best_f1:.4f}")
        else:
            print(f"⚠ Consider changing threshold from 0.373 to {best_threshold:.3f}")
            print(f"  This would improve F1 score from {current_result['f1']:.4f} to {best_f1:.4f}")
            print(f"\n  To update, edit backend/app/config.py:")
            print(f"  SEXISM_THRESHOLD: float = {best_threshold:.3f}")
    
    print("\n" + "=" * 60)
    print("Verification complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()

