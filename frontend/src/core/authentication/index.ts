import { authentication as authenticationApi } from '@zobi/core';
import { ZobiClient } from '@zobi-ui/core';

const getCSRFToken: typeof authenticationApi.getCSRFToken = () =>
  ZobiClient.getCSRFToken();

export const authentication: typeof authenticationApi = {
  getCSRFToken,
};
