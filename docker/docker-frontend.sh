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

    ZOBI_NODE_HEAP_MB="${ZOBI_NODE_HEAP_MB:-3072}"
    echo "Start webpack dev server (V8 heap cap: ${ZOBI_NODE_HEAP_MB}MB)"
    # start the webpack dev server, serving dynamically at http://localhost:9000
    # it proxies to the backend served at http://localhost:8088
    #
    # This deliberately does not go through "npm run dev-server". That script
    # hardcodes --max_old_space_size=4096, and a flag on the command line beats
    # anything we could pass through NODE_OPTIONS, so the container could not
    # size its own heap. 4096 is more than is left in the VM once Postgres,
    # Redis, the app and the Celery workers have taken theirs, so webpack grew
    # until the VM OOM-killed it instead of garbage collecting.
    #
    # exec so node replaces this shell as PID 1 and receives Docker's signals
    # directly, which is what makes stop and restart prompt rather than a
    # ten-second SIGKILL wait.
    export NODE_ENV=development
    export BABEL_ENV=development
    exec node --max-old-space-size="${ZOBI_NODE_HEAP_MB}" \
        ./node_modules/webpack-dev-server/bin/webpack-dev-server.js \
        --mode=development

else
    echo "Skipping frontend build steps - YOU NEED TO RUN IT MANUALLY ON THE HOST!"
    echo "https://zobi.dev/docs/contributing/development/#webpack-dev-server"
fi
