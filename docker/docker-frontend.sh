#!/usr/bin/env bash

set -e

# Packages needed for puppeteer:
if [ "$PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" = "false" ]; then
    apt update
    apt install -y chromium
fi

if [ "$BUILD_ZOBI_FRONTEND_IN_DOCKER" = "true" ]; then
    echo "Building Zobi frontend in dev mode inside docker container"
    cd /app/frontend

    if [ "$NPM_RUN_PRUNE" = "true" ]; then
        echo "Running \"npm run prune\""
        npm run prune
    fi

    echo "Running \"npm install\""
    npm install

    echo "Start webpack dev server"
    # start the webpack dev server, serving dynamically at http://localhost:9000
    # it proxies to the backend served at http://localhost:8088
    npm run dev-server

else
    echo "Skipping frontend build steps - YOU NEED TO RUN IT MANUALLY ON THE HOST!"
    echo "https://zobi.dev/docs/contributing/development/#webpack-dev-server"
fi
