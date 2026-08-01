import { ZobiClient } from '@zobi.dev/core';
import { logging } from '@zobi.dev/extension-api/utils';
import { DashboardPermalinkValue } from 'src/dashboard/types';

const assembleEndpoint = (
  dashId: string | number,
  key?: string | null,
  tabId?: string,
) => {
  let endpoint = `/api/v1/dashboard/${dashId}/filter_state`;
  if (key) {
    endpoint = endpoint.concat(`/${key}`);
  }
  if (tabId) {
    endpoint = endpoint.concat(`?tab_id=${tabId}`);
  }
  return endpoint;
};

export const updateFilterKey = (
  dashId: string,
  value: string,
  key: string,
  tabId?: string,
) =>
  ZobiClient.put({
    endpoint: assembleEndpoint(dashId, key, tabId),
    jsonPayload: { value },
  })
    .then(r => r.json.message)
    .catch(err => {
      logging.error(err);
      return null;
    });

export const createFilterKey = (
  dashId: string | number,
  value: string,
  tabId?: string,
) =>
  ZobiClient.post({
    endpoint: assembleEndpoint(dashId, undefined, tabId),
    jsonPayload: { value },
  })
    .then(r => r.json.key as string)
    .catch(err => {
      logging.error(err);
      return null;
    });

export const getFilterValue = (dashId: string | number, key?: string | null) =>
  ZobiClient.get({
    endpoint: assembleEndpoint(dashId, key),
  })
    .then(({ json }) => JSON.parse(json.value))
    .catch(err => {
      logging.error(err);
      return null;
    });

export const getPermalinkValue = (key: string) =>
  ZobiClient.get({
    endpoint: `/api/v1/dashboard/permalink/${key}`,
  })
    .then(({ json }) => json as DashboardPermalinkValue)
    .catch(err => {
      logging.error(err);
      return null;
    });
