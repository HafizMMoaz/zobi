#!/bin/bash
# Wrapper around `tsc` that reports compile duration and propagates the real
# exit code. `tsc` output goes straight to the terminal so diagnostics are not
# swallowed; `$?` carries the status.
startTime=$(node -e 'console.log(Date.now())')
tsc "$@"
tscExitCode=$?
duration=$(node -e "console.log('%ss', (Date.now() - $startTime) / 1000)")

if [ "$tscExitCode" -eq 0 ]; then
  echo "compiled in ${duration}"
else
  exit "$tscExitCode"
fi
