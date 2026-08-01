#!/usr/bin/env bash



set -e

script_dir="$(dirname "$(realpath "$0")")"
root_dir="$(dirname "$script_dir")"
frontend_dir=frontend

if [[ ! -d "$root_dir/$frontend_dir" ]]; then
  echo "Error: $frontend_dir directory not found in $root_dir" >&2
  exit 1
fi

cd "$root_dir/$frontend_dir"
npm run lint-fix -- "${@//$frontend_dir\//}"
