## @zobi-ui/core/connection

Connection modules for Zobi:

- `ZobiClient` requests and authentication
- (future) `i18n` locales and translation

### ZobiClient

The `ZobiClient` handles all client-side requests to the Zobi backend. It can be configured
for use within the Zobi application, or used to issue `CORS` requests in other applications. At
a high-level it supports:

- `CSRF` token authentication
  - a token may be passed at configuration time, else the client will handle fetching and passing
    the token in all subsequent requests.
  - queues requests in the case that another request is made before the token is received.
  - it checks for a token before every request, and will fail if no token was received or if it has
    expired. In either case the user should be directed to re-authenticate.
- supports `GET` and `POST` requests (no `PUT` or `DELETE`)
- timeouts
- query aborts through the `AbortController` API
- conditional `GET` requests using `If-None-Match` and `ETag` headers

#### Example usage

```javascript
// appSetup.js
import { ZobiClient } from `@zobi-ui/core`;

ZobiClient.configure(...clientConfig);
ZobiClient.init(); // CSRF auth, can also chain `.configure().init();

// anotherFile.js
import { ZobiClient } from `@zobi-ui/core`;

ZobiClient.post(...requestConfig)
  .then(({ request, json }) => ...)
  .catch((error) => ...);
```

#### API

##### Client Configuration

The following flags can be passed in the client config call
`ZobiClient.configure(...clientConfig);`

- `protocol = 'http:'`
- `host`
- `headers`
- `credentials = 'same-origin'` (set to `include` for non-Zobi apps)
- `mode = 'same-origin'` (set to `cors` for non-Zobi apps)
- `timeout`
- `csrfToken` you can configure the client with a CSRF token at configuration time, else the client
  will attempt to fetch this before any other requests are issued

##### Per-request Configuration

The following flags can be passed on a per-request call `ZobiClient.get/post(...requestConfig);`

- `url` or `endpoint`
- `headers`
- `body`
- `timeout`
- `signal` (for aborting, from `const { signal } = (new AbortController())`)
- for `POST` requests
  - `postPayload` (key values are added to a `new FormData()`)
  - `stringify` whether to call `JSON.stringify` on `postPayload` values

##### Request aborting

Per-request aborting is implemented through the `AbortController` API:

```javascript
import { ZobiClient } from '@zobi-ui/core';

const controller = new AbortController();
const { signal } = controller;

ZobiClient.get({ ..., signal }).then(...).catch(...);

if (IWantToCancelForSomeReason) {
  signal.abort(); // Promise is rejected, request `catch` is invoked
}
```
