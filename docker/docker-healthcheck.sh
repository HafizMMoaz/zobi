#!/usr/bin/env bash


curl -f "http://localhost:${ZOBI_PORT}/${ZOBI_APP_ROOT/\//}/health" || exit 1
