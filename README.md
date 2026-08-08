<img
  width="400"
  src="https://raw.githubusercontent.com/HafizMMoaz/zobi/main/zobi.svg"
  alt="Zobi logo"
/>

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![Latest Release](https://img.shields.io/github/v/release/HafizMMoaz/zobi?sort=semver)](https://github.com/HafizMMoaz/zobi/releases/latest)
[![GitHub Stars](https://img.shields.io/github/stars/HafizMMoaz/zobi?style=social)](https://github.com/HafizMMoaz/zobi/stargazers)

A modern, enterprise-ready business intelligence web application.

[Website](https://zobi.dev) · [Documentation](https://zobi.dev/docs) · [Issue Tracker](https://github.com/HafizMMoaz/zobi/issues)

## Features

- **Rich Visualization**: Create interactive charts, dashboards, and data stories from 40+ chart types
- **SQL IDE**: Write and execute SQL queries against any connected database with a powerful editor
- **AI Assistant**: A chat assistant that reads and builds on your data by calling the same tools every other integration uses, with adjustable autonomy - see [AI Assistant](#ai-assistant) below
- **Semantic Layer**: Define metrics and dimensions for self-service analytics
- **Role-Based Access Control**: Fine-grained permissions for teams, down to individual dashboards
- **Alerts & Reports**: Schedule charts and dashboards for delivery by email
- **Embedded Analytics**: Embed charts and dashboards into your applications
- **Extensible Plugin System**: Build custom visualizations and integrations

## How It Works

A request from the browser lands on nginx, which routes it to the Flask app for
everything page- and API-related, or to the websocket server for live updates.
The app reads and writes its own metadata (users, charts, dashboards, saved
queries) in Postgres, and separately connects out to whatever databases you've
added as data sources. Redis is both the cache and the Celery broker; the
Celery worker and beat scheduler run alerts and scheduled reports on top of it.

```text
 ┌──────────┐      HTTPS      ┌───────────┐
 │ Browser  ├────────────────▶│   nginx   │
 └──────────┘                 └─────┬─────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
             ┌───────────────┐              ┌───────────────┐
             │  zobi (app)   │              │   websocket   │
             │ Flask + SQLA  │              │    server     │
             └───┬───────┬───┘              └───────────────┘
                 │       │
     ┌───────────┘       └───────────┐
     ▼                               ▼
┌───────────────┐             ┌───────────────┐
│ db (Postgres) │             │     redis     │
│ metadata store│             │ cache · broker│
└───────────────┘             └───────┬───────┘
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                ┌───────────────┐            ┌─────────────────┐
                │  zobi-worker  │            │ zobi-worker-beat│
                │   (Celery)    │            │  (Celery beat)  │
                │ alerts/reports│            │    schedules    │
                └───────────────┘            └─────────────────┘
```

## AI Assistant

Gated behind the `ZOBI_FEATURE_ZOBI_AI` flag (off by default). Once enabled,
**Manage > AI Models** connects an LLM through a LiteLLM-backed gateway
(`zobi/llm/`) - 16 provider presets (OpenAI, Anthropic, Azure, Bedrock, Vertex,
Ollama, and more), with credentials encrypted at rest and routed with load
balancing and fallbacks.

The chat assistant (`zobi/agent/`) doesn't get its own, separate set of
capabilities. It calls the same in-process MCP server (`zobi/mcp_service/`)
that every other automated integration uses, so it can only ever do what a
tool - and the signed-in user's own permissions - already allow:

1. The user's message goes to the model, along with the tools it's currently
   allowed to call.
2. When the model asks for a tool, Zobi runs it against the MCP server via
   `fastmcp.Client`, acting as the requesting user (`flask.g.user`) - so the
   call is bound by that user's own RBAC, not the assistant's.
3. Each tool declares whether it's read-only, a write, or destructive, which
   is what decides whether it runs immediately or waits for approval.
4. The reply streams back over SSE token by token, with tool calls appearing
   inline as they run - up to 8 tool round trips per turn.

**How much it can do without asking:**

| Mode | Reads | Creates | Changes / deletes |
| --- | --- | --- | --- |
| Read only | auto | not offered | not offered |
| Ask before changes (default) | auto | asks first | asks first |
| Auto | auto | auto | asks first |
| Full access | auto | auto | auto |

```text
 User message
      │
      ▼
┌─────────────────┐   POST /turn (SSE)   ┌─────────────────┐
│    Chat UI      │─────────────────────▶│  zobi/agent     │
│ (assistant-ui)  │◀─────────────────────│  runtime.py     │
└─────────────────┘     token stream     └────────┬────────┘
                                                  │ chat_completion()
                                                  ▼
                                           ┌──────────────────┐
                                           │     zobi/llm     │
                                           │  LiteLLM router  │──▶ OpenAI · Anthropic · Bedrock · …
                                           └────────┬─────────┘     (16 provider presets)
                                                    │ model requests a tool
                                                    ▼
                                           ┌──────────────────┐
                                           │ zobi/agent/tools │  classify: read / write / destructive
                                           └────────┬─────────┘
                                                    │ fastmcp.Client, acting as flask.g.user
                                                    ▼
                                           ┌──────────────────┐
                                           │   MCP server     │  runs under the caller's own RBAC
                                           │  (mcp_service)   │  charts · dashboards · datasets · SQL
                                           └──────────────────┘
```

## Getting Started

### Quick Start with Docker

```bash
git clone https://github.com/HafizMMoaz/zobi.git
cd zobi
docker compose up
```

### Installation from source

Zobi isn't published to PyPI yet, so install it in editable mode from a clone
(`make install` does all of this, plus DB setup and an admin user - see
[Make Commands](#make-commands)):

```bash
# Backend
pip install -r requirements/development.txt
pip install -e .

# Frontend
cd frontend
npm ci
npm run dev
```

## Make Commands

| Command | Description |
| --- | --- |
| `make install` | Full local dev setup: installs backend deps, creates an admin user, runs DB migrations, seeds roles/permissions, loads example data, installs pre-commit hooks, and installs frontend packages |
| `make zobi` | Backend half of `install` (deps, admin user, migrations, roles/permissions, example data, frontend packages) |
| `make update` | Update an existing dev environment (`update-py` + `update-js`) |
| `make update-py` | Reinstall backend deps, reinstall Zobi in editable mode, run DB migrations, re-seed roles/permissions |
| `make update-js` | Reinstall frontend packages (`npm ci`) |
| `make venv` | Create a local Python virtualenv (requires Python 3.10 or 3.11) |
| `make activate` | Activate the local virtualenv |
| `make pre-commit` | Install pre-commit dependencies and hooks |
| `make format` | Format both Python and JS/TS (`py-format` + `js-format`) |
| `make py-format` | Run Black via pre-commit |
| `make js-format` | Run Prettier on the frontend |
| `make flask-app` | Run the Flask dev server on port 8088 with auto-reload |
| `make node-app` | Run the frontend dev server |
| `make build-cypress` | Build an instrumented frontend bundle and install Cypress deps |
| `make open-cypress` | Open the Cypress test runner (pass `port=<port>` to target a specific instance) |
| `make report-celery-worker` | Start the Celery worker (alerts/reports) |
| `make report-celery-beat` | Start the Celery beat scheduler |
| `make admin-user` | Create an admin user interactively |
| `make up` | Start the Docker Compose stack with auto-assigned ports |
| `make up-detached` | Start the stack in detached mode |
| `make rebuild` | Rebuild images (picking up Dockerfile/dependency changes), then start |
| `make rebuild-nocache` | Rebuild images from scratch, ignoring layer cache, then start |
| `make down` | Stop the stack |
| `make logs` | Tail stack logs |
| `make ps` | List running stack containers |
| `make nuke` | Tear down the stack |
| `make ports` | Show assigned ports for the stack |
| `make open` | Open the app in a browser |

## Environment Variables

Docker Compose reads these from `docker/.env` (development) or `docker/.env-prod`
(production, copy from [`docker/.env-prod.example`](docker/.env-prod.example)).

### Database (Postgres)

| Variable | Description |
| --- | --- |
| `DATABASE_DIALECT` | SQLAlchemy dialect, e.g. `postgresql+psycopg2` |
| `DATABASE_HOST` / `DATABASE_PORT` | Metadata database host and port |
| `DATABASE_DB` / `DATABASE_USER` / `DATABASE_PASSWORD` | Metadata database credentials |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Consumed by the postgres image itself; keep in step with the `DATABASE_*` values |
| `DATABASE_POOL_SIZE` | SQLAlchemy connection pool size |
| `DATABASE_MAX_OVERFLOW` | Extra connections allowed beyond the pool size |
| `DATABASE_POOL_RECYCLE` | Seconds before a pooled connection is recycled |
| `EXAMPLES_HOST` / `EXAMPLES_PORT` / `EXAMPLES_DB` / `EXAMPLES_USER` / `EXAMPLES_PASSWORD` | Example dataset database (dev only) |

### Redis

| Variable | Description |
| --- | --- |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `REDIS_PASSWORD` | Leave empty to run without auth (fine on an unpublished network) |
| `REDIS_CELERY_DB` | Redis DB index for the Celery broker |
| `REDIS_RESULTS_DB` | Redis DB index for Celery task results |
| `REDIS_CACHE_DB` | Redis DB index for the app cache |

### Core / security

| Variable | Description |
| --- | --- |
| `ZOBI_SECRET_KEY` | Encrypts every stored credential (DB passwords, `encrypted_extra`, OAuth tokens, LLM provider keys). Generate with `openssl rand -base64 42`; back it up, since losing it makes encrypted data unreadable |
| `ADMIN_PASSWORD` | Bootstrap password for the `admin` user created by `zobi-init` |
| `ZOBI_ENV` | `development` or `production` |
| `FLASK_DEBUG` | Enables Flask's debugger/reloader; never `true` in production |
| `ZOBI_LOAD_EXAMPLES` | Loads sample datasets into the metadata DB; never `yes` in production |
| `ZOBI_LOG_LEVEL` | App log level, e.g. `INFO` |
| `ZOBI_PORT` | Host port the app listens on |

### Reverse proxy and cookies

| Variable | Description |
| --- | --- |
| `ZOBI_ENABLE_PROXY_FIX` | Trust `X-Forwarded-*` headers; only enable behind a proxy you control |
| `ZOBI_SESSION_COOKIE_SECURE` | Requires real HTTPS in front; disable only when testing over plain HTTP |
| `ZOBI_PUBLIC_URL` | Public URL used in report/alert emails |
| `ZOBI_INTERNAL_URL` | Internal URL the headless browser uses to render screenshots |

### Feature flags

| Variable | Description |
| --- | --- |
| `ZOBI_FEATURE_ZOBI_AI` | Enables the LLM gateway and the Manage > AI Models settings screen |
| `ZOBI_FEATURE_ALERT_REPORTS` | Enables alerts and scheduled reports |
| `ZOBI_FEATURE_DASHBOARD_RBAC` | Enables dashboard-level role-based access control |
| `ZOBI_FEATURE_EMBEDDED_ZOBI` | Enables embedded analytics |
| `ZOBI_FEATURE_ENABLE_EXTENSIONS` | Enables the extension system |
| `ZOBI_FEATURE_SEMANTIC_LAYERS` | Enables semantic layers |

### Alerts and reports (SMTP)

| Variable | Description |
| --- | --- |
| `ALERT_REPORTS_DRY_RUN` | Logs notifications instead of sending them |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server |
| `SMTP_STARTTLS` / `SMTP_SSL` | SMTP transport security |
| `SMTP_USER` / `SMTP_PASSWORD` | SMTP credentials |
| `SMTP_MAIL_FROM` | From address for outgoing alert/report emails |

### Gunicorn (production server)

| Variable | Description |
| --- | --- |
| `SERVER_WORKER_AMOUNT` | Worker count; a common starting point is `(2 x CPU cores) + 1` |
| `SERVER_WORKER_CLASS` | Gunicorn worker class, e.g. `gthread` |
| `SERVER_THREADS_AMOUNT` | Threads per worker |
| `GUNICORN_TIMEOUT` | Request timeout in seconds |
| `GUNICORN_KEEPALIVE` | Keep-alive timeout in seconds |
| `GUNICORN_LOGLEVEL` | Gunicorn log level |
| `WORKER_MAX_REQUESTS` | Requests before a worker recycles, to bound slow memory leaks |
| `WORKER_MAX_REQUESTS_JITTER` | Randomizes recycling so workers don't all restart at once |

### Image build options

| Variable | Description |
| --- | --- |
| `ZOBI_BUILD_TARGET` | Docker build target, e.g. `dev` |
| `DEV_MODE` | Enables development-mode build behavior |
| `INCLUDE_CHROMIUM` / `INCLUDE_FIREFOX` | Bundle a headless browser for report/alert screenshots |
| `BUILD_TRANSLATIONS` | Compile translation files during the image build |

### Multi-instance dev ports (`.envrc`, via direnv)

Copy [`.envrc.example`](.envrc.example) to `.envrc` and run `direnv allow` to
auto-assign free ports when running multiple instances side by side.

| Variable | Description |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | Derived from the directory name, so each checkout gets its own Compose project |
| `NGINX_PORT` / `ZOBI_PORT` / `NODE_PORT` / `WEBSOCKET_PORT` / `CYPRESS_PORT` / `DATABASE_PORT` / `REDIS_PORT` | First free port found for each service, starting from its default |

## Architecture

```text
zobi/
├── zobi/                    # Python backend (Flask, SQLAlchemy)
│   ├── views/api/              # REST API endpoints
│   ├── models/                 # Database models
│   └── connectors/             # Database connections
├── frontend/               # React TypeScript frontend
│   ├── components/             # Reusable components
│   ├── explore/                # Chart builder
│   └── dashboard/              # Dashboard interface
├── core/                   # Python core package
├── embedded-sdk/           # Embedding SDK
├── websocket/              # WebSocket server
└── extensions-cli/         # Extension CLI tools
```

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.