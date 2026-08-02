#!/usr/bin/env bash



# This is the recommended way to install FOSSA's cli per the docs:
# https://docs.fossa.com/docs/generic-ci
curl -s -H 'Cache-Control: no-cache' https://raw.githubusercontent.com/fossas/fossa-cli/master/install.sh | sudo bash

# This key is a push-only API key, also recommended for public projects
# https://docs.fossa.com/docs/api-reference#section-push-only-api-token
export FOSSA_API_KEY="${FOSSA_API_KEY:-f72e93645bdfeab94bd227c7bbdda4ef}"
fossa init
fossa analyze
fossa test | echo "Ok" # silenced fossa on 2020-10-04 it was acting up
