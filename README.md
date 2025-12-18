# [Guardian API]([url](https://guardian.korymsmith.dev/))


**Multi-Model, Multi-Label Content Moderation System**

Guardian API is a production-ready content moderation service that combines multiple AI models and rule-based heuristics to provide comprehensive text analysis. Built as an evolution of an academic sexism classification project, Guardian API demonstrates real production engineering, AI model serving, and developer experience design.

## 🎯 Features

- **Multi-Model Architecture**: Four coordinated models working together
- **Multi-Label Analysis**: Detects sexism, toxicity, threats, self-harm, profanity, and more
- **Production-Ready**: FastAPI backend with proper error handling, logging, and rate limiting
- **Developer-Friendly**: OpenAPI docs, structured responses, and comprehensive documentation
- **Extensible**: Modular design allows easy addition of new models and rules

## 🏗️ Architecture

```
Request → Preprocessing → 
   ├─ Model 1: Sexism Classifier (LASSO)
   ├─ Model 2: Toxicity Transformer (HuggingFace)
   └─ Model 3: Rule-Based Engine
→ Ensemble Model (Fusion + Scoring) → Final JSON Response
```

### Models

1. **Sexism Classifier**: Custom LASSO model trained on ~40k sexist/non-sexist tweets
2. **Toxicity Transformer**: Lightweight HuggingFace model for multi-label toxicity detection
3. **Rule Engine**: Heuristics for slurs, threats, self-harm phrases, profanity, caps abuse
4. **Ensemble**: Weighted fusion and conflict resolution for final scoring

## 📁 Project Structure

```
GuardianAPI/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── config.py       # Configuration
│   │   ├── core/           # Core utilities
│   │   ├── models/         # Model implementations
│   │   ├── routers/       # API routes
│   │   └── schemas/        # Request/response schemas
│   └── requirements.txt
├── data/                   # Training and test datasets
│   ├── train_sexism.csv   # Training data
│   └── test_sexism.csv    # Test data
├── scripts/                # Utility scripts
│   └── train_and_save_sexism_model.py
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Trained LASSO model (see training instructions below)

### Installation

1. **Clone and navigate to backend:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Train and save the sexism model:**
```bash
python ../scripts/train_and_save_sexism_model.py
```

This creates:
- `backend/app/models/sexism/classifier.pkl`
- `backend/app/models/sexism/vectorizer.pkl`

4. **Run the API:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. **Access the API:**
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📡 API Usage

### Moderate Single Text

```bash
curl -X POST "http://localhost:8000/v1/moderate/text" \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text to moderate here"}'
```

### Response Structure

```json
{
  "text": "Your text to moderate here",
  "label": {
    "sexism": {
      "score": 0.82,
      "severity": "moderate",
      "model_version": "sexism_lasso_v1"
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

## 🔧 Configuration

Create a `.env` file in `backend/` for optional configuration:

```env
REDIS_URL=redis://your-redis-url  # For rate limiting
LOG_LEVEL=INFO
```

## 📚 Documentation

- **Backend Documentation**: See `backend/README.md`
- **API Reference**: Available at `/docs` when running the server
- **Project Outline**: See `Guardian API - Commercial-Ready Moderation Service.pdf`

## 🧪 Development

### Adding New Rules

Edit JSON files in `backend/app/models/rules/`:
- `slurs.json`: Slur detection list
- `threats.json`: Threat pattern regexes
- `self_harm.json`: Self-harm phrases
- `profanity.json`: Profanity list

### Model Training

The sexism classifier is trained using the original class project data. To retrain:

1. Ensure training data is in `data/train_sexism.csv`
2. Run: `python scripts/train_and_save_sexism_model.py`

## 🎓 Academic Background

This project evolved from a CSC 380 class project focused on binary classification of sexist tweets using LASSO regression. The production Guardian API expands this into a comprehensive moderation system. Original academic work files have been moved to the `recycle_bin/` directory, while training datasets remain in `data/`.

## 📋 Roadmap (V1+)

- [ ] Frontend playground (React + TypeScript)
- [ ] SDKs (Python, JavaScript/TypeScript)
- [ ] Documentation site (Mintlify/Docusaurus)
- [ ] Multilingual support
- [ ] Additional harm categories
- [ ] Image moderation
- [ ] API key system and billing dashboard


## 👥 Author

- Kory Smith

---

**Note**: This is a production-style implementation for portfolio and demonstration purposes. For production deployment, ensure proper security, monitoring, and model maintenance practices.

