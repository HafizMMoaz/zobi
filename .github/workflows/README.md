# Workflows

## Continuous integration

| Workflow | Runs on | What it checks |
| --- | --- | --- |
| `python-lint.yml` | push to `main`, PRs | `ruff format --check`, `ruff check`, mypy, pylint, db engine spec metadata |
| `python-tests.yml` | push to `main`, PRs | `pytest tests/unit_tests` on Python 3.10/3.11/3.12, `extensions-cli` tests |
| `frontend-lint.yml` | `frontend/**` changes | oxlint, custom rules, prettier, `tsc --noEmit` |
| `frontend-tests.yml` | `frontend/**` changes | jest across 4 shards, plus the package and webpack builds |

Tool versions in `python-lint.yml` are pinned to match
`requirements/development.txt` and `.pre-commit-config.yaml`. When you bump a
linter in either place, bump it in the workflow's `env` block too.

The lint workflows deliberately mirror the hooks in `.pre-commit-config.yaml`,
so `pre-commit run --all-files` locally should produce the same result as CI.

### Tests that are not run automatically

`tests/integration_tests` needs a provisioned metadata database and Redis, so it
is opt-in: run `python-tests.yml` from the Actions tab and tick **Also run
tests/integration_tests**. Playwright and Cypress suites are not wired into CI.

## Publishing npm packages

Every frontend workspace package is published under the `@zobi.dev` scope.

Each package has its own workflow, `publish-<name>.yml`, so a single package can
be released without touching the others.

### Packages

| Package | Directory | Workflow |
| --- | --- | --- |
| `@zobi.dev/core` | `frontend/packages/core` | `publish-core.yml` |
| `@zobi.dev/chart-controls` | `frontend/packages/chart-controls` | `publish-chart-controls.yml` |
| `@zobi.dev/extension-api` | `frontend/packages/extension-api` | `publish-extension-api.yml` |
| `@zobi.dev/switchboard` | `frontend/packages/switchboard` | `publish-switchboard.yml` |
| `@zobi.dev/generator-zobi` | `frontend/packages/generator-zobi` | `publish-generator-zobi.yml` |
| `@zobi.dev/embedded-sdk` | `embedded-sdk` | `publish-embedded-sdk.yml` |

`embedded-sdk` sits outside the frontend npm workspace and has its own
dependency tree, so its workflow installs and builds it on its own.

### Chart plugins

| Package | Directory | Workflow |
| --- | --- | --- |
| `@zobi.dev/ag-grid-table` | `frontend/plugins/ag-grid-table` | `publish-ag-grid-table.yml` |
| `@zobi.dev/calendar` | `frontend/plugins/calendar` | `publish-calendar.yml` |
| `@zobi.dev/cartodiagram` | `frontend/plugins/cartodiagram` | `publish-cartodiagram.yml` |
| `@zobi.dev/chord` | `frontend/plugins/chord` | `publish-chord.yml` |
| `@zobi.dev/country-map` | `frontend/plugins/country-map` | `publish-country-map.yml` |
| `@zobi.dev/deckgl` | `frontend/plugins/deckgl` | `publish-deckgl.yml` |
| `@zobi.dev/echarts` | `frontend/plugins/echarts` | `publish-echarts.yml` |
| `@zobi.dev/handlebars` | `frontend/plugins/handlebars` | `publish-handlebars.yml` |
| `@zobi.dev/horizon` | `frontend/plugins/horizon` | `publish-horizon.yml` |
| `@zobi.dev/nvd3` | `frontend/plugins/nvd3` | `publish-nvd3.yml` |
| `@zobi.dev/paired-t-test` | `frontend/plugins/paired-t-test` | `publish-paired-t-test.yml` |
| `@zobi.dev/parallel-coordinates` | `frontend/plugins/parallel-coordinates` | `publish-parallel-coordinates.yml` |
| `@zobi.dev/partition` | `frontend/plugins/partition` | `publish-partition.yml` |
| `@zobi.dev/pivot-table` | `frontend/plugins/pivot-table` | `publish-pivot-table.yml` |
| `@zobi.dev/point-cluster-map` | `frontend/plugins/point-cluster-map` | `publish-point-cluster-map.yml` |
| `@zobi.dev/rose` | `frontend/plugins/rose` | `publish-rose.yml` |
| `@zobi.dev/table` | `frontend/plugins/table` | `publish-table.yml` |
| `@zobi.dev/word-cloud` | `frontend/plugins/word-cloud` | `publish-word-cloud.yml` |
| `@zobi.dev/world-map` | `frontend/plugins/world-map` | `publish-world-map.yml` |

### Releasing one package

**From the Actions tab** — pick the package's workflow, choose a version bump
(`patch`, `minor`, `major`, or an exact version), and optionally tick **dry run**
to `npm pack` without publishing.

**By tag** — push a tag named `<package>-v<version>`:

```bash
git tag table-v1.2.3
git push origin table-v1.2.3
```

The directory name matches the package name after the scope, so the tag prefix
is always the part of the package name after `@zobi.dev/`.

### Releasing several packages

There is no bulk-release workflow. Run each package's workflow, or push each
package tag. Keeping releases per-package means a failure in one publish cannot
leave the others half-released, and a re-run only retries the package that
failed.

### Prerequisites

- **`NPM_TOKEN`** — an automation token for the `zobi.dev` npm organization,
  stored in repository secrets.
- The org must exist and the publishing account must be a member. Verify a name
  is free with `npm view @zobi.dev/<package>` (a 404 means it is unclaimed).

Each workflow asserts that the manifest declares the package name it expects
before publishing, so a rename cannot silently publish under the wrong name.
Publishes use `--provenance`, which requires the `id-token: write` permission
already set in each workflow.

### Build output

`npm run plugins:build` compiles each package to `lib/` (CommonJS) and `esm/`
(ES modules) via babel, then emits type declarations with `tsc --build`.
`generator-zobi` ships its `generators/` directory and is skipped by the tsc
stage.

## Publishing Python packages

| Distribution | Directory | Version source | Workflow |
| --- | --- | --- | --- |
| `zobi` | repo root | `frontend/package.json` | `publish-pypi-zobi.yml` |
| `zobi-core` | `core` | `core/pyproject.toml` | `publish-pypi-zobi-core.yml` |
| `extensions-cli` | `extensions-cli` | `extensions-cli/pyproject.toml` | `publish-pypi-extensions-cli.yml` |

Versions are static and committed, so bump the manifest first, then tag. Each
workflow refuses to publish when the tag and the manifest disagree.

### Releasing

**From the Actions tab** — pick the workflow. `dry_run` defaults to on, which
builds, runs `twine check --strict` and uploads the distributions as an artifact
without publishing. Choose `testpypi` under **Target index** to rehearse against
TestPyPI.

**By tag:**

```bash
# zobi-core and extensions-cli use a package-scoped prefix
git tag zobi-core-v0.2.0
git tag extensions-cli-v0.2.0

# the root zobi distribution uses the bare project version
git tag 0.2.0
```

`publish-pypi-zobi.yml` builds the frontend before packaging. `zobi/static/assets`
is gitignored and only populated by webpack, so the wheel has no usable UI
without that step. The workflow asserts the compiled assets are present in the
wheel before publishing.

### Prerequisites

Both authentication paths are supported:

- **Trusted publishing (preferred)** — configure a publisher on PyPI for this
  repository and workflow filename, and leave `PYPI_API_TOKEN` unset. The
  `id-token: write` permission is already in place.
- **API token** — store a project-scoped token as the `PYPI_API_TOKEN` secret.

Each job runs in a `pypi` (or `testpypi`) environment. Adding required reviewers
to that environment turns every publish into an approval gate.

## Releasing Zobi

`release.yml` creates the GitHub release. It triggers on a bare version tag,
verifies the tag matches `frontend/package.json`, and uses the matching
`## [x.y.z]` section of `CHANGELOG.md` as the release body. It fails if that
section is missing, so update the changelog before tagging.

A full release:

1. Bump the version in `frontend/package.json` and add the release section to
   `CHANGELOG.md`, then merge that.
2. Push the tag: `git tag 0.2.0 && git push origin 0.2.0`.
3. `release.yml` creates the GitHub release and `publish-pypi-zobi.yml` publishes
   the distribution. Both trigger off the same tag.
4. Release any npm packages that changed, using their own workflows.

To create a release for a tag that already exists, run `release.yml` from the
Actions tab with the tag name. It creates a draft by default and never
overwrites an existing release.
