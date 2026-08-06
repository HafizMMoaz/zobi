# Running Zobi in production with Docker Compose

`docker-compose.yml` in the repository root is a **development** stack and says
so on its second line. It runs the Flask development server, bind-mounts your
working tree into the containers, and starts a webpack dev server. None of that
belongs in production.

`docker-compose.prod.yml` is the counterpart described here.

## What is different

| | Development stack | Production stack |
|---|---|---|
| Image target | `dev` (dev dependencies, runs as root) | `lean` (compiled, runs as `zobi`) |
| `DEV_MODE` build arg | `true` | `false` |
| Web server | `flask run --reload --debugger` | gunicorn via `docker/entrypoints/run-server.sh` |
| Frontend | `zobi-node` webpack dev server on port 9000 | pre-built assets baked into the image |
| Source code | bind-mounted from the host | none, the image is the unit of deployment |
| Postgres and Redis | published to the host | reachable only on the compose network |
| App port | published on all interfaces | bound to `127.0.0.1` |
| Config | `docker/pythonpath_dev/zobi_config.py` | `docker/pythonpath_prod/zobi_config.py` |

### Why `DEV_MODE: "false"` is load-bearing

`Dockerfile` builds the frontend bundle only when `DEV_MODE` is `"false"`:

```dockerfile
RUN if [ "${DEV_MODE}" = "false" ]; then \
        npm run ${BUILD_CMD}; \
    else \
        echo "Skipping 'npm run ${BUILD_CMD}' in dev mode"; \
    fi;
```

The result is copied into the shared `python-common` stage that `lean`
inherits from. Build the `lean` target with `DEV_MODE: "true"` and you get an
image that starts cleanly, passes its healthcheck, and serves a blank page.
The production compose file hardcodes `"false"` for exactly this reason.

## First run

```bash
cp docker/.env-prod.example docker/.env-prod
```

Fill in every value marked REQUIRED, then:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

`zobi-init` runs migrations, creates the `admin` user from `ADMIN_PASSWORD`,
and seeds roles. The other services wait for it to complete before starting.

Put a TLS-terminating reverse proxy in front of `127.0.0.1:8088`. The app is
deliberately not published on a public interface.

## ZOBI_SECRET_KEY

Read this before your first start, not after.

Zobi encrypts stored credentials with `SECRET_KEY`: analytics database
passwords, `encrypted_extra`, OAuth tokens, and LLM provider API keys entered
under Manage > AI Models. The encryption is applied by
`encrypted_field_factory` in `zobi/utils/encrypt.py`.

If the key changes, **everything already encrypted becomes unreadable**. There
is no recovery path other than re-entering each secret by hand, or running
this *while you still have the old key*:

```bash
docker compose -f docker-compose.prod.yml exec zobi-app \
    zobi re-encrypt-secrets --previous-secret-key '<old key>'
```

Generate a key with `openssl rand -base64 42` and back it up somewhere you can
restore from independently of the database. The production config refuses to
boot on an empty or placeholder key rather than let you discover this after
data has been encrypted under a throwaway value.

## Configuration

`docker/pythonpath_prod/zobi_config.py` is mounted read-only at
`/app/pythonpath/zobi_config.py` and loaded because `ZOBI_CONFIG_PATH` points
at it. It is deliberately independent of the development config: it assumes no
bind-mounted source tree and no dev server.

Everything environment-specific is read from `docker/.env-prod`, so the same
config file serves every environment. Edit the file itself only for behaviour
no environment variable covers.

### Enabling the AI gateway

Manage > AI Models is gated behind the `ZOBI_AI` feature flag:

```bash
ZOBI_FEATURE_ZOBI_AI=true
```

Provider API keys entered there are encrypted with `ZOBI_SECRET_KEY`, so the
warning above applies directly to them.

## Alerts and reports

These need three things, and fail quietly if any is missing:

1. `zobi-worker` and `zobi-worker-beat` running. Beat schedules, the worker
   executes. Neither alone is enough.
2. `INCLUDE_CHROMIUM=true` at build time, for screenshot rendering.
3. Working SMTP settings, and `ALERT_REPORTS_DRY_RUN=false`. While dry run is
   on, notifications are logged instead of sent.

## Operations

```bash
# Status and logs
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f zobi-app

# Upgrade: rebuild, then migrate before starting the new app
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm zobi-init
docker compose -f docker-compose.prod.yml up -d

# Back up the metadata database
docker compose -f docker-compose.prod.yml exec db \
    pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > zobi-backup.sql
```

Back up `ZOBI_SECRET_KEY` alongside the database dump. A dump restored without
its key has unreadable stored credentials.

## What this stack does not do

Stated plainly so you can decide what to add:

- **No TLS.** Terminate it in a reverse proxy in front of the app.
- **No horizontal scaling.** Single app container, single worker. Scaling the
  web tier means a load balancer and shared session storage.
- **No log shipping, metrics or alerting.** Container logs go to Docker's
  default driver.
- **No automated backups.** The `pg_dump` above is manual.
- **No secret manager.** Secrets sit in `docker/.env-prod` on disk. That file
  is git-ignored, but consider Docker secrets or an external manager.
- **No database high availability.** A single Postgres container on a named
  volume.

For anything beyond a single-host deployment, treat this file as a reference
for how the pieces fit together rather than as a finished platform.
