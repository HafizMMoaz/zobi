#!/bin/bash

set -e

cd "$(dirname "$0")"

#run all the python steps in a background process
time zobi db upgrade
time zobi load_test_users
time zobi load_examples --load-test-data
time zobi init
echo "[completed python build steps]"
PORT='8081'
flask run -p $PORT --with-threads --reload --debugger &

#block on the longer running javascript process
time npm ci
time npm run build-instrumented
echo "[completed js build steps]"

#setup cypress
cd cypress-base
time npm ci
export CYPRESS_BASE_URL="http://localhost:${PORT}"
if [ -n "$1" ]; then
    CYPRESS_PATH='cypress/e2e/'${1}'/*'
    time npm run cypress-run-chrome -- --spec "$CYPRESS_PATH" --record false --config video=false || true
else
    time npm run cypress-run-chrome -- --record false --config video=false || true
fi
kill %1
