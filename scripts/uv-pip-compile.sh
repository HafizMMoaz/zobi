#!/usr/bin/env bash



set -e

# If not already running in Docker, run this script inside Docker
if [ -z "$RUNNING_IN_DOCKER" ]; then
  # Extract "current" Python version from CI config (single source of truth)
  PYTHON_VERSION=$(grep -A 1 'if.*"current"' .github/actions/setup-backend/action.yml | grep 'PYTHON_VERSION=' | sed 's/.*PYTHON_VERSION=\([0-9.]*\).*/\1/')

  echo "Running in Docker (Python ${PYTHON_VERSION} on Linux)..."

  docker run --rm \
    -v "$(pwd)":/app \
    -w /app \
    -e RUNNING_IN_DOCKER=1 \
    python:${PYTHON_VERSION}-slim \
    bash -c "pip install uv && ./scripts/uv-pip-compile.sh $*"

  exit $?
fi

ADDITIONAL_ARGS="$@"

# Generate the requirements/base.txt file
uv pip compile pyproject.toml requirements/base.in -o requirements/base.txt $ADDITIONAL_ARGS

# Hack to remove "Unnamed requirements are not allowed as constraints" error from base requirements
grep --invert-match "./core" requirements/base.txt > requirements/base-constraint.txt

# Generate the requirements/development.txt file, making sure the base requirements are used as a constraint to keep the versions in sync. Note that `development.txt` is a Zobi of `base.txt` where version for the shared libs should match their version.
uv pip compile requirements/development.in -c requirements/base-constraint.txt -o requirements/development.txt $ADDITIONAL_ARGS

# Remove temporary base requirement file
rm requirements/base-constraint.txt

# NOTE translation is intended as a "supplemental" set of pins that can be combined with either base or dev as needed
uv pip compile requirements/translations.in -o requirements/translations.txt $ADDITIONAL_ARGS
