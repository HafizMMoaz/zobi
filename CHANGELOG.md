# Changelog

All notable changes to Zobi are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **A note on history:** Zobi was developed over roughly three months, from
> mid-June 2026 through August 2026, before the project was placed under version
> control. The original commit history was lost and could not be recovered. The
> phases below document that development narrative; the git history itself begins
> with the `0.1.0` release. Commit timestamps therefore reflect when the code was
> committed, not when it was written.

## [0.2.0] - 2026-08-02

### Added

- Continuous integration on GitHub Actions. `python-lint.yml` runs ruff, mypy
  and pylint; `python-tests.yml` runs the unit tests on Python 3.10, 3.11 and
  3.12; `frontend-lint.yml` runs oxlint, prettier and `tsc`; and
  `frontend-tests.yml` runs jest across four shards alongside the package and
  webpack builds. The lint workflows mirror the hooks in
  `.pre-commit-config.yaml`, so local and CI results agree.
- Publish workflows for the Python distributions: `zobi`, `zobi-core` and
  `extensions-cli`. Each verifies that the tag and the package manifest declare
  the same version before uploading, defaults to a dry run when triggered
  manually, and can target TestPyPI for a rehearsal. The `zobi` workflow builds
  the frontend first and asserts the compiled assets are present in the wheel,
  since `zobi/static/assets` is generated rather than committed.
- A publish workflow for `@zobi.dev/embedded-sdk`, which had none. It lives
  outside the frontend npm workspace, so it is installed and built on its own.
- `release.yml`, which creates the GitHub release for a version tag using the
  matching section of this changelog as the release body.

### Changed

- Frontend packages and plugins are published under the `@zobi.dev` scope. Any
  code importing the previous package names needs updating.

## [0.1.0] - 2026-08-01


First tagged release. Zobi is a data visualization platform with a Flask/Python
backend and a React/TypeScript frontend.

### Added

**Core platform**

- Flask application with SQLAlchemy models, REST APIs under `zobi/views/api/`,
  and OpenAPI documentation auto-generated at `/swagger/v1`
- Database connectors layer (`zobi/connectors/`) with support for PostgreSQL,
  MySQL, SQLite, Presto, Trino, BigQuery, Druid, DuckDB and others
- Role-based access control via Flask-AppBuilder, plus row-level security
- Feature flag system for controlled rollout, documented inline in
  `zobi/config.py` with lifecycle annotations (`development`, `testing`,
  `stable`, `deprecated`)
- Alembic migrations under `zobi/migrations/versions/` with shared helpers for
  cross-database compatibility

**Frontend**

- React + TypeScript single-page application under `frontend/src/`
- Chart builder (`explore/`), dashboard interface (`dashboard/`), and SQL editor
  (`SqlLab/`)
- `@zobi.dev/core` component library under `frontend/packages/core/`,
  built on Ant Design with theming driven by antd tokens
- Chart plugin packages under `frontend/plugins/`
- Theme system supporting light and dark modes, with optional UI-based theme
  administration for admins

**Extension system**

- Plugin architecture letting organizations add custom features without forking
  or modifying the core codebase, inspired by the VS Code extension model
- Extensions are self-contained `.zobz` packages loaded dynamically at runtime
  via Webpack Module Federation, and may include both frontend
  (React/TypeScript) and backend (Python) components
- Contribution points for custom UI components, commands and menus, REST API
  endpoints under the `/extensions/` namespace, and MCP tools and prompts
- `zobi-core` Python package (`core/`) that extension backends build against
- `zobi-extensions` CLI (`extensions-cli/`) with `init`, `validate`, `build`,
  `bundle`, `dev` and `update` commands
- Runtime discovery via `EXTENSIONS_PATH` (directory of `.zobz` bundles) and
  `LOCAL_EXTENSIONS` (unpacked directories, file-watched in debug mode), gated
  behind the `ENABLE_EXTENSIONS` feature flag

**Embedding**

- `@zobi.dev/embedded-sdk` (`embedded-sdk/`) for embedding dashboards into external
  applications via a sandboxed iframe
- Guest token authentication, so host applications can grant scoped access
  without requiring users to log into Zobi directly; supports row-level security
  rules per token

**Developer tooling**

- Docker Compose development environment with a wrapper script
  (`scripts/docker-compose-up.sh`) that auto-assigns free ports and derives a
  project name from the directory, allowing multiple instances side by side
- Make targets for common workflows: `up`, `up-detached`, `rebuild`,
  `rebuild-nocache`, `down`, `logs`, `ps`, `ports`, `open`, `nuke`
- Pre-commit hooks covering black, prettier, eslint, ruff, pylint and mypy
- Test suites: pytest for the backend, Jest + React Testing Library for
  components, Playwright for end-to-end coverage

### Development phases

**Phase 1 — Foundation (mid-June 2026).** Flask application skeleton,
SQLAlchemy metadata models, database connector layer, and Flask-AppBuilder
authentication and RBAC wiring.

**Phase 2 — Visualization and UI (late June 2026).** React/TypeScript frontend,
chart builder, dashboard interface, and the `@zobi.dev/core` component library.
An early version of the platform was presented as a university project on
**26 June 2026**.

**Phase 3 — SQL Lab and data workflows (July 2026).** SQL editor with query
history and saved queries, dataset management, CSV/Excel/columnar upload, async
query execution through Celery, and caching layers.

**Phase 4 — Extension system (July 2026).** Lean-core refactor so built-in
features and external extensions share the same APIs. Added the `zobi-core`
package, the extensions CLI, bundle packaging, and runtime loading via Module
Federation.

**Phase 5 — Embedding and hardening (late July 2026).** Embedded SDK with guest
token authentication, theme system, security hardening (CSP via Talisman, rate
limiting, SQL function and system-table denylists), and the migration from
Cypress to Playwright for end-to-end tests.

**Phase 6 — Release preparation (August 2026).** Repository placed under version
control, licensing completed across all distributable packages, and this first
tagged release cut.

### Fixed

- `APP_ICON` pointed at `zobi-logo-horiz.png`, which did not exist in
  `zobi/static/assets/images/`, causing a broken image in the navbar. It now
  points at the `logo-horiz.svg` asset that ships with the repository. The
  watermark check in `zobi/views/base.py` was updated to match.
- `core/LICENSE.txt` was missing and `extensions-cli/LICENSE.txt` was empty,
  despite both being declared as `license-files` in their `pyproject.toml`.
  Both now carry the project's MIT license text, so the packages are correctly
  licensed when published.

### Changed

- The extension bundle format was renamed from `.supx` to `.zobz`, along with
  the `supx://` traceback URL scheme, which is now `zobz://`. Bundles built as
  `.supx` are not discovered at runtime and need to be rebundled.

[0.2.0]: https://github.com/HafizMMoaz/zobi/releases/tag/0.2.0
[0.1.0]: https://github.com/HafizMMoaz/zobi/releases/tag/0.1.0
