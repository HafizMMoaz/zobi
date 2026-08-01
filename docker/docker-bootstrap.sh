#!/usr/bin/env bash


set -eo pipefail

# Make python interactive
if [ "$DEV_MODE" == "true" ]; then
    if [ "$(whoami)" = "root" ] && command -v uv > /dev/null 2>&1; then
      # Always ensure core is available
      echo "Installing core in editable mode"
      uv pip install --no-deps -e /app/core

      # Only reinstall the main app for non-worker processes
      if [ "$1" != "worker" ] && [ "$1" != "beat" ]; then
        echo "Reinstalling the app in editable mode"
        uv pip install -e .
      fi
    fi
fi
REQUIREMENTS_LOCAL="/app/docker/requirements-local.txt"
PORT=${PORT:-8088}
# If Cypress run – overwrite the password for admin and export env variables
if [ "$CYPRESS_CONFIG" == "true" ]; then
    export ZOBI_TESTENV=true
    export POSTGRES_DB=zobi_cypress
    export ZOBI__SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://zobi:zobi@db:5432/zobi_cypress
    PORT=8081
fi
# Skip postgres requirements installation for workers to avoid conflicts
if [[ "$DATABASE_DIALECT" == postgres* ]] && [ "$(whoami)" = "root" ] && [ "$1" != "worker" ] && [ "$1" != "beat" ]; then
    # older images may not have the postgres dev requirements installed
    echo "Installing postgres requirements"
    if command -v uv > /dev/null 2>&1; then
        # Use uv in newer images
        uv pip install -e .[postgres]
    else
        # Use pip in older images
        pip install -e .[postgres]
    fi
fi
#
# Make sure we have dev requirements installed
#
if [ -f "${REQUIREMENTS_LOCAL}" ]; then
  echo "Installing local overrides at ${REQUIREMENTS_LOCAL}"
  if command -v uv > /dev/null 2>&1; then
    uv pip install --no-cache-dir -r "${REQUIREMENTS_LOCAL}"
  else
    pip install --no-cache-dir -r "${REQUIREMENTS_LOCAL}"
  fi
else
  echo "Skipping local overrides"
fi

case "${1}" in
  worker)
    echo "Starting Celery worker..."
    # setting up only 2 workers by default to contain memory usage in dev environments
    celery --app=zobi.tasks.celery_app:app worker -O fair -l INFO --concurrency=${CELERYD_CONCURRENCY:-2}
    ;;
  beat)
    echo "Starting Celery beat..."
    rm -f /tmp/celerybeat.pid
    celery --app=zobi.tasks.celery_app:app beat --pidfile /tmp/celerybeat.pid -l INFO -s "${ZOBI_HOME}"/celerybeat-schedule
    ;;
  app)
    echo "Starting web app (using development server)..."
    flask run -p $PORT --reload --debugger --host=0.0.0.0 --exclude-patterns "*/node_modules/*:*/.venv/*:*/build/*:*/__pycache__/*:*/frontend/*"
    ;;
  app-gunicorn)
    echo "Starting web app..."
    /usr/bin/run-server.sh
    ;;
  mcp)
    echo "Starting MCP service..."
    zobi mcp run --host 0.0.0.0 --port ${MCP_PORT:-5008} --debug
    ;;
  *)
    echo "Unknown Operation!!!"
    ;;
esac
