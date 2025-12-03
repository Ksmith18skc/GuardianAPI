/**
 * Guardian API Client
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ModerationResponse,
  BatchModerationResponse,
  HealthResponse,
  ModelsResponse,
  GuardianClientOptions,
} from './types';
import { GuardianAPIError, GuardianAPIException } from './exceptions';

export class GuardianClient {
  private client: AxiosInstance;
  private baseUrl: string;

  /**
   * Initialize Guardian API client
   * 
   * @param options Client configuration options
   * 
   * @example
   * ```typescript
   * const client = new GuardianClient({
   *   baseUrl: 'http://localhost:8000',
   *   apiKey: 'your-api-key',
   *   timeout: 30000
   * });
   * ```
   */
  constructor(options: GuardianClientOptions = {}) {
    const {
      baseUrl = 'http://localhost:8000',
      apiKey,
      timeout = 30000,
    } = options;

    this.baseUrl = baseUrl.replace(/\/$/, '');

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
    });
  }

  /**
   * Moderate a single text
   * 
   * @param text Text to moderate (1-10000 characters)
   * @returns Moderation response
   * 
   * @example
   * ```typescript
   * const result = await client.moderateText('This is a test message');
   * console.log(`Score: ${result.ensemble.score}`);
   * console.log(`Severity: ${result.ensemble.severity}`);
   * ```
   */
  async moderateText(text: string): Promise<ModerationResponse> {
    if (!text || !text.trim()) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 10000) {
      throw new Error('Text cannot exceed 10000 characters');
    }

    try {
      const response = await this.client.post<ModerationResponse>(
        '/v1/moderate/text',
        { text: text.trim() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Moderate multiple texts in batch
   * 
   * @param texts Array of texts to moderate (1-100 items, each 1-10000 characters)
   * @returns Batch moderation response
   * 
   * @example
   * ```typescript
   * const results = await client.moderateBatch([
   *   'This is normal text',
   *   'This is harmful text'
   * ]);
   * 
   * for (const result of results.results) {
   *   console.log(`Score: ${result.ensemble.score}`);
   * }
   * ```
   */
  async moderateBatch(texts: string[]): Promise<BatchModerationResponse> {
    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    if (texts.length > 100) {
      throw new Error('Maximum 100 texts per batch');
    }

    // Validate each text
    texts.forEach((text, index) => {
      if (!text || !text.trim()) {
        throw new Error(`Text at index ${index} cannot be empty`);
      }
      if (text.length > 10000) {
        throw new Error(`Text at index ${index} cannot exceed 10000 characters`);
      }
    });

    try {
      const response = await this.client.post<BatchModerationResponse>(
        '/v1/moderate/batch',
        { texts: texts.map(t => t.trim()) }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Check API health status
   * 
   * @returns Health response
   * 
   * @example
   * ```typescript
   * const health = await client.healthCheck();
   * console.log(`Status: ${health.status}`);
   * console.log(`Models loaded: ${health.models_loaded}`);
   * ```
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await this.client.get<HealthResponse>('/v1/health');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Get information about loaded models
   * 
   * @returns Models response
   * 
   * @example
   * ```typescript
   * const models = await client.getModels();
   * for (const model of models.models) {
   *   console.log(`${model.name}: ${model.loaded ? 'loaded' : 'not loaded'}`);
   * }
   * ```
   */
  async getModels(): Promise<ModelsResponse> {
    try {
      const response = await this.client.get<ModelsResponse>('/v1/models');
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Quick health check (returns boolean)
   * 
   * @returns True if API is healthy and all models are loaded
   * 
   * @example
   * ```typescript
   * if (await client.isHealthy()) {
   *   console.log('API is ready');
   * }
   * ```
   */
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy' && health.models_loaded === true;
    } catch {
      return false;
    }
  }

  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const detail = (axiosError.response.data as any)?.detail || axiosError.message;
        throw new GuardianAPIError(
          `API error: ${detail}`,
          status,
          axiosError.response
        );
      } else if (axiosError.request) {
        throw new GuardianAPIException(`Network error: ${axiosError.message}`);
      }
    }
    if (error instanceof GuardianAPIError || error instanceof GuardianAPIException) {
      return; // Already handled
    }
    throw new GuardianAPIException(`Unexpected error: ${error}`);
  }
}

