import fetchMock from 'fetch-mock';
// https://jestjs.io/docs/jest-object#jestmockmodulename-factory-options
// in order to mock modules in test case, so avoid absolute import module
import { ZobiClient } from '../../packages/zobi-ui-core/src/connection';

export default function setupZobiClient() {
  // The following is needed to mock out ZobiClient requests
  // including CSRF authentication and initialization
  global.FormData = window.FormData; // used by ZobiClient
  fetchMock.get('glob:*/api/v1/security/csrf_token/*', { result: '1234' });
  ZobiClient.configure({ protocol: 'http:', host: 'localhost' }).init();
}
