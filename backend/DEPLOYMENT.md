# GuardianAPI Backend Deployment Guide

This guide covers deploying the GuardianAPI FastAPI backend to Render.com.

## Prerequisites

- GitHub repository with backend code
- Render.com account (free tier available)
- Model files (`.pkl` files) committed to repository or available via alternative storage

## Quick Start

### Option 1: Using Render Blueprint (Recommended)

1. **Push changes to GitHub**
   - Ensure `backend/render.yaml` is committed
   - Push to your main branch

2. **Connect Render to GitHub**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository and branch
   - Render will automatically detect `render.yaml`

3. **Review and Deploy**
   - Render will show the service configuration
   - Review environment variables
   - Click "Apply" to create and deploy

### Option 2: Manual Setup

1. **Create New Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service Settings**
   - **Name**: `guardian-api` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables**
   - Go to "Environment" tab
   - Add the following variables:

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

## Model Files

The backend requires the following model files to be present:

- `backend/app/models/sexism/classifier.pkl` - LASSO sexism classifier
- `backend/app/models/sexism/vectorizer.pkl` - Text vectorizer
- `backend/app/models/rules/*.json` - Rule engine configuration files

### Important: Model Files in Git

By default, `.pkl` files are excluded in `.gitignore`. For Render deployment, you have two options:

**Option 1: Commit Model Files (Recommended for Free Tier)**
```bash
# Force add model files
git add -f backend/app/models/sexism/*.pkl
git commit -m "Add model files for deployment"
git push
```

**Option 2: Use External Storage**
- Upload models to cloud storage (S3, Google Cloud Storage, etc.)
- Download during build process using a build script
- More complex but keeps repository size smaller

## Deployment Process

1. **Initial Build**
   - First deployment may take 5-10 minutes
   - Render installs all Python dependencies
   - Models are loaded on startup
   - Check logs for model loading status

2. **Health Check**
   - After deployment, verify health endpoint:
   ```bash
   curl https://your-service.onrender.com/v1/health
   ```
   - Should return model status information

3. **Verify CORS**
   - Test from your frontend
   - Check browser console for CORS errors
   - Verify `Access-Control-Allow-Origin` header includes your frontend URL

## Free Tier Limitations

### Spin-Down Behavior
- Render free tier services spin down after **15 minutes of inactivity**
- First request after spin-down may take **30-60 seconds** to respond
- Subsequent requests are fast until next spin-down

### Resource Limits
- **512 MB RAM**
- **0.1 CPU** (shared)
- **100 GB bandwidth/month**

### Recommendations
- For production use, consider upgrading to paid tier ($7/month) for:
  - Always-on service (no spin-down)
  - More resources
  - Better performance

## Troubleshooting

### Service Won't Start

**Check Build Logs:**
- Verify all dependencies install correctly
- Check for Python version compatibility
- Ensure `requirements.txt` is up to date

**Check Runtime Logs:**
- Look for model loading errors
- Verify environment variables are set correctly
- Check for port binding issues

### Models Not Loading

**Symptoms:**
- Health endpoint shows models as "not loaded"
- Moderation requests fail

**Solutions:**
1. Verify model files are in repository or accessible
2. Check file paths in `config.py`
3. Review startup logs for specific error messages
4. Ensure sufficient disk space (models are ~few MB each)

### CORS Errors

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors

**Solutions:**
1. Verify `CORS_ORIGINS` includes your frontend URL
2. Check for trailing slashes in URLs
3. Ensure frontend URL matches exactly (including `https://`)
4. Review `backend/app/config.py` CORS configuration

### Slow First Request

**Cause:** Free tier spin-down behavior

**Solutions:**
1. Upgrade to paid tier for always-on service
2. Use a "ping" service to keep service awake (not recommended for production)
3. Accept the cold start delay

## Updating Frontend Configuration

After deploying the backend, update your frontend to use the Render URL:

1. **Set Environment Variable** (for Netlify):
   ```
   VITE_API_BASE_URL=https://your-service.onrender.com
   ```

2. **Or Update** `frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-service.onrender.com';
   ```

3. **Rebuild and Redeploy Frontend**

## Monitoring

### View Logs
- Go to Render dashboard → Your service → "Logs" tab
- Real-time logs available
- Historical logs retained

### Health Monitoring
- Use `/v1/health` endpoint for health checks
- Monitor model loading status
- Check response times

## Security Considerations

1. **CORS Configuration**
   - Never use `"*"` in production
   - Only allow specific frontend origins
   - Update when adding new frontend deployments

2. **Environment Variables**
   - Never commit secrets to repository
   - Use Render's environment variable management
   - Rotate Redis tokens periodically

3. **Rate Limiting**
   - Configure Redis for production
   - Adjust `RATE_LIMIT_PER_MINUTE` as needed
   - Monitor for abuse

## Next Steps

After successful deployment:

1. ✅ Verify health endpoint responds
2. ✅ Test moderation endpoint from frontend
3. ✅ Update frontend `VITE_API_BASE_URL`
4. ✅ Rebuild and redeploy frontend
5. ✅ Test end-to-end functionality
6. ✅ Monitor logs for any issues

## Support

For issues specific to:
- **Render Platform**: Check [Render Documentation](https://render.com/docs)
- **GuardianAPI**: Review `backend/README.md` and project documentation
- **Model Loading**: Check startup logs and model file paths

