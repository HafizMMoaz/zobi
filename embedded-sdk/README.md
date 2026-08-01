[![Version](https://img.shields.io/npm/v/%40zobi-ui%2Fembedded-sdk?style=flat)](https://www.npmjs.com/package/@zobi-ui/embedded-sdk)
[![Libraries.io](https://img.shields.io/librariesio/release/npm/%40zobi-ui%2Fembedded-sdk?style=flat)](https://libraries.io/npm/@zobi-ui%2Fembedded-sdk)

# Zobi Embedded SDK

The Embedded SDK allows you to embed dashboards from Zobi into your own app,
using your app's authentication.

Embedding is done by inserting an iframe, containing a Zobi page, into the host application.

## Prerequisites

* Activate the feature flag `EMBEDDED_ZOBI`
* Set a strong password in configuration variable `GUEST_TOKEN_JWT_SECRET` (see configuration file config.py). Be aware that its default value must be changed in production.

## Embedding a Dashboard

Using npm:

```sh
npm install --save @zobi-ui/embedded-sdk
```

```js
import { embedDashboard } from "@zobi-ui/embedded-sdk";

embedDashboard({
  id: "abc123", // given by the Zobi embedding UI
  zobiDomain: "https://zobi.example.com",
  mountPoint: document.getElementById("my-zobi-container"), // any html element that can contain an iframe
  fetchGuestToken: () => fetchGuestTokenFromBackend(),
  dashboardUiConfig: { // dashboard UI config: hideTitle, hideTab, hideChartControls, filters.visible, filters.expanded (optional), urlParams (optional)
      hideTitle: true,
      filters: {
          expanded: true,
      },
      urlParams: {
          foo: 'value1',
          bar: 'value2',
          // ...
      }
  },
  // optional additional iframe sandbox attributes
  iframeSandboxExtras: ['allow-top-navigation', 'allow-popups-to-escape-sandbox'],
  // optional Permissions Policy features
  iframeAllowExtras: ['clipboard-write', 'fullscreen'],
  // optional config to enforce a particular referrerPolicy
  referrerPolicy: "same-origin",
  // optional callback to customize permalink URLs
  resolvePermalinkUrl: ({ key }) => `https://my-app.com/analytics/share/${key}`
});
```

You can also load the Embedded SDK from a CDN. The SDK will be available as `zobiEmbeddedSdk` globally:

```html
<script src="https://unpkg.com/@zobi-ui/embedded-sdk"></script>

<script>
  zobiEmbeddedSdk.embedDashboard({
    // ... here you supply the same parameters as in the example above
  });
</script>
```

## Authentication/Authorization with Guest Tokens

Embedded resources use a special auth token called a Guest Token to grant Zobi access to your users,
without requiring your users to log in to Zobi directly. Your backend must create a Guest Token
by requesting Zobi's `POST /security/guest_token` endpoint, and pass that guest token to your frontend.

The Embedding SDK takes the guest token and use it to embed a dashboard.

### Creating a Guest Token

From the backend, http `POST` to `/security/guest_token` with some parameters to define what the guest token will grant access to.
Guest tokens can have Row Level Security rules which filter data for the user carrying the token.

The agent making the `POST` request must be authenticated with the `can_grant_guest_token` permission.

Within your app, using the Guest Token will then allow authentication to your Zobi instance via creating an Anonymous user object.  This guest anonymous user will default to the public role as per this setting `GUEST_ROLE_NAME = "Public"`.

The user parameters in the example below are optional and are provided as a means of passing user attributes that may be accessed in jinja templates inside your charts.

Example `POST /security/guest_token` payload:

```json
{
  "user": {
    "username": "stan_lee",
    "first_name": "Stan",
    "last_name": "Lee"
  },
  "resources": [{
    "type": "dashboard",
    "id": "abc123"
  }],
  "rls": [
    { "clause": "publisher = 'Nintendo'" }
  ]
}
```

Alternatively, a guest token can be created directly in your app without interacting with the Zobi API.
To do this, you should update the `GUEST_TOKEN_JWT_SECRET`
in the Zobi [config.py](https://github.com/HafizMMoaz/zobi/blob/master/zobi/config.py). Also set the
`GUEST_TOKEN_JWT_AUDIENCE` variable that matches what is set for the `aud` in the JSON payload:

```
{
  "user": {
    "username": "embedded@embedded.fr",
    "first_name": "embedded",
    "last_name": "embedded"
  },
  "resources": [
    {
      "type": "dashboard",
      "id": "d73e7841-9342-4afd-8e29-b4a416a2498c"
    }
  ],
  "rls_rules": [],
  "iat": 1730883214,
  "exp": 1732956814,
  "aud": "zobi",
  "type": "guest"
}
```

In this example, the configuration file includes the following setting:

```python
GUEST_TOKEN_JWT_AUDIENCE="zobi"
```


### Sandbox iframe

The Embedded SDK creates an iframe with [sandbox](https://developer.mozilla.org/es/docs/Web/HTML/Element/iframe#sandbox) mode by default
which applies certain restrictions to the iframe's content.
To pass additional sandbox attributes you can use `iframeSandboxExtras`:
```js
  // optional additional iframe sandbox attributes
  iframeSandboxExtras: ['allow-top-navigation', 'allow-popups-to-escape-sandbox']
```

### Permissions Policy

To enable specific browser features within the embedded iframe, use `iframeAllowExtras` to set the iframe's [Permissions Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Permissions_Policy) (the `allow` attribute):

```js
  // optional Permissions Policy features
  iframeAllowExtras: ['clipboard-write', 'fullscreen']
```

Common permissions you might need:
- `clipboard-write` - Required for "Copy permalink to clipboard" functionality
- `fullscreen` - Required for fullscreen chart viewing
- `camera`, `microphone` - If your dashboards include media capture features

### Enforcing a ReferrerPolicy on the request triggered by the iframe

By default, the Embedded SDK creates an `iframe` element without a `referrerPolicy` value enforced. This means that a policy defined for `iframe` elements at the host app level would reflect to it.

This can be an issue as during the embedded enablement for a dashboard it's possible to specify which domain(s) are allowed to embed the dashboard, and this validation happens throuth the `Referrer` header. That said, in case the hosting app has a more restrictive policy that would omit this header, this validation would fail.

Use the `referrerPolicy` parameter in the `embedDashboard` method to specify [a particular policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy) that works for your implementation.

### Customizing Permalink URLs

When users click share buttons inside an embedded dashboard, Zobi generates permalinks using Zobi's domain. If you want to use your own domain and URL format for these permalinks, you can provide a `resolvePermalinkUrl` callback:

```js
embedDashboard({
  id: "abc123",
  zobiDomain: "https://zobi.example.com",
  mountPoint: document.getElementById("my-zobi-container"),
  fetchGuestToken: () => fetchGuestTokenFromBackend(),

  // Customize permalink URLs
  resolvePermalinkUrl: ({ key }) => {
    // key: the permalink key (e.g., "xyz789")
    return `https://my-app.com/analytics/share/${key}`;
  }
});
```

To restore the dashboard state from a permalink in your app:

```js
// In your route handler for /analytics/share/:key
const permalinkKey = routeParams.key;

embedDashboard({
  id: "abc123",
  zobiDomain: "https://zobi.example.com",
  mountPoint: document.getElementById("my-zobi-container"),
  fetchGuestToken: () => fetchGuestTokenFromBackend(),
  resolvePermalinkUrl: ({ key }) => `https://my-app.com/analytics/share/${key}`,
  dashboardUiConfig: {
    urlParams: {
      permalink_key: permalinkKey,  // Restores filters, tabs, chart states, and scrolls to anchor
    }
  }
});
```
