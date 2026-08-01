# Test & development utilities

The files provided here are for testing and development only, and are not required to run the WebSocket server application.

## Test client application

The Express web application in `client-ws-app` is provided for testing the WebSocket server. See `client-ws-app/README.md` for details.

## Load testing script

The `loadtest.js` script is provided to populate the Redis streams with event data.

### Running

```bash
node loadtest.js
```

The script will populate data continually until the script is exited using CTRL-C.

**Note:** `loadtest.js` and test client application are configured to use the server's local `config.json` values, so care should be taken to not overwrite any sensitive data.
