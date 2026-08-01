# Workflows

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

## Releasing one package

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

## Releasing several packages

There is no bulk-release workflow. Run each package's workflow, or push each
package tag. Keeping releases per-package means a failure in one publish cannot
leave the others half-released, and a re-run only retries the package that
failed.

## Prerequisites

- **`NPM_TOKEN`** — an automation token for the `zobi.dev` npm organization,
  stored in repository secrets.
- The org must exist and the publishing account must be a member. Verify a name
  is free with `npm view @zobi.dev/<package>` (a 404 means it is unclaimed).

Each workflow asserts that the manifest declares the package name it expects
before publishing, so a rename cannot silently publish under the wrong name.
Publishes use `--provenance`, which requires the `id-token: write` permission
already set in each workflow.

## Build output

`npm run plugins:build` compiles each package to `lib/` (CommonJS) and `esm/`
(ES modules) via babel, then emits type declarations with `tsc --build`.
`generator-zobi` ships its `generators/` directory and is skipped by the tsc
stage.
