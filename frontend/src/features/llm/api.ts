import { ZobiClient } from '@zobi.dev/core';
import rison from 'rison';
import {
  LLMModelObject,
  LLMProviderObject,
  ProviderSpec,
  RouterConfig,
  TestResult,
} from './types';

export const fetchProviderSpecs = (): Promise<ProviderSpec[]> =>
  ZobiClient.get({ endpoint: '/api/v1/llm_provider/available/' }).then(
    ({ json }) => json.result,
  );

export const fetchProviders = (): Promise<LLMProviderObject[]> =>
  ZobiClient.get({
    // Page size is generous because the page renders every provider at once
    // rather than paginating; instances have a handful, not hundreds.
    endpoint: `/api/v1/llm_provider/?q=${rison.encode({
      order_column: 'name',
      order_direction: 'asc',
      page_size: 100,
    })}`,
  }).then(({ json }) => json.result);

export const fetchModels = (): Promise<LLMModelObject[]> =>
  ZobiClient.get({
    endpoint: `/api/v1/llm_model/?q=${rison.encode({
      order_column: 'alias',
      order_direction: 'asc',
      page_size: 500,
    })}`,
  }).then(({ json }) => json.result);

export const createProvider = (provider: Partial<LLMProviderObject>) =>
  ZobiClient.post({
    endpoint: '/api/v1/llm_provider/',
    jsonPayload: provider,
  });

export const updateProvider = (
  id: number,
  provider: Partial<LLMProviderObject>,
) =>
  ZobiClient.put({
    endpoint: `/api/v1/llm_provider/${id}`,
    jsonPayload: provider,
  });

export const deleteProvider = (id: number) =>
  ZobiClient.delete({ endpoint: `/api/v1/llm_provider/${id}` });

/**
 * Verify credentials, optionally against a provider that already exists.
 *
 * Passing `provider_id` lets the server resolve masked secrets from storage,
 * so an admin can re-test without retyping their API key.
 */
export const testProviderConnection = (payload: {
  provider_key: string;
  params: Record<string, string>;
  model_string: string;
  provider_id?: number | null;
}): Promise<TestResult> =>
  ZobiClient.post({
    endpoint: '/api/v1/llm_provider/test_connection/',
    jsonPayload: payload,
  }).then(({ json }) => json as TestResult);

/** Model identifiers the vendor reports, or `[]` where it has no catalogue. */
export const fetchProviderModels = (id: number): Promise<string[]> =>
  ZobiClient.get({ endpoint: `/api/v1/llm_provider/${id}/models/` }).then(
    ({ json }) => json.result,
  );

export const createModel = (model: Partial<LLMModelObject>) =>
  ZobiClient.post({ endpoint: '/api/v1/llm_model/', jsonPayload: model });

export const updateModel = (id: number, model: Partial<LLMModelObject>) =>
  ZobiClient.put({ endpoint: `/api/v1/llm_model/${id}`, jsonPayload: model });

export const deleteModel = (id: number) =>
  ZobiClient.delete({ endpoint: `/api/v1/llm_model/${id}` });

export const fetchRouterConfig = (): Promise<RouterConfig> =>
  ZobiClient.get({ endpoint: '/api/v1/llm_router_config/' }).then(
    ({ json }) => json.result,
  );

export const saveRouterConfig = (
  config: Partial<RouterConfig>,
): Promise<RouterConfig> =>
  ZobiClient.put({
    endpoint: '/api/v1/llm_router_config/',
    jsonPayload: config,
  }).then(({ json }) => json.result);
