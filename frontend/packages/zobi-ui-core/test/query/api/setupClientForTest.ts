// eslint-disable-next-line import/no-extraneous-dependencies -- The below fetch-mock import shouldn't be considered as direct dependency
import fetchMock from 'fetch-mock';
import { ZobiClient } from '@zobi-ui/core';

const LOGIN_GLOB = 'glob:*api/v1/security/csrf_token/*';

export default function setupClientForTest() {
  fetchMock.get(LOGIN_GLOB, { result: '1234' });
  ZobiClient.reset();
  ZobiClient.configure().init();
}
