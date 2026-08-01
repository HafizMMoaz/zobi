#!/usr/bin/env bash


REQUIRED_VERSION=2
LOCKFILE_VERSION=$(sed -n 's/[ \t]*"lockfileVersion"\: \([0-9]*\),/\1/p' "$1")

if [[ $LOCKFILE_VERSION != "$REQUIRED_VERSION" ]]; then
    echo >&2 "Incorrect npm lock file version: $LOCKFILE_VERSION (Version $REQUIRED_VERSION required)"
    exit 1
else
    echo "Correct npm lock file version: $LOCKFILE_VERSION"
    exit 0
fi
