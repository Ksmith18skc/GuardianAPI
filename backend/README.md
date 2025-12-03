# Guardian API - Backend

Multi-model, multi-label content moderation API built with FastAPI.

## Overview

Guardian API provides a production-ready content moderation service that combines:
- **Model 1**: Custom LASSO sexism classifier
- **Model 2**: HuggingFace toxicity transformer
- **Model 3**: Rule-based heuristics engine
- **Model 4**: Ensemble aggregation layer

## Setup

### Prerequisites

- Python 3.9+
- Trained LASSO model and vectorizer (see training script)

### Installation

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. (Optional, recommended) Install CUDA-enabled PyTorch so the toxicity transformer runs on GPU.  
   (or any CUDA 12.1-capable GPU) I used Nvidia RTX4050:
   ```bash
   py -3.11 -m pip install torch==2.1.0+cu121 --index-url https://download.pytorch.org/whl/cu121
   ```
   Then verify CUDA is available:
   ```bash
   py -3.11 -c "import torch; print(torch.__version__, torch.cuda.is_available(), torch.cuda.get_device_name(0))"
   ```

3. Train and save the sexism model (if not already done):
```bash
python ../scripts/train_and_save_sexism_model.py
```

This will create:
- `backend/app/models/sexism/classifier.pkl`
- `backend/app/models/sexism/vectorizer.pkl`

4. Configure environment (optional):
Create a `.env` file in the `backend/` directory:
```
# Rate Limiting - Use Redis URL (preferred) or REST API credentials
# Find Redis URL in Upstash dashboard under "Redis" connection (not REST API)
REDIS_URL=rediss://default:<token>@<host>:<port>
# OR use REST API (alternative):
# UPSTASH_REDIS_REST_URL=https://...
# UPSTASH_REDIS_REST_TOKEN=...

LOG_LEVEL=INFO
```

### Running the API

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### POST `/v1/moderate/text`
Moderate a single text.

**Request:**
```json
{
  "text": "Your text to moderate here"
}
```

**Response:**
```json
{
  "text": "Your text to moderate here",
  "label": {
    "sexism": {
      "score": 0.82,
      "severity": "moderate",
      "model_version": "sexism_lasso_v1",
      "threshold_met": true
    },
    "toxicity": {
      "overall": 0.74,
      "insult": 0.63,
      "threat": 0.12,
      "identity_attack": 0.41,
      "profanity": 0.58,
      "model_version": "toxic_roberta_v1"
    },
    "rules": {
      "slur_detected": false,
      "threat_detected": false,
      "self_harm_flag": false,
      "profanity_flag": true,
      "caps_abuse": false,
      "character_repetition": false,
      "model_version": "rules_v1"
    }
  },
  "ensemble": {
    "summary": "likely_harmful",
    "primary_issue": "sexism",
    "score": 0.81,
    "severity": "moderate"
  },
  "meta": {
    "processing_time_ms": 24,
    "models_used": ["sexism_lasso_v1", "toxic_roberta_v1", "rules_v1"]
  }
}
```

### POST `/v1/moderate/batch`
Moderate multiple texts in batch (up to 100).

**Request:**
```json
{
  "texts": ["Text 1", "Text 2", "Text 3"]
}
```

### GET `/v1/models`
Get information about loaded models.

### GET `/v1/health`
Health check endpoint.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration settings
│   ├── core/
│   │   ├── preprocessing.py  # Text preprocessing
│   │   ├── ensemble.py      # Ensemble aggregation
│   │   └── rate_limit.py    # Rate limiting utilities
│   ├── models/
│   │   ├── sexism_classifier.py
│   │   ├── toxicity_model.py
│   │   ├── rule_engine.py
│   │   └── rules/           # Rule JSON files
│   ├── routers/
│   │   ├── moderate.py      # Moderation endpoints
│   │   └── health.py        # Health/model info endpoints
│   └── schemas/
│       ├── request.py        # Request schemas
│       └── response.py      # Response schemas
└── requirements.txt
```

## Model Details

### Sexism Classifier
- **Type**: LASSO regression
- **Training**: ~40k sexist/non-sexist tweets
- **Features**: CountVectorizer (2500 features, 1-2 grams) + additional features (length, sentiment, exclamation marks)
- **Threshold**: 0.373 (configurable)

### Toxicity Model
- **Type**: HuggingFace transformer
- **Model**: `unitary/unbiased-toxic-roberta` (or fallback)
- **Outputs**: Multi-label scores (toxicity, insult, threat, identity_attack, profanity)

### Rule Engine
- **Type**: Heuristic-based
- **Checks**: Slurs, threats, self-harm phrases, profanity, caps abuse, character repetition
- **Configurable**: JSON files in `app/models/rules/`

### Ensemble
- **Method**: Weighted fusion (35% sexism, 35% toxicity, 30% rules)
- **Conflict Resolution**: Rules override low scores for critical issues
- **Output**: Final harmfulness score, severity, primary issue

## Development

### Adding New Rules

Edit JSON files in `backend/app/models/rules/`:
- `slurs.json`: Slur detection list
- `threats.json`: Threat pattern regexes
- `self_harm.json`: Self-harm phrases
- `profanity.json`: Profanity list

### Testing

```bash
# Test single moderation
curl -X POST "http://localhost:8000/v1/moderate/text" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here"}'

# Health check
curl http://localhost:8000/v1/health
```

## Notes

- The toxicity model requires a HuggingFace model. If `unitary/unbiased-toxic-roberta` is not available, the API will log a warning but continue operating with other models.
- Rate limiting requires Redis (Upstash compatible). If not configured, rate limiting is disabled.
- Model files should be placed in `backend/app/models/sexism/` after training.

