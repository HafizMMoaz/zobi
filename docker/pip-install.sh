#!/usr/bin/env bash

set -euo pipefail

# Default flag
REQUIRES_BUILD_ESSENTIAL=false
USE_CACHE=true

# Filter arguments
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --requires-build-essential)
      REQUIRES_BUILD_ESSENTIAL=true
      ;;
    --no-cache)
      USE_CACHE=false
      ;;
    *)
      ARGS+=("$arg")
      ;;
  esac
done

# Install build-essential if required
if ${REQUIRES_BUILD_ESSENTIAL}; then
  echo "Installing build-essential for package builds..."
  apt-get update -qq \
    && apt-get install -yqq --no-install-recommends build-essential
fi

# Choose whether to use pip cache
if ${USE_CACHE}; then
  echo "Using pip cache..."
  uv pip install "${ARGS[@]}"
else
  echo "Disabling pip cache..."
  uv pip install --no-cache-dir "${ARGS[@]}"
fi

# Remove build-essential if it was installed
if ${REQUIRES_BUILD_ESSENTIAL}; then
  echo "Removing build-essential to keep the image lean..."
  apt-get autoremove -yqq --purge build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*
fi

echo "Python packages installed successfully."
