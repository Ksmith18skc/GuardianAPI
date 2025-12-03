/**
 * API service for GuardianAPI
 * Enhanced with better error handling and network diagnostics
 */

import type {
  ModerationResponse,
  HealthResponse,
  ModelsResponse,
} from '../types/api';

// Use environment variable or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any,
    public type: 'network' | 'cors' | 'http' | 'parse' | 'unknown' = 'unknown'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Enhanced fetch wrapper with better error detection
 */
async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response;
  } catch (error) {
    // Network error (server unreachable, DNS failure, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        'Network error: Unable to reach the API server. Is the backend running?',
        undefined,
        undefined,
        'network'
      );
    }

    // CORS error (usually no response, but browser blocks it)
    if (error instanceof TypeError) {
      throw new APIError(
        'CORS error: The backend may not be allowing requests from this origin. Check CORS configuration.',
        undefined,
        undefined,
        'cors'
      );
    }

    // Re-throw unknown errors
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown network error',
      undefined,
      undefined,
      'unknown'
    );
  }
}

/**
 * Moderate a single text
 */
export async function moderateText(text: string): Promise<ModerationResponse> {
  try {
    const response = await fetchWithErrorHandling(
      `${API_BASE_URL}/v1/moderate/text`,
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      }
    );

    // Handle HTTP errors
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        // If JSON parsing fails, use status text
        errorData = { detail: response.statusText };
      }

      throw new APIError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData,
        'http'
      );
    }

    // Parse JSON response
    try {
      return await response.json();
    } catch (error) {
      throw new APIError(
        'Failed to parse response: Invalid JSON received',
        response.status,
        undefined,
        'parse'
      );
    }
  } catch (error) {
    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }
    
    // Wrap unexpected errors
    throw new APIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      undefined,
      'unknown'
    );
  }
}

/**
 * Check API health status with retry logic
 */
export async function checkHealth(retries: number = 2): Promise<HealthResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithErrorHandling(
        `${API_BASE_URL}/v1/health`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new APIError(
          `Health check failed: ${response.statusText}`,
          response.status,
          undefined,
          'http'
        );
      }

      try {
        return await response.json();
      } catch (error) {
        throw new APIError(
          'Failed to parse health check response',
          response.status,
          undefined,
          'parse'
        );
      }
    } catch (error) {
      lastError = error instanceof APIError ? error : new APIError(
        error instanceof Error ? error.message : 'Health check failed',
        undefined,
        undefined,
        'unknown'
      );

      // Don't retry on the last attempt
      if (attempt < retries) {
        // Exponential backoff: 500ms, 1000ms, 2000ms
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        continue;
      }
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new APIError('Health check failed after retries', undefined, undefined, 'network');
}

/**
 * Get model information
 */
export async function getModels(): Promise<ModelsResponse> {
  try {
    const response = await fetchWithErrorHandling(
      `${API_BASE_URL}/v1/models`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new APIError(
        `Failed to fetch models: ${response.statusText}`,
        response.status,
        undefined,
        'http'
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new APIError(
        'Failed to parse models response',
        response.status,
        undefined,
        'parse'
      );
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(
      error instanceof Error ? error.message : 'Failed to fetch models',
      undefined,
      undefined,
      'unknown'
    );
  }
}
