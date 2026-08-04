import Owner from 'src/types/Owner';

/**
 * A single input in the provider credential form.
 *
 * The backend registry (`zobi/llm/provider_specs.py`) is the only place that
 * knows which fields a provider needs and which of them are secret, so the
 * form is rendered entirely from this payload. Adding a provider server-side
 * makes it selectable here with no frontend change.
 */
export type ProviderField = {
  name: string;
  label: string;
  required: boolean;
  secret: boolean;
  type: 'text' | 'password' | 'textarea';
  placeholder: string;
  help_text: string;
  default: string | null;
};

export type ProviderSpec = {
  key: string;
  label: string;
  description: string;
  model_prefix: string;
  supports_model_listing: boolean;
  allows_extra_params: boolean;
  docs_url: string;
  fields: ProviderField[];
};

/**
 * Values in `public_params` are already masked server-side: secrets come back
 * as the `PASSWORD_MASK` sentinel, never as real credentials. Sending a masked
 * value back on save means "keep the stored one".
 */
export type LLMProviderObject = {
  id?: number;
  uuid?: string;
  name: string;
  provider_key: string;
  public_params?: Record<string, string>;
  params?: Record<string, string>;
  is_active?: boolean;
  last_tested_at?: string | null;
  last_test_error?: string | null;
  changed_on_delta_humanized?: string;
  changed_by?: Owner;
};

export type LLMModelObject = {
  id?: number;
  uuid?: string;
  provider_id: number;
  provider?: { name: string; provider_key: string };
  /** Router alias. Repeats across rows form a load-balanced pool. */
  alias: string;
  model_string: string;
  supports_chat?: boolean;
  supports_transcription?: boolean;
  supports_embeddings?: boolean;
  supports_vision?: boolean;
  tpm?: number | null;
  rpm?: number | null;
  max_parallel_requests?: number | null;
  max_budget?: number | null;
  budget_duration?: string | null;
  extra_params?: Record<string, unknown>;
  is_active?: boolean;
  changed_on_delta_humanized?: string;
};

export type FallbackEntry = {
  primary: string;
  backups: string[];
};

export type RouterConfig = {
  routing_strategy: string;
  num_retries: number | null;
  timeout: number | null;
  cooldown_time: number | null;
  default_max_parallel_requests: number | null;
  fallbacks: FallbackEntry[];
  default_chat_alias: string | null;
  default_transcription_alias: string | null;
  default_embedding_alias: string | null;
};

export type TestResult = {
  result: boolean;
  error?: string | null;
};

export const ROUTING_STRATEGIES = [
  'simple-shuffle',
  'least-busy',
  'usage-based-routing',
  'latency-based-routing',
] as const;

export const CAPABILITY_FIELDS = [
  'supports_chat',
  'supports_transcription',
  'supports_embeddings',
  'supports_vision',
] as const;
