import { authentication as authenticationApi } from '@zobi.dev/extension-api';
import { ZobiClient } from '@zobi.dev/core';

const getCSRFToken: typeof authenticationApi.getCSRFToken = () =>
  ZobiClient.getCSRFToken();

export const authentication: typeof authenticationApi = {
  getCSRFToken,
};
