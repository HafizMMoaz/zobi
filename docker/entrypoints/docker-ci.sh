#!/usr/bin/env bash

/app/docker/docker-init.sh

# TODO: copy config overrides from ENV vars

# TODO: run celery in detached state
export SERVER_THREADS_AMOUNT=8
# start up the web server

/app/docker/entrypoints/run-server.sh
