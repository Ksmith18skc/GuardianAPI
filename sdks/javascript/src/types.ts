/**
 * TypeScript type definitions for Guardian API
 */

export interface SexismResponse {
  score: number;
  severity: 'low' | 'moderate' | 'high';
  model_version: string;
  threshold_met?: boolean;
}

export interface ToxicityResponse {
  overall: number;
  insult: number;
  threat: number;
  identity_attack: number;
  profanity: number;
  model_version: string;
}

export interface RulesResponse {
  slur_detected: boolean;
  threat_detected: boolean;
  self_harm_flag: boolean;
  profanity_flag: boolean;
  caps_abuse: boolean;
  character_repetition: boolean;
  model_version: string;
}

export interface EnsembleResponse {
  summary: 'likely_safe' | 'potentially_harmful' | 'likely_harmful' | 'highly_harmful';
  primary_issue: string;
  score: number;
  severity: 'low' | 'moderate' | 'high';
}

export interface MetaResponse {
  processing_time_ms: number;
  models_used: string[];
}

export interface ModerationResponse {
  text: string;
  label: {
    sexism: SexismResponse;
    toxicity: ToxicityResponse;
    rules: RulesResponse;
  };
  ensemble: EnsembleResponse;
  meta: MetaResponse;
}

export interface BatchModerationResponse {
  results: ModerationResponse[];
  total_processed: number;
  processing_time_ms: number;
}

export interface ModelInfo {
  name: string;
  version: string;
  loaded: boolean;
  description?: string;
}

export interface ModelsResponse {
  models: ModelInfo[];
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  version: string;
  models_loaded: boolean;
}

export interface GuardianClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

