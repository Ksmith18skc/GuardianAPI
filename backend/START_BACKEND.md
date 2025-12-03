# Starting the GuardianAPI Backend

## Quick Start

### Option 1: Using the Batch Script (Windows)
```bash
cd backend
start_server.bat
```

### Option 2: Manual Start
```bash
cd backend
py -3.11 -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Verify Backend is Running

1. **Check the console output** - You should see:
   ```
   INFO:     Uvicorn running on http://127.0.0.1:8000
   INFO:     Application startup complete.
   ```

2. **Test the health endpoint**:
   - Open browser: `http://127.0.0.1:8000/v1/health`
   - Should return JSON: `{"status": "healthy", "version": "v1", "models_loaded": true}`

3. **Check API docs**:
   - Open browser: `http://127.0.0.1:8000/docs`

## Troubleshooting

### Port Already in Use
If you see "Address already in use":
```bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Python Not Found
Make sure Python 3.11 is installed and in PATH:
```bash
py -3.11 --version
```

### Models Not Loading
- Check that model files exist in `backend/app/models/sexism/`
- Verify Redis connection if using rate limiting
- Check logs for specific model loading errors

## Common Issues

1. **Backend starts but frontend can't connect**
   - Verify backend is on `127.0.0.1:8000` (not `localhost:8000`)
   - Check CORS configuration in `backend/app/config.py`
   - Ensure no firewall is blocking the connection

2. **"Module not found" errors**
   - Install dependencies: `pip install -r requirements.txt`
   - Activate virtual environment if using one

3. **Redis connection errors**
   - Backend will still work without Redis (rate limiting disabled)
   - Check `.env` file for `REDIS_URL` if you want rate limiting

## Next Steps

Once backend is running:
1. Start frontend: `cd frontend && npm run dev`
2. Open playground: `http://localhost:5173`
3. Status indicator should show "Online"

