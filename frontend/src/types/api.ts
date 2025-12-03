/**
 * TypeScript types for GuardianAPI responses
 */

export interface SexismResponse {
  score: number;
  severity: string;
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
  summary: string;
  primary_issue: string;
  score: number;
  severity: string;
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

export interface HealthResponse {
  status: string;
  version: string;
  models_loaded: boolean;
}

export interface ModelInfoResponse {
  name: string;
  version: string;
  loaded: boolean;
  description?: string;
}

export interface ModelsResponse {
  models: ModelInfoResponse[];
}

export type APIStatus = 'healthy' | 'degraded' | 'offline';
export type Theme = 'light' | 'dark';
export type Severity = 'low' | 'moderate' | 'high';

