#!/bin/bash


set -e

# Wait for PostgreSQL to be ready
echo "Waiting for database to be ready..."
for i in {1..30}; do
  if python3 -c "
import psycopg2
try:
    conn = psycopg2.connect(host='db-light', user='zobi', password='zobi', database='zobi_light')
    conn.close()
    print('Database is ready!')
except:
    exit(1)
" 2>/dev/null; then
    echo "Database connection established!"
    break
  fi
  echo "Waiting for database... ($i/30)"
  if [ $i -eq 30 ]; then
    echo "Database connection timeout after 30 seconds"
    exit 1
  fi
  sleep 1
done

# Handle database setup based on FORCE_RELOAD
if [ "${FORCE_RELOAD}" = "true" ]; then
  echo "Force reload requested - resetting test database"
  # Drop and recreate the test database using Python
  python3 -c "
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Connect to default database
conn = psycopg2.connect(host='db-light', user='zobi', password='zobi', database='zobi_light')
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

# Drop and recreate test database
try:
    cur.execute('DROP DATABASE IF EXISTS test')
except:
    pass

cur.execute('CREATE DATABASE test')
conn.close()

# Connect to test database to create schemas
conn = psycopg2.connect(host='db-light', user='zobi', password='zobi', database='test')
conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
cur = conn.cursor()

cur.execute('CREATE SCHEMA sqllab_test_db')
cur.execute('CREATE SCHEMA admin_database')

cur.close()
conn.close()
print('Test database reset successfully')
"
  # Use --no-reset-db since we already reset it
  FLAGS="--no-reset-db"
else
  echo "Using existing test database (set FORCE_RELOAD=true to reset)"
  FLAGS="--no-reset-db"

  # Ensure test database exists using Python
  python3 -c "
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Check if test database exists
try:
    conn = psycopg2.connect(host='db-light', user='zobi', password='zobi', database='test')
    conn.close()
    print('Test database already exists')
except:
    print('Creating test database...')
    # Connect to default database to create test database
    conn = psycopg2.connect(host='db-light', user='zobi', password='zobi', database='zobi_light')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    # Create test database
    cur.execute('CREATE DATABASE test')
    conn.close()

    # Connect to test database to create schemas
    conn = psycopg2.connect(host='db-light', user='zobi', password='zobi', database='test')
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()

    cur.execute('CREATE SCHEMA IF NOT EXISTS sqllab_test_db')
    cur.execute('CREATE SCHEMA IF NOT EXISTS admin_database')

    cur.close()
    conn.close()
    print('Test database created successfully')
"
fi

# Always run database migrations to ensure schema is up to date
echo "Running database migrations..."
cd /app
zobi db upgrade

# Initialize test environment if needed
if [ "${FORCE_RELOAD}" = "true" ] || [ ! -f "/app/zobi_home/.test_initialized" ]; then
  echo "Initializing test environment..."
  # Run initialization commands
  zobi init
  echo "Loading test users..."
  zobi load-test-users

  # Mark as initialized
  touch /app/zobi_home/.test_initialized
else
  echo "Test environment already initialized (skipping init and load-test-users)"
  echo "Tip: Use FORCE_RELOAD=true to reinitialize the test database"
fi

# Create missing scripts needed for tests
if [ ! -f "/app/scripts/tag_latest_release.sh" ]; then
  echo "Creating missing tag_latest_release.sh script for tests..."
  cp /app/docker/tag_latest_release.sh /app/scripts/tag_latest_release.sh 2>/dev/null || true
fi

# Install pip module for Shillelagh compatibility (aligns with CI environment)
echo "Installing pip module for Shillelagh compatibility..."
uv pip install pip

# If arguments provided, execute them
if [ $# -gt 0 ]; then
  exec "$@"
fi
