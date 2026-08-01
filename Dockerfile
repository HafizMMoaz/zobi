

######################################################################
# Node stage to deal with static asset construction
######################################################################
ARG PY_VER=3.11.14-slim-trixie

# If BUILDPLATFORM is null, set it to 'amd64' (or leave as is otherwise).
ARG BUILDPLATFORM=${BUILDPLATFORM:-amd64}

# Include translations in the final build
ARG BUILD_TRANSLATIONS="false"

######################################################################
# zobi-node-ci used as a base for building frontend assets and CI
######################################################################
FROM --platform=${BUILDPLATFORM} node:22-trixie-slim AS zobi-node-ci
ARG BUILD_TRANSLATIONS
ENV BUILD_TRANSLATIONS=${BUILD_TRANSLATIONS}
ARG DEV_MODE="false"           # Skip frontend build in dev mode
ENV DEV_MODE=${DEV_MODE}

COPY docker/ /app/docker/
# Arguments for build configuration
ARG NPM_BUILD_CMD="build"

# Install system dependencies required for node-gyp
RUN /app/docker/apt-install.sh build-essential python3 zstd

# Define environment variables for frontend build
ENV BUILD_CMD=${NPM_BUILD_CMD} \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Run the frontend memory monitoring script
RUN /app/docker/frontend-mem-nag.sh

WORKDIR /app/frontend

# Create necessary folders to avoid errors in subsequent steps
RUN mkdir -p /app/zobi/static/assets \
             /app/zobi/translations

# Mount package files and install dependencies if not in dev mode
# NOTE: we mount packages and plugins as they are referenced in package.json as workspaces
# ideally we'd COPY only their package.json. Here npm ci will be cached as long
# as the full content of these folders don't change, yielding a decent cache reuse rate.
# Note that it's not possible to selectively COPY or mount using blobs.
RUN --mount=type=bind,source=./frontend/package.json,target=./package.json \
    --mount=type=bind,source=./frontend/package-lock.json,target=./package-lock.json \
    --mount=type=cache,target=/root/.cache \
    --mount=type=cache,target=/root/.npm \
    if [ "${DEV_MODE}" = "false" ]; then \
        npm ci; \
    else \
        echo "Skipping 'npm ci' in dev mode"; \
    fi

# Runs the webpack build process
COPY frontend /app/frontend

######################################################################
# zobi-node is used for compiling frontend assets
######################################################################
FROM zobi-node-ci AS zobi-node

# Build the frontend if not in dev mode
RUN --mount=type=cache,target=/root/.npm \
    if [ "${DEV_MODE}" = "false" ]; then \
        echo "Running 'npm run ${BUILD_CMD}'"; \
        npm run ${BUILD_CMD}; \
    else \
        echo "Skipping 'npm run ${BUILD_CMD}' in dev mode"; \
    fi;

# Copy translation files
COPY zobi/translations /app/zobi/translations

# Build translations if enabled, then cleanup localization files
RUN if [ "${BUILD_TRANSLATIONS}" = "true" ]; then \
        npm run build-translation; \
    fi; \
    rm -rf /app/zobi/translations/*/*/*.[po,mo];


######################################################################
# Base python layer
######################################################################
FROM python:${PY_VER} AS python-base

ARG ZOBI_HOME="/app/zobi_home"
ENV ZOBI_HOME=${ZOBI_HOME}

RUN mkdir -p ${ZOBI_HOME}
RUN useradd --user-group -d ${ZOBI_HOME} -m --no-log-init --shell /bin/bash zobi \
    && chmod -R 1777 ${ZOBI_HOME} \
    && chown -R zobi:zobi ${ZOBI_HOME}

# Some bash scripts needed throughout the layers
COPY --chmod=755 docker/*.sh /app/docker/

RUN pip install --no-cache-dir --upgrade uv

# Using uv as it's faster/simpler than pip
RUN uv venv /app/.venv
ENV PATH="/app/.venv/bin:${PATH}"

######################################################################
# Python translation compiler layer
######################################################################
FROM python-base AS python-translation-compiler

ARG BUILD_TRANSLATIONS
ENV BUILD_TRANSLATIONS=${BUILD_TRANSLATIONS}

# Install Python dependencies using docker/pip-install.sh
COPY requirements/translations.txt requirements/
RUN --mount=type=cache,target=/root/.cache/uv \
    . /app/.venv/bin/activate && /app/docker/pip-install.sh --requires-build-essential -r requirements/translations.txt

COPY zobi/translations/ /app/translations_mo/
RUN if [ "${BUILD_TRANSLATIONS}" = "true" ]; then \
        pybabel compile -d /app/translations_mo | true; \
    fi; \
    rm -f /app/translations_mo/*/*/*.[po,json]

######################################################################
# Python APP common layer
######################################################################
FROM python-base AS python-common

ENV ZOBI_HOME="/app/zobi_home" \
    HOME="/app/zobi_home" \
    ZOBI_ENV="production" \
    FLASK_APP="zobi.app:create_app()" \
    PYTHONPATH="/app/pythonpath" \
    ZOBI_PORT="8088"

# Copy the entrypoints, make them executable in userspace
COPY --chmod=755 docker/entrypoints /app/docker/entrypoints

WORKDIR /app
# Set up necessary directories
RUN mkdir -p \
      ${PYTHONPATH} \
      zobi/static \
      requirements \
      frontend \
      zobi.egg-info \
      requirements \
    && touch zobi/static/version_info.json

# Install Playwright and optionally setup headless browsers
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/share/playwright-browsers

ARG INCLUDE_CHROMIUM="false"
ARG INCLUDE_FIREFOX="false"
RUN --mount=type=cache,target=${ZOBI_HOME}/.cache/uv \
    if [ "${INCLUDE_CHROMIUM}" = "true" ] || [ "${INCLUDE_FIREFOX}" = "true" ]; then \
        uv pip install playwright && \
        playwright install-deps && \
        if [ "${INCLUDE_CHROMIUM}" = "true" ]; then playwright install chromium; fi && \
        if [ "${INCLUDE_FIREFOX}" = "true" ]; then playwright install firefox; fi; \
    else \
        echo "Skipping browser installation"; \
    fi

# Copy required files for Python build
COPY pyproject.toml setup.py MANIFEST.in README.md ./
COPY frontend/package.json frontend/
COPY scripts/check-env.py scripts/

# keeping for backward compatibility
COPY --chmod=755 ./docker/entrypoints/run-server.sh /usr/bin/

# Some debian libs
RUN /app/docker/apt-install.sh \
      curl \
      libsasl2-dev \
      libsasl2-modules-gssapi-mit \
      libpq-dev \
      libecpg-dev \
      libldap2-dev

# Create data directory for DuckDB examples database
# The database file will be created at runtime when examples are loaded from Parquet files
RUN mkdir -p /app/data && chown -R zobi:zobi /app/data

# Copy compiled things from previous stages
COPY --from=zobi-node /app/zobi/static/assets zobi/static/assets

# TODO, when the next version comes out, use --exclude zobi/translations
COPY zobi zobi
# TODO in the meantime, remove the .po files
RUN rm zobi/translations/*/*/*.po

# Merging translations from backend and frontend stages
COPY --from=zobi-node /app/zobi/translations zobi/translations
COPY --from=python-translation-compiler /app/translations_mo zobi/translations

HEALTHCHECK CMD /app/docker/docker-healthcheck.sh
CMD ["/app/docker/entrypoints/run-server.sh"]
EXPOSE ${ZOBI_PORT}

######################################################################
# Final lean image...
######################################################################
FROM python-common AS lean

# Install Python dependencies using docker/pip-install.sh
COPY requirements/base.txt requirements/

# Copy core package needed for editable install in base.txt
COPY core core

RUN --mount=type=cache,target=${ZOBI_HOME}/.cache/uv \
    /app/docker/pip-install.sh --requires-build-essential -r requirements/base.txt
# Install the zobi package
RUN --mount=type=cache,target=${ZOBI_HOME}/.cache/uv \
    uv pip install -e .
RUN python -m compileall /app/zobi

USER zobi

######################################################################
# Dev image...
######################################################################
FROM python-common AS dev

# Debian libs needed for dev
RUN /app/docker/apt-install.sh \
    git \
    pkg-config \
    default-libmysqlclient-dev

# Copy development requirements and install them
COPY requirements/*.txt requirements/

# Copy local packages needed for editable installs in development.txt
COPY core core
COPY extensions-cli extensions-cli

# Install Python dependencies using docker/pip-install.sh
RUN --mount=type=cache,target=${ZOBI_HOME}/.cache/uv \
    /app/docker/pip-install.sh --requires-build-essential -r requirements/development.txt
# Install the zobi package
RUN --mount=type=cache,target=${ZOBI_HOME}/.cache/uv \
    uv pip install -e .

RUN uv pip install .[postgres]
RUN python -m compileall /app/zobi

USER zobi

######################################################################
# CI image...
######################################################################
FROM lean AS ci
USER root
RUN uv pip install .[postgres,duckdb]
USER zobi
CMD ["/app/docker/entrypoints/docker-ci.sh"]

######################################################################
# Showtime image - lean + DuckDB for examples database
######################################################################
FROM lean AS showtime
USER root
RUN uv pip install .[duckdb]
USER zobi
CMD ["/app/docker/entrypoints/docker-ci.sh"]
