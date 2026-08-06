# Getting Started with Zobi using Docker

Docker is an easy way to get started with Zobi.

## Prerequisites

1. [Docker](https://www.docker.com/get-started)
2. [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

The base configuration intended for local development lives in
[`./docker/pythonpath_dev/zobi_config.py`](./pythonpath_dev/zobi_config.py). That folder is
bind-mounted into the containers at `/app/docker/pythonpath_dev`, and `docker-compose.yml`
puts it on the containers' `PYTHONPATH`. Zobi's own [`zobi/config.py`](../zobi/config.py)
ends with an `import zobi_config` fallback, so the file is picked up automatically. A fresh
clone therefore gets the compose Postgres, Celery and feature-flag settings with no setup
step.

If you would rather point Zobi at a config file explicitly, set `ZOBI_CONFIG_PATH` to its
absolute path inside the container (for example in `./docker/.env-local`):

```bash
ZOBI_CONFIG_PATH=/app/docker/pythonpath_dev/zobi_config.py
```

`ZOBI_CONFIG_PATH` takes precedence over the `PYTHONPATH` lookup when it is set. Both routes
load the same file, so it is purely a matter of preference.

### Local overrides

#### Environment Variables

To override environment variables locally, create a `./docker/.env-local` file (git-ignored). This file will be loaded after `.env` and can override any settings.

#### Python Configuration

In order to override configuration settings locally, simply make a copy of [`./docker/pythonpath_dev/zobi_config_local.example`](./pythonpath_dev/zobi_config_local.example)
into `./docker/pythonpath_dev/zobi_config_docker.py` (git-ignored) and fill in your overrides.
`zobi_config.py` imports `zobi_config_docker` at the end if it is importable, which it is
because `./docker/pythonpath_dev` is on the containers' `PYTHONPATH`.

#### WebSocket Configuration

To customize the WebSocket server configuration, create `./docker/websocket/config.json` (git-ignored) based on [`./docker/websocket/config.example.json`](./websocket/config.example.json).

Then update the `websocket`.`volumes` config to mount it.

#### Docker Compose Overrides

For advanced Docker Compose customization, create a `docker-compose-override.yml` file (git-ignored) to override or extend services without modifying the main compose file.

### Local packages

If you want to add Python packages in order to test things like databases locally, you can simply add a local requirements.txt (`./docker/requirements-local.txt`)
and rebuild your Docker stack.

Steps:

1. Create `./docker/requirements-local.txt`
2. Add your new packages
3. Rebuild docker compose
    1. `docker compose down -v`
    2. `docker compose up`

## Initializing Database

The database will initialize itself upon startup via the init container ([`zobi-init`](./docker-init.sh)). This may take a minute.

## Normal Operation

To run the container, simply run: `docker compose up`

After waiting several minutes for Zobi initialization to finish, you can open a browser and view [`http://localhost:8088`](http://localhost:8088)
to start your journey.

### Running Multiple Instances

If you need to run multiple Zobi instances simultaneously (e.g., different branches or clones), use the make targets which automatically find available ports:

```bash
make up
```

This automatically:
- Generates a unique project name from your directory
- Finds available ports (incrementing from defaults if in use)
- Displays the assigned URLs before starting

Available commands (run from repo root):

| Command | Description |
|---------|-------------|
| `make up` | Start services (foreground) |
| `make up-detached` | Start services (background) |
| `make down` | Stop all services |
| `make ps` | Show running containers |
| `make logs` | Follow container logs |
| `make nuke` | Stop, remove volumes & local images |

From a subdirectory, use: `make -C $(git rev-parse --show-toplevel) up`

**Important**: Always use these commands instead of plain `docker compose down`, which won't know the correct project name.

## Developing

While running, the container server will reload on modification of the Zobi Python and JavaScript source code.
Don't forget to reload the page to take the new frontend into account though.

## Production

It is possible to run Zobi in non-development mode by using [`docker-compose-non-dev.yml`](../docker-compose-non-dev.yml). This file excludes the volumes needed for development.

## Resource Constraints

If you are attempting to build on macOS and it exits with 137 you need to increase your Docker resources. See instructions [here](https://docs.docker.com/docker-for-mac/#advanced) (search for memory)
