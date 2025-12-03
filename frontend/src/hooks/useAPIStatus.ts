/**
 * API status monitoring hook with improved error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { checkHealth, APIError } from '../services/api';
import type { APIStatus } from '../types/api';

export function useAPIStatus() {
  const [status, setStatus] = useState<APIStatus>('offline');
  const [isChecking, setIsChecking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    setLastError(null);
    
    try {
      const health = await checkHealth(1); // 1 retry with backoff
      setStatus(health.models_loaded ? 'healthy' : 'degraded');
    } catch (error) {
      // Determine status based on error type
      if (error instanceof APIError) {
        if (error.type === 'network' || error.type === 'cors') {
          setStatus('offline');
          setLastError(error.message);
        } else if (error.type === 'http' && error.status === 503) {
          setStatus('degraded');
          setLastError('Service temporarily unavailable');
        } else {
          setStatus('degraded');
          setLastError(error.message);
        }
      } else {
        setStatus('offline');
        setLastError('Unable to connect to API');
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // Check on mount
    checkStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, isChecking, checkStatus, lastError };
}
