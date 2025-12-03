/**
 * Moderation hook for API calls with enhanced error handling
 */

import { useState } from 'react';
import { moderateText, APIError } from '../services/api';
import type { ModerationResponse } from '../types/api';

export function useModeration() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ModerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (text: string) => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null); // Reset previous results

    try {
      const response = await moderateText(text);
      setResult(response);
    } catch (err) {
      if (err instanceof APIError) {
        // Provide user-friendly error messages based on error type
        let userMessage = err.message;
        
        if (err.type === 'network') {
          userMessage = 'Cannot connect to API. Please ensure the backend is running on http://127.0.0.1:8000';
        } else if (err.type === 'cors') {
          userMessage = 'CORS error: Backend may not be configured to allow requests from this origin.';
        } else if (err.type === 'http') {
          userMessage = `API Error (${err.status}): ${err.message}`;
        } else if (err.type === 'parse') {
          userMessage = 'Invalid response from server. Please try again.';
        }
        
        setError(userMessage);
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  return {
    analyze,
    reset,
    isAnalyzing,
    result,
    error,
  };
}
