import { ZobiClient, JsonObject, JsonResponse } from '@zobi.dev/core';
import { sanitizeFormData } from 'src/utils/sanitizeFormData';

type Payload = {
  datasource_id: number;
  datasource_type: string;
  form_data: string;
  chart_id?: number;
};

const assembleEndpoint = (key?: string, tabId?: string) => {
  let endpoint = 'api/v1/explore/form_data';

  if (key) endpoint = endpoint.concat(`/${key}`);
  if (tabId) endpoint = endpoint.concat(`?tab_id=${tabId}`);

  return endpoint;
};

const assemblePayload = (
  datasourceId: number,
  datasourceType: string,
  formData: JsonObject,
  chartId?: number,
): Payload => {
  const payload: Payload = {
    datasource_id: datasourceId,
    datasource_type: datasourceType,
    form_data: JSON.stringify(sanitizeFormData(formData)),
  };

  if (chartId) payload.chart_id = chartId;

  return payload;
};

export const postFormData = (
  datasourceId: number,
  datasourceType: string,
  formData: JsonObject,
  chartId?: number,
  tabId?: string,
): Promise<string> =>
  ZobiClient.post({
    endpoint: assembleEndpoint(undefined, tabId),
    jsonPayload: assemblePayload(
      datasourceId,
      datasourceType,
      formData,
      chartId,
    ),
  }).then((r: JsonResponse) => r.json.key);

export const putFormData = (
  datasourceId: number,
  datasourceType: string,
  key: string,
  formData: JsonObject,
  chartId?: number,
  tabId?: string,
): Promise<string> =>
  ZobiClient.put({
    endpoint: assembleEndpoint(key, tabId),
    jsonPayload: assemblePayload(
      datasourceId,
      datasourceType,
      formData,
      chartId,
    ),
  }).then((r: JsonResponse) => r.json.message);
