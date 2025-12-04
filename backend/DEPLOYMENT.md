# GuardianAPI Backend Deployment Guide - Google Cloud Run

This guide covers deploying the GuardianAPI FastAPI backend to Google Cloud Run.

## Prerequisites

- Google Cloud Platform (GCP) account with billing enabled
- `gcloud` CLI installed and configured
- Docker installed (for local testing)
- GitHub repository with backend code
- Model files (`.pkl` files) committed to repository

## Quick Start

### 1. Initial Setup

```bash
# Set your GCP project
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    artifactregistry.googleapis.com

# Set default region
gcloud config set run/region us-central1
```

### 2. Create Artifact Registry Repository

```bash
# Create repository for Docker images
gcloud artifacts repositories create guardian-api \
    --repository-format=docker \
    --location=us-central1 \
    --description="GuardianAPI Docker images"
```

### 3. Build and Deploy

#### Option A: Using Cloud Build (Recommended)

```bash
# Submit build from repository root
gcloud builds submit --config=backend/cloudbuild.yaml

# Or with custom substitutions
gcloud builds submit --config=backend/cloudbuild.yaml \
    --substitutions=_CORS_ORIGINS="https://guardian.korymsmith.dev",_LOG_LEVEL="INFO"
```

#### Option B: Manual Build and Deploy

```bash
# Build Docker image
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/guardian-api:latest .

# Tag for Artifact Registry
docker tag gcr.io/YOUR_PROJECT_ID/guardian-api:latest \
    us-central1-docker.pkg.dev/YOUR_PROJECT_ID/guardian-api/guardian-api:latest

# Push to Artifact Registry
docker push us-central1-docker.pkg.dev/YOUR_PROJECT_ID/guardian-api/guardian-api:latest

# Deploy to Cloud Run
gcloud run deploy guardian-api \
    --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/guardian-api/guardian-api:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10 \
    --set-env-vars CORS_ORIGINS=https://guardian.korymsmith.dev,LOG_LEVEL=INFO
```

## Required Environment Variables

### CORS_ORIGINS (Required)
Comma-separated list of allowed frontend origins.

**Example:**
```
CORS_ORIGINS=https://guardian.korymsmith.dev,http://localhost:5173,http://127.0.0.1:5173
```

**Default (if not set):**
- `https://guardian.korymsmith.dev`
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000`
- `http://127.0.0.1:3000`

### LOG_LEVEL (Optional)
Logging level for the application.

**Options:** `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`

**Default:** `INFO`

### REDIS_URL (Optional)
Redis connection URL for rate limiting.

**Format:** `rediss://default:<token>@<host>:<port>`

**Note:** If not provided, rate limiting will be disabled (fail-open design).

**Example (Upstash Redis):**
```
REDIS_URL=rediss://default:abc123@xyz.upstash.io:6379
```

### HUGGINGFACE_HUB_TOKEN (Optional)
HuggingFace token for accessing private models or rate-limited public models.

**Note:** The toxicity model (`unitary/unbiased-toxic-roberta`) is public and doesn't require a token, but having one can improve download reliability.

### PORT (Automatic)
Cloud Run automatically sets the `PORT` environment variable. The application uses this with a fallback to 8080.

## Model Files

The backend requires the following model files to be present in the Docker image:

- `backend/app/models/sexism/classifier.pkl` - LASSO sexism classifier
- `backend/app/models/sexism/vectorizer.pkl` - Text vectorizer
- `backend/app/models/rules/*.json` - Rule engine configuration files

### Model Files in Git

Model files are included in the repository and will be copied into the Docker image during build:

```bash
# Verify model files are committed
git ls-files backend/app/models/sexism/*.pkl
```

## Deployment Process

### 1. Initial Build

- First deployment may take 10-15 minutes
- Docker image build includes all Python dependencies
- Models are downloaded from HuggingFace on first startup
- Check Cloud Run logs for model loading status

### 2. Health Check

After deployment, verify health endpoint:

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe guardian-api --region us-central1 --format 'value(status.url)')

# Test health endpoint
curl ${SERVICE_URL}/v1/health
```

Should return model status information.

### 3. Verify CORS

- Test from your frontend
- Check browser console for CORS errors
- Verify `Access-Control-Allow-Origin` header includes your frontend URL

## Cloud Run Configuration

### Resource Allocation

Recommended settings for production:

- **Memory**: 2Gi (sufficient for all models)
- **CPU**: 2 (for faster inference)
- **Timeout**: 300s (5 minutes for model loading)
- **Max Instances**: 10 (adjust based on traffic)
- **Min Instances**: 0 (scale to zero when idle)

### Update Service Configuration

```bash
gcloud run services update guardian-api \
    --region us-central1 \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --max-instances 10
```

## Continuous Deployment

### Set up Cloud Build Trigger

1. **Connect Repository**
   ```bash
   gcloud builds triggers create github \
       --repo-name=GuardianAPI \
       --repo-owner=YOUR_GITHUB_USERNAME \
       --branch-pattern="^main$" \
       --build-config=backend/cloudbuild.yaml
   ```

2. **Configure Substitutions**
   - Set `_CORS_ORIGINS` in trigger settings
   - Set `_LOG_LEVEL` if needed
   - Configure `_REGION` and `_SERVICE_NAME`

3. **Automatic Deployments**
   - Every push to `main` triggers a build
   - Cloud Build builds and deploys automatically
   - New revisions are created for each deployment

## Troubleshooting

### Service Won't Start

**Check Cloud Run Logs:**
```bash
gcloud run services logs read guardian-api --region us-central1
```

**Common Issues:**
- Verify all dependencies install correctly
- Check for Python version compatibility
- Ensure `requirements.txt` is up to date
- Verify Dockerfile builds successfully locally

### Models Not Loading

**Symptoms:**
- Health endpoint shows models as "not loaded"
- Moderation requests fail

**Solutions:**
1. Check Cloud Run logs for model loading errors
2. Verify HuggingFace model is accessible
3. Ensure sufficient memory allocated (2Gi recommended)
4. Check for network connectivity issues

### CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors

**Solutions:**
1. Verify `CORS_ORIGINS` environment variable includes your frontend URL
2. Check for trailing slashes in URLs
3. Ensure frontend URL matches exactly (including `https://`)
4. Review `backend/app/config.py` CORS configuration

### Cold Start Delays

**Cause:** Cloud Run scales to zero when idle

**Solutions:**
1. Set minimum instances to 1 (prevents scale-to-zero)
   ```bash
   gcloud run services update guardian-api \
       --min-instances 1 \
       --region us-central1
   ```
2. Accept cold start delay (usually 10-30 seconds)
3. Use Cloud Scheduler to ping service periodically

## Updating Frontend Configuration

After deploying the backend, update your frontend to use the Cloud Run URL:

1. **Get Service URL:**
   ```bash
   gcloud run services describe guardian-api \
       --region us-central1 \
       --format 'value(status.url)'
   ```

2. **Set Environment Variable** (for Netlify):
   ```
   VITE_API_BASE_URL=https://guardian-api-xxxxx-uc.a.run.app
   ```

3. **Or Update** `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://guardian-api-xxxxx-uc.a.run.app';
   ```

4. **Rebuild and Redeploy Frontend**

## Monitoring

### View Logs

```bash
# Real-time logs
gcloud run services logs tail guardian-api --region us-central1

# Historical logs
gcloud run services logs read guardian-api --region us-central1 --limit 50
```

### Health Monitoring

- Use `/v1/health` endpoint for health checks
- Monitor model loading status
- Check response times in Cloud Run metrics

### Cloud Run Metrics

View in GCP Console:
- Request count
- Latency
- Error rate
- Instance count
- Memory/CPU usage

## Security Considerations

1. **CORS Configuration**
   - Never use `"*"` in production
   - Only allow specific frontend origins
   - Update when adding new frontend deployments

2. **Environment Variables**
   - Never commit secrets to repository
   - Use Cloud Run's environment variable management
   - Use Secret Manager for sensitive values:
     ```bash
     gcloud run services update guardian-api \
         --update-secrets REDIS_URL=redis-url:latest \
         --region us-central1
     ```

3. **Rate Limiting**
   - Configure Redis for production
   - Adjust `RATE_LIMIT_PER_MINUTE` as needed
   - Monitor for abuse

4. **Authentication** (Optional)
   - For private APIs, require authentication:
     ```bash
     gcloud run services update guardian-api \
         --no-allow-unauthenticated \
         --region us-central1
     ```

## Cost Optimization

### Free Tier
- 2 million requests/month free
- 360,000 GB-seconds of memory free
- 180,000 vCPU-seconds free

### Cost Management
- Use scale-to-zero (min instances = 0) when possible
- Right-size memory allocation (start with 2Gi)
- Monitor usage in GCP Console
- Set up billing alerts

## Next Steps

After successful deployment:

1. ✅ Verify health endpoint responds
2. ✅ Test moderation endpoint from frontend
3. ✅ Update frontend `VITE_API_BASE_URL`
4. ✅ Rebuild and redeploy frontend
5. ✅ Test end-to-end functionality
6. ✅ Monitor logs and metrics
7. ✅ Set up Cloud Build triggers for CI/CD

## Support

For issues specific to:
- **Google Cloud Run**: Check [Cloud Run Documentation](https://cloud.google.com/run/docs)
- **Cloud Build**: Check [Cloud Build Documentation](https://cloud.google.com/build/docs)
- **GuardianAPI**: Review `backend/README.md` and project documentation
- **Model Loading**: Check Cloud Run logs and model file paths
