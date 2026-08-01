#!/usr/bin/env bash

set -e

#
# Always install local overrides first
#
/app/docker/docker-bootstrap.sh

if [ "$ZOBI_LOAD_EXAMPLES" = "yes" ]; then
    STEP_CNT=4
else
    STEP_CNT=3
fi

echo_step() {
cat <<EOF
######################################################################
Init Step ${1}/${STEP_CNT} [${2}] -- ${3}
######################################################################
EOF
}
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin}"
# If Cypress run – overwrite the password for admin and export env variables
if [ "$CYPRESS_CONFIG" == "true" ]; then
    ADMIN_PASSWORD="general"
    export ZOBI_TESTENV=true
    export POSTGRES_DB=zobi_cypress
    export ZOBI__SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://zobi:zobi@db:5432/zobi_cypress
fi
# Initialize the database
echo_step "1" "Starting" "Applying DB migrations"
zobi db upgrade
echo_step "1" "Complete" "Applying DB migrations"

# Create an admin user
echo_step "2" "Starting" "Setting up admin user ( admin / $ADMIN_PASSWORD )"
if [ "$CYPRESS_CONFIG" == "true" ]; then
    zobi load_test_users
else
    zobi fab create-admin \
        --username admin \
        --email admin@zobi.com \
        --password "$ADMIN_PASSWORD" \
        --firstname Zobi \
        --lastname Admin
fi
echo_step "2" "Complete" "Setting up admin user"
# Create default roles and permissions
echo_step "3" "Starting" "Setting up roles and perms"
zobi init
echo_step "3" "Complete" "Setting up roles and perms"

if [ "$ZOBI_LOAD_EXAMPLES" = "yes" ]; then
    # Load some data to play with
    echo_step "4" "Starting" "Loading examples"


    # If Cypress run which consumes zobi_test_config – load required data for tests
    if [ "$CYPRESS_CONFIG" == "true" ]; then
        zobi load_examples --load-test-data
    else
        zobi load_examples
    fi
    echo_step "4" "Complete" "Loading examples"
fi
