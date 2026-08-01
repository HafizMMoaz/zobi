#!/usr/bin/env bash


set -e

# Temporary fix, probably related with https://bugs.launchpad.net/ubuntu/+source/opencv/+bug/1890170
# MySQL was failing with:
# from . import _mysql
# ImportError: /lib/x86_64-linux-gnu/libstdc++.so.6: cannot allocate memory in static TLS block
export LD_PRELOAD=/lib/x86_64-linux-gnu/libstdc++.so.6
export ZOBI_CONFIG=${ZOBI_CONFIG:-tests.integration_tests.zobi_test_config}
export ZOBI_TESTENV=true
echo "Zobi config module: $ZOBI_CONFIG"

zobi db upgrade
zobi init
zobi load-test-users

echo "Running tests"

pytest --durations-min=2 --cov-report= --cov=zobi ./tests/integration_tests "$@"
