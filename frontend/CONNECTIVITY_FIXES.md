# API Connectivity Fixes - Summary

## Issues Fixed

### 1. ✅ API Base URL Configuration
**Problem**: Frontend was using `http://localhost:8000` which can cause issues on some systems.

**Fix**: 
- Changed to `http://127.0.0.1:8000` (more reliable)
- Added environment variable support: `VITE_API_BASE_URL`
- Falls back to `127.0.0.1:8000` if not set

**Files Changed**:
- `frontend/src/services/api.ts`

### 2. ✅ Enhanced Error Handling
**Problem**: Generic "Failed to fetch" errors didn't help diagnose issues.

**Fix**:
- Added `APIError` class with error types: `network`, `cors`, `http`, `parse`, `unknown`
- Better error messages for each error type
- Network errors: "Unable to reach the API server"
- CORS errors: "Backend may not be configured to allow requests"
- HTTP errors: Include status code and message
- Parse errors: "Invalid JSON received"

**Files Changed**:
- `frontend/src/services/api.ts`
- `frontend/src/hooks/useModeration.ts`

### 3. ✅ CORS Configuration
**Problem**: CORS was set to `["*"]` but needed explicit localhost origins.

**Fix**:
- Added explicit origins: `localhost:5173`, `127.0.0.1:5173`, `localhost:3000`, `127.0.0.1:3000`
- Kept `"*"` as fallback for development
- Production should restrict to specific domains

**Files Changed**:
- `backend/app/config.py`

### 4. ✅ Health Check Improvements
**Problem**: Health check failed silently, status indicator always showed "Offline".

**Fix**:
- Added retry logic with exponential backoff (500ms, 1000ms, 2000ms)
- Better error type detection
- Status indicator shows "Checking..." during health checks
- Distinguishes between offline, degraded, and healthy states

**Files Changed**:
- `frontend/src/services/api.ts` (checkHealth function)
- `frontend/src/hooks/useAPIStatus.ts`
- `frontend/src/components/ui/APIStatusIndicator.tsx`

### 5. ✅ Loading States
**Problem**: No visual feedback during analysis or health checks.

**Fix**:
- Added loading animation in results panel during analysis
- Status indicator shows "Checking..." with pulsing animation
- Results panel properly resets on new requests

**Files Changed**:
- `frontend/src/App.tsx`
- `frontend/src/components/ui/APIStatusIndicator.tsx`

## Testing the Fixes

### 1. Verify Backend is Running
```bash
cd backend
py -3.11 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Test Health Endpoint
Open in browser: `http://127.0.0.1:8000/v1/health`

Expected response:
```json
{
  "status": "healthy",
  "version": "v1",
  "models_loaded": true
}
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

Open: `http://localhost:5173`

### 4. Verify Connection
- Status indicator should show "Online" (green dot)
- If it shows "Offline", check:
  - Backend is running on `127.0.0.1:8000`
  - No firewall blocking the connection
  - Browser console for CORS errors

### 5. Test Moderation
1. Enter text in the input field
2. Click "Analyze Text"
3. Should see:
   - Scanning beam animation
   - Results appear in right panel
   - No error messages

## Troubleshooting

### Status Shows "Offline"
1. **Check backend is running**: `curl http://127.0.0.1:8000/v1/health`
2. **Check CORS**: Open browser DevTools → Network tab → Look for CORS errors
3. **Check API URL**: Verify `frontend/src/services/api.ts` uses `127.0.0.1:8000`

### "Failed to fetch" Error
1. **Network Error**: Backend not running or wrong port
2. **CORS Error**: Check `backend/app/config.py` CORS_ORIGINS includes your frontend URL
3. **HTTP Error**: Check backend logs for error details

### Results Not Appearing
1. Check browser console for errors
2. Verify API response in Network tab
3. Check that `result` state is being set in `useModeration` hook

## Environment Variables (Optional)

Create `frontend/.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

This allows you to easily change the API URL for different environments.

## Production Considerations

1. **CORS**: Update `backend/app/config.py` to only allow your production domain:
   ```python
   CORS_ORIGINS: list = [
       "https://yourdomain.com",
       "https://www.yourdomain.com"
   ]
   ```

2. **API URL**: Set `VITE_API_BASE_URL` in your build environment to point to production API

3. **Error Handling**: Consider adding error tracking (Sentry, etc.) for production

## Summary of Changes

- ✅ Fixed API base URL to use `127.0.0.1:8000`
- ✅ Enhanced error handling with specific error types
- ✅ Improved CORS configuration
- ✅ Added retry logic to health checks
- ✅ Better loading states and user feedback
- ✅ More descriptive error messages
- ✅ Status indicator with loading animation

All connectivity issues should now be resolved!

