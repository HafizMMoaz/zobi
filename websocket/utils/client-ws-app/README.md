# Test client application

This Express web application is provided for testing the WebSocket server. It is not required for running the server application, and is provided here for testing and development purposes only.

## Running

First, start the WebSocket server:

```bash
cd ..
npm run dev-server
```

Then run the client application:

```bash
cd client-ws-app
npm install
npm start
```

Open http://127.0.0.1:3000 in your web browser.

You can customize the number of WebSocket connections by passing the count in the `sockets` query param, e.g. `http://127.0.0.1:3000?sockets=180`, though beware that browsers limit the number of open WebSocket connections to around 200.

Run in conjunction with the `loadtest.js` script to populate the Redis streams with event data.

**Note:** this test application is configured to use the server's local `config.json` values, so care should be taken to not overwrite any sensitive data.
