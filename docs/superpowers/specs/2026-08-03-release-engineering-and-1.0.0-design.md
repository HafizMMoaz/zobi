# Release engineering and the Zobi 1.0.0 release

- **Status:** approved, ready for implementation planning
- **Date:** 2026-08-03
- **Scope:** Project A of a five-project programme (see [Programme decomposition](#programme-decomposition))

## Context

Zobi ships as a Flask/Python application with a React/TypeScript frontend, plus
27 separately distributed packages: 25 npm packages under the `@zobi.dev` scope,
and two PyPI distributions (`zobi-core`, `zobi-extensions-cli`) that extension
authors install.

An audit of the registries on 2026-08-03 established the following.

**Already published.** All 25 npm packages are live at `1.0.0`: `extension-api`,
`switchboard`, `generator-zobi`, `core`, `chart-controls`, `embedded-sdk`, and
the 19 chart plugins. On PyPI, `zobi-core 1.0.0` and `zobi-extensions-cli 1.0.0`
are published and owned by the project.

**Not published.** `@zobi.dev/mcp-server` declares `1.0.0` in
`zobi/mcp_service/package.json` but has no publish workflow and does not exist on
npm.

**Repository drift.** The repository's own manifests still declare the
pre-release versions: `frontend/package.json` says `0.2.0`, `frontend/lerna.json`
says `0.20.4`, most packages say `0.20.3`. No commit in the history corresponds
to the published `1.0.0` artifacts, so the source for what users installed cannot
be checked out.

**The `zobi` name on PyPI belongs to a third party.** It is registered to
`nasrin <nasrinbegump@gmail.com>` as version `0.0.1`, described as "A small
example package". `README.md` currently instructs users to run `pip install
zobi`, which installs that unrelated package.

**Baseline health.** The repository is public and MIT licensed. All four CI
workflows (`python-lint`, `python-tests`, `frontend-lint`, `frontend-tests`) are
green on `main`. Git tags exist for `0.1.0` and `0.2.0`.

### The root cause of the drift

The two publish families use opposite versioning models.

The npm workflows accept a `version` input and run
`npm version <version> --no-git-tag-version --allow-same-version`. CI rewrites
the manifest at build time and discards the change. The current
`scripts/release.sh` closes with "Remember to commit the repository version
bumps", a manual step that patches over an automated gap.

The PyPI workflows do the reverse. The version is static in `pyproject.toml`, and
the workflow refuses to publish when the tag and the manifest disagree.

This asymmetry is why the repository disagrees with npm but agrees with PyPI.

## Programme decomposition

The original request spans five projects. Each gets its own spec, plan, and
implementation cycle. This document covers Project A only.

| # | Project | Contents | Depends on |
|---|---------|----------|------------|
| A | Release engineering and 1.0.0 | Branch model; dynamic `release.sh`; workflow model change; app on PyPI; the 1.0.0 release | none |
| B | README and installation docs | README rewrite for contributors and operators; Docker, source, and pip paths; `docs/` tree | A |
| C | Governance and repo hardening | `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODEOWNERS`, issue and PR template cleanup | none |
| D | VPS demo deployment | Public demo instance on project-owned infrastructure | A |
| E | Website and documentation site | `zobi.dev` marketing site and documentation pages | B |

The branch model moves from C into A deliberately. The goal is "no direct push to
main", and configuring it after the release would mean the release itself bypassed
the process being established. The written governance prose stays in C.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App distribution name on PyPI | `zobi-dev` | `zobi` is taken by a third party. PyPI has no namespaces; PEP 752 and PEP 755 propose them but remain drafts. Under PEP 503 name normalisation, runs of `.`, `-` and `_` collapse to a single `-`, so a package published as `zobi-dev` is also installable as `pip install zobi.dev`, mirroring the `@zobi.dev` npm scope without requiring any PyPI feature. It also matches the existing `zobi-core` and `zobi-extensions-cli` prefix convention. |
| Versioning model | Commit-first lockstep | Git becomes the source of truth. Every published artifact is reproducible from a commit, and npm and PyPI behave identically. Verified as safe: internal dependencies are wildcard peer ranges, so no dependency-range rewriting is needed. |
| Version scope | Every package tracks the application version | This is already true as of 1.0.0. It codifies where the project landed rather than reversing it, and gives users a single number. |
| Branch flow | `feature -> dev -> main` | `dev` is the integration branch; `main` is release-only. Both protected. |
| `@zobi.dev/mcp-server` | Publish in this project | Completes the package set and resolves the contradiction between its declared version and its absence from npm. |
| Generator package name | `@zobi.dev/generator-zobi` becomes `@zobi.dev/generator-plugin` | The current name repeats "zobi". The `generator-` prefix cannot be dropped: Yeoman derives its namespace by scanning for `generator-*` and stripping the prefix, so `@zobi.dev/generator` would be undiscoverable. `@zobi.dev/generator-plugin` removes the redundancy, stays in scope, names what it scaffolds, and yields `yo @zobi.dev/plugin`. |

### Rejected alternatives

**Dynamic script only, keeping CI-side version rewriting.** Smallest change and
fastest to ship, but preserves the drift permanently. The repository would
continue to disagree with the registries after every release.

**Independent per-package versioning.** Cleanest registry history, but requires
dependency-graph cascading and version-range rewriting. Disproportionate for this
project, and contradicted by how 1.0.0 actually shipped.

**Filing a PEP 541 name-transfer request for `zobi`.** Not pursued. The process is
manual, measured in weeks to months, and not guaranteed. It remains available
later; if it ever succeeds, `zobi` can become a thin alias depending on
`zobi-dev`.

## Design

### A0. Branch model

Create `dev` from `main`. Apply rulesets to both branches:

- Require a pull request before merging, with **zero required approvals**. A sole
  maintainer cannot approve their own pull request, so a non-zero requirement
  would deadlock every merge. The pull-request requirement alone still enforces
  the branch and the status-check gate, which is the actual goal.
- Require the four CI status checks to pass.
- Block force pushes and branch deletion.

Release tags are cut from `main` only.

**Path-filter deadlock.** `frontend-lint.yml` and `frontend-tests.yml` trigger
only on `frontend/**` changes. Marking them required as-is would cause any
backend-only pull request to wait indefinitely on checks that never report. The
fix is a job that always runs and reports success when the paths do not match, so
the check is present on every pull request regardless of what changed. This must
be verified with a deliberately backend-only pull request before the ruleset is
enforced.

### A1. Version topology

The script rewrites 30 manifest files:

```
frontend/package.json                   canonical app version
frontend/lerna.json
frontend/packages/*/package.json        5 packages
frontend/plugins/*/package.json         19 plugins
embedded-sdk/package.json
zobi/mcp_service/package.json
core/pyproject.toml
extensions-cli/pyproject.toml
```

`frontend/package.json` is canonical: `setup.py` reads it to derive the Python
package version, and `release.yml` verifies the git tag against it.

**Excluded, never published:** `frontend/cypress-base`,
`frontend/eslint-rules/*`, `websocket`, `websocket/utils/client-ws-app`.

**Generated, never hand-edited:** `zobi/static/assets/package.json` and
`zobi/static/version_info.json`. `zobi/static/assets/` is the webpack output
directory (`frontend/webpack.config.js`, `BUILD_DIR`). The application reads the
former at runtime for its version display (`zobi/config.py`,
`PACKAGE_JSON_FILE`); the latter is written by `setup.py`. The committed `0.1.0`
in the assets manifest is a stale build artifact. The implementation must confirm
the build regenerates it at the release version rather than bumping it by hand.

**Dependency ranges need no rewriting.** Internal references are wildcards: 20
packages declare `@zobi.dev/core: *` and `@zobi.dev/extension-api: *` as peer
dependencies, and 19 declare `@zobi.dev/chart-controls: *`. The single pinned
range is `@zobi.dev/switchboard: ^1.0.0`, which a lockstep bump keeps satisfied.

### A2. `scripts/release.sh`

```
release.sh <version> [--dry-run] [--only pkg,...] [--skip pkg,...] [--from-tier N]
release.sh --check
```

`--check` reports drift between repository manifests and the registries and exits
non-zero if any exists. It performs no writes and is safe to run from CI.

Five phases:

1. **Preflight.** Working tree clean; `gh` and `npm` authenticated; the argument
   is valid semver; `CHANGELOG.md` contains a matching `## [x.y.z]` section; the
   version is not already published everywhere.
2. **Bump.** Discover manifests, rewrite versions, refresh the lockfile with
   `npm install --package-lock-only`.
3. **Commit.** Create branch `release/vX.Y.Z`, commit, open a pull request
   against `dev`.
4. **Publish.** After merge, push per-package tags in dependency tiers, watching
   each workflow run before starting the next tier.
5. **Release.** Push the bare `X.Y.Z` tag, which triggers `release.yml` to create
   the GitHub release from the changelog section.

**Discovery and the tier map.** Packages are discovered by globbing
`frontend/packages/*/` and `frontend/plugins/*/`, plus an explicit list of
out-of-tree packages (`embedded-sdk`, `zobi/mcp_service`, `core`,
`extensions-cli`). Every discovered package is then validated against the tier
map, and the script **aborts** if any package is unassigned. This is the property
that makes the script dynamic for future releases: adding a plugin without
registering it fails loudly instead of silently skipping the package.

Tiers, unchanged from the current script apart from the two additions:

| Tier | Packages |
|------|----------|
| 1 | `extension-api`, `switchboard`, `generator-plugin` |
| 2 | `core` |
| 3 | `chart-controls` |
| 4 | 19 plugins, `embedded-sdk`, `mcp-server` |
| 5 | `zobi-core`, then `zobi-extensions-cli`, then `zobi-dev` |

**Idempotency.** The existing registry-existence checks are retained, so a rerun
after a partial failure skips what already published and resumes at the failure.

### A3. Workflow changes

In each of the 25 npm publish workflows, replace the `Set version` step (the
`npm version --no-git-tag-version` rewrite) with a `Verify tag matches manifest`
step modelled on the equivalent in `publish-pypi-zobi-core.yml`. Manual
`workflow_dispatch` is retained for dry runs and also verifies.

New workflows:

- `publish-mcp-server.yml` for `@zobi.dev/mcp-server`, built from
  `zobi/mcp_service`.
- `publish-pypi-zobi.yml` for the `zobi-dev` distribution, built from the
  repository root.

Rename `publish-generator-zobi.yml` to `publish-generator-plugin.yml` and update
its tag prefix to `generator-plugin-v*`.

**Sequencing.** Convert one npm workflow first and prove it end-to-end with a dry
run before applying the same diff to the remaining 24. A broad simultaneous edit
to 25 files has no safe rollback point.

### A4. The application on PyPI as `zobi-dev`

Change the distribution name from `zobi` to `zobi-dev` in `pyproject.toml`
(`[project] name`) and `setup.py` (`setup(name=...)`).

The **import package remains `zobi`** and the console script remains `zobi`. Only
the distribution name changes. Users run `pip install zobi.dev` and then `zobi
run`.

Configure PyPI trusted publishing for the new project against this repository and
the new workflow filename, consistent with the existing PyPI workflows.

**Unresolved risk: wheel size.** The wheel must ship `zobi/static/assets/`, the
complete webpack output. PyPI limits a single file to 100 MB and a default
project to 10 GB total. The built artifact must be measured during
implementation. If it exceeds the file limit, the fallbacks in order of
preference are: request a file-size increase from PyPI; or ship an sdist that
builds assets at install time. This is called out as a planning task, not left to
be discovered mid-release.

### A5. Renaming the generator package

`frontend/packages/generator-zobi` becomes `frontend/packages/generator-plugin`,
and the manifest name becomes `@zobi.dev/generator-plugin`. The invocation
changes from `yo @zobi.dev/zobi` to `yo @zobi.dev/plugin`.

Fourteen files reference the old name and all must be updated:

```
frontend/oxlint.json
frontend/jest.config.js
frontend/.eslintrc.js
frontend/package-lock.json
frontend/scripts/build.js
frontend/packages/generator-zobi/README.md
frontend/packages/generator-zobi/jest.config.js
frontend/packages/generator-zobi/package.json
frontend/packages/generator-zobi/test/app.test.ts
frontend/packages/generator-zobi/test/plugin-chart.test.ts
frontend/packages/generator-zobi/generators/app/index.js
scripts/release.sh
.github/workflows/README.md
.github/workflows/publish-generator-zobi.yml
```

After `@zobi.dev/generator-plugin@1.0.0` publishes, run
`npm deprecate @zobi.dev/generator-zobi` with a message directing users to the
new name. The old package is not unpublished.

### A6. The 1.0.0 release

Because npm already holds `1.0.0` for all 25 packages, the publish phase is a
no-op for most of them; the idempotency checks report "already published" and
continue. What actually changes:

- `@zobi.dev/generator-plugin`, `@zobi.dev/mcp-server`, and `zobi-dev` publish for
  the first time.
- `CHANGELOG.md` gains a `## [1.0.0] - 2026-08-03` section.
- Every manifest is committed at `1.0.0`, giving the already-shipped artifacts a
  corresponding commit for the first time.
- Tag `1.0.0` creates the GitHub release.

### A7. Corrections shipped alongside

- Remove `pip install zobi` from `README.md`. It currently directs users to an
  unrelated third-party package. Replace it with the `zobi-dev` instructions once
  A4 lands.
- Fix two now-false claims in `.github/workflows/README.md`: that the application
  is not published to PyPI, and that package versions are independent of the
  application version.

## Testing

| Concern | How it is verified |
|---------|--------------------|
| Script correctness | `shellcheck` clean; `--dry-run` exercises every phase without writing to a registry |
| Publish path | One npm workflow converted and proven via `npm pack --dry-run` before the other 24 are touched |
| PyPI path | Full rehearsal against TestPyPI using the existing `repository: testpypi` input |
| Wheel viability | Build the `zobi-dev` wheel and measure it against the 100 MB file limit |
| Branch rules | A deliberately backend-only pull request must reach a mergeable state, proving no path-filter deadlock |
| Reproducibility | `git checkout 1.0.0` yields manifests that all read `1.0.0` |
| Generator rename | `yo @zobi.dev/plugin` scaffolds a working plugin; the package's jest suite passes |

## Acceptance criteria

1. `dev` exists; both `dev` and `main` are protected; a backend-only pull request
   can be merged without waiting on frontend checks.
2. `scripts/release.sh --check` reports zero drift.
3. `git checkout 1.0.0` produces a tree in which all 30 manifest files read
   `1.0.0`.
4. `pip install zobi.dev` installs the application and `zobi --help` runs.
5. `@zobi.dev/generator-plugin` and `@zobi.dev/mcp-server` are published at
   `1.0.0`; `@zobi.dev/generator-zobi` is deprecated with a pointer to the new
   name.
6. The GitHub release for `1.0.0` exists with the changelog section as its body.
7. No npm publish workflow rewrites a version at build time.
8. `README.md` contains no instruction to install a package the project does not
   own.

## Out of scope

Everything in Projects B through E: the README and documentation rewrite, the
`docs/` tree, `CODE_OF_CONDUCT.md` and `CONTRIBUTING.md` content, `SECURITY.md`,
`CODEOWNERS`, issue and PR template cleanup, the VPS demo deployment, and the
website. The only documentation touched here is the two factual corrections in
A7.

Also out of scope: any PEP 541 dispute over the `zobi` PyPI name, and any change
to the four CI workflows beyond what A0 requires to make them safely requirable.
