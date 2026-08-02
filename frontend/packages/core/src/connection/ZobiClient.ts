import ZobiClientClass from './ZobiClientClass';
import { ZobiClientInterface } from './types';

// this is local to this file, don't expose it
let singletonClient: ZobiClientClass | undefined;

function getInstance(): ZobiClientClass {
  if (!singletonClient) {
    throw new Error(
      'You must call ZobiClient.configure(...) before calling other methods',
    );
  }
  return singletonClient;
}

const ZobiClient: ZobiClientInterface = {
  configure: config => {
    singletonClient = new ZobiClientClass(config);
    return ZobiClient;
  },
  reset: () => {
    singletonClient = undefined;
  },
  delete: request => getInstance().delete(request),
  get: request => getInstance().get(request),
  init: force => getInstance().init(force),
  isAuthenticated: () => getInstance().isAuthenticated(),
  getGuestToken: () => getInstance().getGuestToken(),
  post: request => getInstance().post(request),
  postForm: (...args) => getInstance().postForm(...args),
  put: request => getInstance().put(request),
  reAuthenticate: () => getInstance().reAuthenticate(),
  request: request => getInstance().request(request),
  getCSRFToken: () => getInstance().getCSRFToken(),
  getUrl: (...args) => getInstance().getUrl(...args),
};

export default ZobiClient;
