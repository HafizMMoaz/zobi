# Release Engineering and the Zobi 1.0.0 Release: Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a `feature -> dev -> main` branch model, replace CI-side version rewriting with a commit-first lockstep release process driven by a dynamic `scripts/release.sh`, publish the Zobi application to PyPI as `zobi-dev`, and cut the 1.0.0 release.

**Architecture:** The version-manipulating logic lives in a small, pytest-tested Python module (`scripts/release_manifests.py`) that discovers publishable manifests by globbing the workspace, validates every discovered package against a tier map, and rewrites versions surgically with regular expressions so file formatting survives. `scripts/release.sh` is a thin bash orchestrator over that module plus `gh` and `npm`. The 25 npm publish workflows change from rewriting the version at build time to verifying that the git tag and the committed manifest agree, matching what the PyPI workflows already do.

**Tech Stack:** Bash, Python 3.10+ (stdlib only: `json`, `re`, `pathlib`, `tomllib`), pytest, GitHub Actions, `gh` CLI, npm workspaces, setuptools, `shellcheck`.

## Global Constraints

- **No em dashes (`—`) or en dashes (`–`) anywhere**: not in code, comments, docstrings, documentation, commit messages, PR bodies, or chat. Use a hyphen (`-`).
- **No Claude co-authorship**: no `Co-Authored-By: Claude` trailer, no "Generated with" footer, on any commit or PR body.
- **All commits authored by `HafizMMoaz <hafizmoazkhalid@gmail.com>`**. Never pass `--author`.
- **Target version for this release: `1.0.0`**.
- **Application PyPI distribution name: `zobi-dev`**. The import package stays `zobi`; the console script stays `zobi`.
- **Generator package: `@zobi.dev/generator-plugin`** in directory `frontend/packages/generator-plugin`. The `generator-` prefix is mandatory for Yeoman namespace discovery.
- **Canonical version source: `frontend/package.json`**. `setup.py` reads it; `release.yml` verifies the tag against it.
- **Never hand-edit** `zobi/static/assets/package.json` or `zobi/static/version_info.json`. Both are build outputs.
- **Node version in workflows: `22.22.0`**. Python version in publish workflows: `3.11`.
- Branch protection requires **zero** required approvals (a sole maintainer cannot approve their own PR).

## File Structure

| File | Responsibility |
|------|----------------|
| `scripts/release_manifests.py` | Create. Discovery, tier validation, semver validation, version read/write. Pure functions, no I/O beyond file read/write. The only place that knows the repository layout. |
| `tests/unit_tests/release/release_manifests_test.py` | Create. pytest coverage for the above. |
| `scripts/release.sh` | Rewrite. Thin orchestrator: preflight, bump, commit, publish, release. Delegates all manifest knowledge to the Python module. |
| `.github/workflows/frontend-lint.yml`, `frontend-tests.yml` | Modify. Add an always-running gate job so the checks are safe to mark required. |
| `.github/workflows/publish-*.yml` (25 npm) | Modify. Replace `Set version` with `Verify tag matches manifest`. |
| `.github/workflows/publish-generator-plugin.yml` | Rename from `publish-generator-zobi.yml`. |
| `.github/workflows/publish-mcp-server.yml` | Create. |
| `.github/workflows/publish-pypi-zobi.yml` | Create. Publishes the `zobi-dev` distribution. |
| `frontend/packages/generator-plugin/**` | Rename from `generator-zobi`. |
| `zobi/mcp_service/package.json` | Modify. Add a `files` allowlist. |
| `pyproject.toml`, `setup.py` | Modify. Distribution name to `zobi-dev`. |
| `README.md`, `.github/workflows/README.md` | Modify. Factual corrections. |
| `CHANGELOG.md` | Modify. Add the `## [1.0.0]` section. |

---

### Task 1: Make the frontend CI checks safe to require

**Why this is first:** `frontend-lint.yml` and `frontend-tests.yml` trigger only on `frontend/**` changes. Marking them required as-is would make every backend-only pull request wait forever on checks that never report. This must land before Task 2 turns the ruleset on.

**Files:**
- Modify: `.github/workflows/frontend-lint.yml`
- Modify: `.github/workflows/frontend-tests.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: two status check names that report on every pull request, to be referenced by name in Task 2's ruleset.

- [ ] **Step 1: Read both workflows and record the exact trigger blocks**

Run: `sed -n '1,40p' .github/workflows/frontend-lint.yml .github/workflows/frontend-tests.yml`

Note the current `on:` block and the exact `jobs.<id>.name` values. You need the final job name of each workflow, because that is the string the ruleset matches on.

- [ ] **Step 2: Remove the path filter and gate the real jobs instead**

In each of the two workflows, delete the `paths:` filter from the `on.pull_request` and `on.push` triggers, then add a `changes` job that every existing job depends on. Add this as the first job in `jobs:`:

```yaml
  changes:
    name: Detect frontend changes
    runs-on: ubuntu-24.04
    outputs:
      frontend: ${{ steps.filter.outputs.frontend }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            frontend:
              - 'frontend/**'
```

Then on every other job in the file, add these two lines:

```yaml
    needs: changes
    if: needs.changes.outputs.frontend == 'true'
```

A skipped job reports a `success` conclusion to the branch ruleset, which is what unblocks backend-only pull requests. The job still appears on every pull request, so it can be marked required.

- [ ] **Step 3: Validate the YAML parses**

Run:
```bash
python3 -c "
import yaml, sys
for f in ['.github/workflows/frontend-lint.yml', '.github/workflows/frontend-tests.yml']:
    d = yaml.safe_load(open(f))
    print(f, '->', list(d['jobs'].keys()))
    assert 'changes' in d['jobs'], f'{f} missing changes job'
"
```
Expected: both files list `changes` first, no exception.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/frontend-lint.yml .github/workflows/frontend-tests.yml
git commit -m "ci(frontend): report frontend checks on every PR

The frontend workflows only triggered on frontend/** changes, so marking
them as required status checks would leave backend-only pull requests
waiting on checks that never report. A paths-filter job now gates the real
jobs instead of gating the workflow, so the checks always appear and skip
cleanly when no frontend file changed."
```

- [ ] **Step 5: Prove it on a backend-only pull request**

Push this branch and open a pull request against `main`. It touches no `frontend/**` file, so it is itself the test case.

```bash
git push -u origin HEAD
gh pr create --base main --title "ci(frontend): report frontend checks on every PR" --body "Makes the frontend checks safe to mark as required. This PR touches no frontend file, so it doubles as the verification case."
gh pr checks --watch
```

Expected: `Detect frontend changes` succeeds; the lint and test jobs report as skipped-but-successful; **no check hangs in pending**. Do not proceed to Task 2 until this is confirmed.

---

### Task 2: Create `dev` and protect both branches

**Files:**
- No repository files. This task uses the GitHub API via `gh`.

**Interfaces:**
- Consumes: the check names confirmed in Task 1.
- Produces: a `dev` branch and rulesets on `dev` and `main`. Every later task branches from `dev` and merges by pull request.

- [ ] **Step 1: Merge Task 1's pull request, then create `dev` from `main`**

```bash
gh pr merge --squash --delete-branch
git checkout main && git pull
git checkout -b dev && git push -u origin dev
```

- [ ] **Step 2: Capture the exact required check names**

```bash
gh api repos/HafizMMoaz/zobi/commits/main/check-runs --jq '.check_runs[].name' | sort -u
```

Record the output. The next step needs these strings verbatim; a typo silently creates a check requirement that nothing ever satisfies, which blocks all merges.

- [ ] **Step 3: Write the ruleset payload**

Create `/tmp/ruleset-dev.json`, substituting the check names from Step 2 into `required_status_checks`:

```json
{
  "name": "dev protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["refs/heads/dev"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false
      }
    },
    { "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [
          { "context": "Python lint" },
          { "context": "Python tests" },
          { "context": "Detect frontend changes" }
        ]
      }
    }
  ]
}
```

`required_approving_review_count` is `0` deliberately: GitHub forbids approving your own pull request, so any higher value would deadlock every merge for a sole maintainer. The pull request requirement alone still forces the branch-and-review flow.

- [ ] **Step 4: Apply the ruleset to `dev`, then to `main`**

```bash
gh api --method POST repos/HafizMMoaz/zobi/rulesets --input /tmp/ruleset-dev.json
sed -e 's/dev protection/main protection/' -e 's#refs/heads/dev#refs/heads/main#' \
    /tmp/ruleset-dev.json > /tmp/ruleset-main.json
gh api --method POST repos/HafizMMoaz/zobi/rulesets --input /tmp/ruleset-main.json
```

- [ ] **Step 5: Verify both rulesets are active and that direct push is refused**

```bash
gh api repos/HafizMMoaz/zobi/rulesets --jq '.[] | "\(.name)\t\(.enforcement)"'
git checkout main
git commit --allow-empty -m "test: confirm main rejects direct pushes"
git push origin main; echo "exit=$?"
git reset --hard origin/main
```

Expected: both rulesets report `active`; the push is **rejected** with a protected-branch error and a non-zero exit. If the push succeeds, the ruleset is misconfigured; fix it before continuing.

- [ ] **Step 6: Set `dev` as the default branch for new pull requests**

```bash
gh repo edit HafizMMoaz/zobi --default-branch dev
```

This makes `dev` the default base for pull requests. Release tags are still cut from `main`.

---

### Task 3: Rename the generator package

**Files:**
- Rename: `frontend/packages/generator-zobi/` to `frontend/packages/generator-plugin/`
- Modify: `frontend/packages/generator-plugin/package.json`, `README.md`, `jest.config.js`, `test/app.test.ts`, `test/plugin-chart.test.ts`, `generators/app/index.js`
- Modify: `frontend/oxlint.json`, `frontend/jest.config.js`, `frontend/.eslintrc.js`, `frontend/scripts/build.js`, `frontend/package-lock.json`
- Rename: `.github/workflows/publish-generator-zobi.yml` to `publish-generator-plugin.yml`
- Modify: `.github/workflows/README.md`, `scripts/release.sh`

**Interfaces:**
- Consumes: nothing.
- Produces: the npm name `@zobi.dev/generator-plugin` and the tag prefix `generator-plugin-v`, both consumed by Task 6's tier map and Task 8's workflow conversion.

- [ ] **Step 1: Branch from `dev`**

```bash
git checkout dev && git pull && git checkout -b refactor/generator-plugin
```

- [ ] **Step 2: Record the current test result as a baseline**

Run: `cd frontend && npx jest --config packages/generator-zobi/jest.config.js 2>&1 | tail -20`
Expected: the suite passes. If it already fails, stop and report; you cannot distinguish a rename regression from a pre-existing failure otherwise.

- [ ] **Step 3: Move the directory and the workflow with git**

```bash
git mv frontend/packages/generator-zobi frontend/packages/generator-plugin
git mv .github/workflows/publish-generator-zobi.yml .github/workflows/publish-generator-plugin.yml
```

- [ ] **Step 4: Rewrite every reference**

The old name appears in two forms: the package name `@zobi.dev/generator-zobi` and the path segment `generator-zobi`. Replacing the path segment alone handles both, because the package name contains it.

```bash
cd /Users/Apple/Projects/zobi
FILES=$(grep -rl "generator-zobi" . \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv \
  --exclude-dir=dist --exclude-dir=.mypy_cache --exclude-dir=.ruff_cache \
  --exclude-dir=docs)
echo "$FILES"
# macOS sed requires the empty-string argument to -i.
echo "$FILES" | xargs sed -i '' 's/generator-zobi/generator-plugin/g'
```

`--exclude-dir=docs` protects the spec, which documents the old name deliberately as historical record.

- [ ] **Step 5: Verify no stale references and that the Yeoman namespace changed**

```bash
grep -rn "generator-zobi" . --exclude-dir=node_modules --exclude-dir=.git \
  --exclude-dir=venv --exclude-dir=dist --exclude-dir=docs || echo "clean"
node -p "require('./frontend/packages/generator-plugin/package.json').name"
grep -n "yo @zobi.dev" frontend/packages/generator-plugin/README.md
```

Expected: `clean`; the name is `@zobi.dev/generator-plugin`; the README now documents `yo @zobi.dev/plugin`.

- [ ] **Step 6: Refresh the lockfile and rerun the tests**

```bash
cd frontend && npm install --package-lock-only --legacy-peer-deps
npx jest --config packages/generator-plugin/jest.config.js 2>&1 | tail -20
```
Expected: the same pass result as the Step 2 baseline.

- [ ] **Step 7: Commit and open a pull request**

```bash
git add -A
git commit -m "refactor(generator): rename to @zobi.dev/generator-plugin

The old name repeated the project name, reading as @zobi.dev/generator-zobi.
The generator- prefix cannot be dropped because Yeoman derives its namespace
by scanning for generator-* and stripping the prefix, so @zobi.dev/generator
would be undiscoverable. The new name removes the redundancy, stays in scope,
and yields the shorter invocation 'yo @zobi.dev/plugin'.

The previously published @zobi.dev/generator-zobi is deprecated separately,
after the new name first publishes."
git push -u origin HEAD
gh pr create --base dev --fill
```

---

### Task 4: Restrict and publish `@zobi.dev/mcp-server`

**Why the restriction is required:** `zobi/mcp_service/` contains 113 Python files and 2 JavaScript files. The npm package is only the `npx` wrapper (`index.js` and `bin/zobi-mcp.js`) that spawns the Python server. The manifest declares no `files` field, so publishing as-is would ship the entire Python service, `__pycache__`, `.DS_Store`, and internal docs to npm.

**Files:**
- Modify: `zobi/mcp_service/package.json`
- Modify: `zobi/mcp_service/README.md`
- Create: `.github/workflows/publish-mcp-server.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: the npm name `@zobi.dev/mcp-server` and the tag prefix `mcp-server-v`, consumed by Task 6's tier map.

- [ ] **Step 1: Branch from `dev`**

```bash
git checkout dev && git pull && git checkout -b feat/publish-mcp-server
```

- [ ] **Step 2: Observe what would ship today**

Run: `cd zobi/mcp_service && npm pack --dry-run 2>&1 | tail -30`
Expected: a listing containing `.py` files, confirming the problem. Record the reported package size.

- [ ] **Step 3: Add the `files` allowlist**

In `zobi/mcp_service/package.json`, insert a `files` array immediately after the `"bin"` block, and fix the duplicated `"zobi"` keyword while you are there:

```json
  "files": [
    "index.js",
    "bin/",
    "README.md"
  ],
```

The `keywords` array currently reads `["mcp", "zobi", "zobi", "model-context-protocol", "ai", "claude"]`. Remove the duplicate so it reads `["mcp", "zobi", "model-context-protocol", "ai", "claude"]`.

- [ ] **Step 4: Verify only the wrapper ships**

```bash
cd zobi/mcp_service && npm pack --dry-run 2>&1 | tail -20
```
Expected: exactly `index.js`, `bin/zobi-mcp.js`, `README.md`, and `package.json`. **No `.py` files.** If any Python file is still listed, the `files` array is wrong; fix it before continuing.

- [ ] **Step 5: Document the Python prerequisite in the package README**

The wrapper spawns a Python process, so it is useless without a local Zobi install. Add this near the top of `zobi/mcp_service/README.md`:

```markdown
## Prerequisite

This package is a thin Node.js wrapper around the Zobi MCP server, which is
implemented in Python. Install Zobi first:

```bash
pip install zobi.dev
```

Then run the server:

```bash
npx @zobi.dev/mcp-server --stdio
```
```

Also update the `bin/zobi-mcp.js` header comment, which currently says "DEVELOPMENT - Not yet published to npm", to describe the published usage.

- [ ] **Step 6: Create the publish workflow**

Create `.github/workflows/publish-mcp-server.yml`. It follows the `embedded-sdk` archetype (a package outside the frontend workspace) but has no build or test step, because the package is two plain CommonJS files. It uses the verify-not-rewrite model introduced in Task 7.

```yaml
name: Publish @zobi.dev/mcp-server

# Publishes only @zobi.dev/mcp-server (zobi/mcp_service).
#
# The package is a thin npx wrapper around the Python MCP server. Only
# index.js, bin/ and README.md ship; the files allowlist in package.json
# keeps the Python service out of the tarball.
#
# The version is committed in the manifest, so bump and commit it before
# tagging. This workflow verifies the tag and the manifest agree.

on:
  push:
    tags:
      - 'mcp-server-v[0-9]+.[0-9]+.[0-9]+'
      - 'mcp-server-v[0-9]+.[0-9]+.[0-9]+-*'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Pack only, do not publish'
        type: boolean
        required: false
        default: true

concurrency:
  group: publish-mcp-server
  cancel-in-progress: false

jobs:
  publish:
    name: '@zobi.dev/mcp-server'
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      id-token: write # npm provenance

    defaults:
      run:
        working-directory: zobi/mcp_service

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22.22.0'
          registry-url: 'https://registry.npmjs.org'

      - name: Verify package identity
        id: meta
        run: |
          set -euo pipefail
          NAME=$(node -p "require('./package.json').name")
          VERSION=$(node -p "require('./package.json').version")
          if [ "$NAME" != "@zobi.dev/mcp-server" ]; then
            echo "::error::zobi/mcp_service declares '$NAME', expected '@zobi.dev/mcp-server'"
            exit 1
          fi
          echo "$NAME @ $VERSION"
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"

      - name: Verify tag matches manifest
        if: startsWith(github.ref, 'refs/tags/')
        run: |
          set -euo pipefail
          TAG_VERSION="${GITHUB_REF_NAME#mcp-server-v}"
          if [ "$TAG_VERSION" != "${{ steps.meta.outputs.version }}" ]; then
            echo "::error::Tag $GITHUB_REF_NAME implies version $TAG_VERSION but the manifest declares ${{ steps.meta.outputs.version }}"
            exit 1
          fi

      - name: Verify only the wrapper ships
        run: |
          set -euo pipefail
          if npm pack --dry-run 2>&1 | grep -q '\.py$'; then
            echo "::error::Python files would be published; check the files allowlist in package.json"
            exit 1
          fi

      - name: Pack (dry run)
        if: github.event_name == 'workflow_dispatch' && inputs.dry_run
        run: npm pack --dry-run

      - name: Publish to npm
        if: github.event_name != 'workflow_dispatch' || !inputs.dry_run
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npm publish --provenance --access public
```

- [ ] **Step 7: Validate the workflow YAML**

```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/publish-mcp-server.yml')); print(list(d['jobs']['publish'].keys()))"
```
Expected: no exception.

- [ ] **Step 8: Commit and open a pull request**

```bash
git add zobi/mcp_service/package.json zobi/mcp_service/README.md \
        zobi/mcp_service/bin/zobi-mcp.js .github/workflows/publish-mcp-server.yml
git commit -m "feat(mcp-server): restrict package contents and add publish workflow

zobi/mcp_service holds 113 Python files and 2 JavaScript files. The npm
package is only the npx wrapper that spawns the Python server, but the
manifest declared no files allowlist, so publishing would have shipped the
entire Python service, __pycache__ and internal docs to npm.

The workflow verifies the tag against the committed manifest rather than
rewriting the version, and fails if any Python file would be packed."
git push -u origin HEAD
gh pr create --base dev --fill
```

---

### Task 5: Build the manifest discovery and version-rewriting module

This is the testable core of the release process. It is written in Python rather than bash so it can be covered by the repository's existing pytest suite.

**Files:**
- Create: `scripts/release_manifests.py`
- Create: `tests/unit_tests/release/__init__.py`
- Create: `tests/unit_tests/release/release_manifests_test.py`

**Interfaces:**
- Consumes: nothing.
- Produces, all consumed by Task 6's `release.sh`:
  - `Manifest` dataclass with fields `path: Path`, `kind: str` (`"json"` or `"toml"`), `name: str | None`, `published: bool`, `tier: int | None`
  - `discover(root: Path) -> list[Manifest]`
  - `read_version(manifest: Manifest) -> str`
  - `write_version(manifest: Manifest, version: str) -> None`
  - `unassigned(manifests: list[Manifest]) -> list[str]`
  - `is_semver(value: str) -> bool`
  - `TIERS: dict[str, int]` and `PLUGIN_TIER: int`
  - CLI: `python3 scripts/release_manifests.py list|check|set <version>`

- [ ] **Step 1: Branch from `dev` and create the test package**

```bash
git checkout dev && git pull && git checkout -b feat/release-manifests
mkdir -p tests/unit_tests/release
touch tests/unit_tests/release/__init__.py
```

- [ ] **Step 2: Write the failing tests**

Create `tests/unit_tests/release/release_manifests_test.py`. Note the filename suffix: `pytest.ini` sets `python_files = *_test.py test_*.py *_tests.py`, so `_test.py` is collected.

```python
"""Tests for the release manifest discovery and version rewriting helpers."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "scripts"))

import release_manifests as rm  # noqa: E402


@pytest.fixture
def repo(tmp_path: Path) -> Path:
    """A miniature repository with one of every manifest shape."""

    def write_pkg(rel: str, name: str, version: str) -> None:
        path = tmp_path / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            json.dumps({"name": name, "version": version}, indent=2) + "\n"
        )

    write_pkg("frontend/package.json", "zobi", "0.2.0")
    (tmp_path / "frontend/lerna.json").write_text(
        '{\n  "npmClient": "npm",\n  "version": "0.20.4"\n}\n'
    )
    write_pkg("frontend/packages/core/package.json", "@zobi.dev/core", "0.20.4")
    write_pkg(
        "frontend/packages/generator-plugin/package.json",
        "@zobi.dev/generator-plugin",
        "0.20.3",
    )
    write_pkg("frontend/plugins/echarts/package.json", "@zobi.dev/echarts", "0.20.3")
    write_pkg("embedded-sdk/package.json", "@zobi.dev/embedded-sdk", "0.3.0")
    write_pkg("zobi/mcp_service/package.json", "@zobi.dev/mcp-server", "1.0.0")

    for rel, name in (
        ("core/pyproject.toml", "zobi-core"),
        ("extensions-cli/pyproject.toml", "zobi-extensions-cli"),
    ):
        path = tmp_path / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(
            f'[project]\nname = "{name}"\nversion = "1.0.0"\n'
            'description = "x"\n'
        )

    (tmp_path / "pyproject.toml").write_text(
        '[project]\nname = "zobi-dev"\ndynamic = ["version"]\n'
    )
    return tmp_path


def test_discover_finds_every_versioned_manifest(repo: Path) -> None:
    found = {m.path.relative_to(repo).as_posix() for m in rm.discover(repo)}
    assert found == {
        "frontend/package.json",
        "frontend/lerna.json",
        "frontend/packages/core/package.json",
        "frontend/packages/generator-plugin/package.json",
        "frontend/plugins/echarts/package.json",
        "embedded-sdk/package.json",
        "zobi/mcp_service/package.json",
        "core/pyproject.toml",
        "extensions-cli/pyproject.toml",
    }


def test_discover_excludes_unpublished_workspaces(repo: Path) -> None:
    """cypress-base and eslint-rules carry versions but are never published."""
    for rel in (
        "frontend/cypress-base/package.json",
        "frontend/eslint-rules/eslint-plugin-icons/package.json",
        "websocket/package.json",
    ):
        path = repo / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps({"name": "x", "version": "1.0.0"}))

    found = {m.path.relative_to(repo).as_posix() for m in rm.discover(repo)}
    assert not any("cypress-base" in f for f in found)
    assert not any("eslint-rules" in f for f in found)
    assert not any(f.startswith("websocket/") for f in found)


def test_plugins_are_assigned_the_plugin_tier(repo: Path) -> None:
    echarts = next(m for m in rm.discover(repo) if m.name == "@zobi.dev/echarts")
    assert echarts.tier == rm.PLUGIN_TIER
    assert echarts.published is True


def test_version_only_files_are_not_published(repo: Path) -> None:
    lerna = next(m for m in rm.discover(repo) if m.path.name == "lerna.json")
    assert lerna.published is False
    assert lerna.tier is None


def test_pypi_tiers_are_ordered_core_then_cli(repo: Path) -> None:
    tiers = {m.name: m.tier for m in rm.discover(repo)}
    assert tiers["zobi-core"] < tiers["zobi-extensions-cli"]


def test_unassigned_reports_a_new_unregistered_package(repo: Path) -> None:
    path = repo / "frontend/plugins/brand-new/package.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"name": "@zobi.dev/brand-new", "version": "0.1.0"}))

    # A plugin is covered by the glob, so it is assigned automatically.
    assert rm.unassigned(rm.discover(repo)) == []

    # A new top-level package is not, and must be reported.
    other = repo / "frontend/packages/mystery/package.json"
    other.parent.mkdir(parents=True, exist_ok=True)
    other.write_text(json.dumps({"name": "@zobi.dev/mystery", "version": "0.1.0"}))
    assert rm.unassigned(rm.discover(repo)) == ["@zobi.dev/mystery"]


def test_write_version_updates_json_and_preserves_formatting(repo: Path) -> None:
    target = repo / "frontend/lerna.json"
    before = target.read_text()
    manifest = next(m for m in rm.discover(repo) if m.path == target)

    rm.write_version(manifest, "1.0.0")

    after = target.read_text()
    assert rm.read_version(manifest) == "1.0.0"
    assert '"npmClient": "npm"' in after
    assert after.count("\n") == before.count("\n")


def test_write_version_updates_toml(repo: Path) -> None:
    manifest = next(m for m in rm.discover(repo) if m.name == "zobi-core")
    rm.write_version(manifest, "1.0.0")
    assert rm.read_version(manifest) == "1.0.0"
    assert 'name = "zobi-core"' in manifest.path.read_text()


def test_write_version_only_touches_the_first_version_key(repo: Path) -> None:
    """A nested "version" string elsewhere in the file must survive."""
    target = repo / "frontend/packages/core/package.json"
    target.write_text(
        '{\n  "name": "@zobi.dev/core",\n  "version": "0.20.4",\n'
        '  "scripts": { "v": "echo version 9.9.9" }\n}\n'
    )
    manifest = next(m for m in rm.discover(repo) if m.path == target)
    rm.write_version(manifest, "1.0.0")
    text = target.read_text()
    assert '"version": "1.0.0"' in text
    assert "echo version 9.9.9" in text


@pytest.mark.parametrize(
    "value,valid",
    [
        ("1.0.0", True),
        ("0.2.0", True),
        ("1.0.0-rc.1", True),
        ("1.0", False),
        ("v1.0.0", False),
        ("1.0.0.0", False),
        ("", False),
    ],
)
def test_is_semver(value: str, valid: bool) -> None:
    assert rm.is_semver(value) is valid
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `python3 -m pytest tests/unit_tests/release/ -v`
Expected: FAIL, collection error `ModuleNotFoundError: No module named 'release_manifests'`.

- [ ] **Step 4: Write the implementation**

Create `scripts/release_manifests.py`:

```python
#!/usr/bin/env python3
"""Discovery and version rewriting for the Zobi release process.

This module is the single place that knows the repository layout. release.sh
delegates all manifest handling here so the logic can be unit tested.

Versions are rewritten with a targeted regular expression rather than by
reserialising the file, because reserialising package.json would reorder keys
and reformat the whole document.
"""

from __future__ import annotations

import json
import re
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path

# Publishable packages mapped to the tier they publish in. Tier order encodes
# the dependency graph: a tier may only start once every earlier tier has
# finished publishing. Chart plugins are assigned PLUGIN_TIER by glob, so they
# are deliberately absent here.
TIERS: dict[str, int] = {
    "@zobi.dev/extension-api": 1,
    "@zobi.dev/switchboard": 1,
    "@zobi.dev/generator-plugin": 1,
    "@zobi.dev/core": 2,
    "@zobi.dev/chart-controls": 3,
    "@zobi.dev/embedded-sdk": 4,
    "@zobi.dev/mcp-server": 4,
    "zobi-core": 5,
    "zobi-extensions-cli": 6,
    "zobi-dev": 7,
}

PLUGIN_TIER = 4

# Manifests that carry the application version but are not themselves
# published to any registry.
VERSION_ONLY = ("frontend/package.json", "frontend/lerna.json")

# Published manifests that live outside the frontend workspace globs.
OUT_OF_TREE = (
    "embedded-sdk/package.json",
    "zobi/mcp_service/package.json",
    "core/pyproject.toml",
    "extensions-cli/pyproject.toml",
)

_JSON_VERSION = re.compile(r'(?m)^(\s*"version"\s*:\s*")([^"]*)(")')
_TOML_VERSION = re.compile(r'(?m)^(version\s*=\s*")([^"]*)(")')
_SEMVER = re.compile(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$")


@dataclass(frozen=True)
class Manifest:
    """A file carrying a version that the release process rewrites."""

    path: Path
    kind: str  # "json" or "toml"
    name: str | None  # distribution name; None for version-only files
    published: bool
    tier: int | None


def is_semver(value: str) -> bool:
    """True for a bare X.Y.Z, optionally with a prerelease suffix."""
    return bool(_SEMVER.match(value))


def _json_name(path: Path) -> str | None:
    try:
        return json.loads(path.read_text()).get("name")
    except (json.JSONDecodeError, OSError):
        return None


def _toml_name(path: Path) -> str | None:
    try:
        return tomllib.loads(path.read_text()).get("project", {}).get("name")
    except (tomllib.TOMLDecodeError, OSError):
        return None


def _make(root: Path, rel: str) -> Manifest | None:
    path = root / rel
    if not path.exists():
        return None
    kind = "toml" if path.suffix == ".toml" else "json"
    if rel in VERSION_ONLY:
        return Manifest(path=path, kind=kind, name=None, published=False, tier=None)
    name = _toml_name(path) if kind == "toml" else _json_name(path)
    if name is None:
        return None
    tier = TIERS.get(name)
    if tier is None and "/plugins/" in rel:
        tier = PLUGIN_TIER
    return Manifest(path=path, kind=kind, name=name, published=True, tier=tier)


def discover(root: Path) -> list[Manifest]:
    """Every manifest the release process rewrites, in a stable order."""
    rels: list[str] = list(VERSION_ONLY)
    for pattern in ("frontend/packages/*/package.json", "frontend/plugins/*/package.json"):
        rels += sorted(p.relative_to(root).as_posix() for p in root.glob(pattern))
    rels += list(OUT_OF_TREE)

    found: list[Manifest] = []
    for rel in rels:
        manifest = _make(root, rel)
        if manifest is not None:
            found.append(manifest)
    return found


def unassigned(manifests: list[Manifest]) -> list[str]:
    """Published packages with no tier.

    A non-empty result aborts the release: a package nobody registered would
    otherwise be skipped silently.
    """
    return sorted(
        m.name for m in manifests if m.published and m.tier is None and m.name
    )


def read_version(manifest: Manifest) -> str:
    pattern = _TOML_VERSION if manifest.kind == "toml" else _JSON_VERSION
    match = pattern.search(manifest.path.read_text())
    if match is None:
        raise ValueError(f"no version field in {manifest.path}")
    return match.group(2)


def write_version(manifest: Manifest, version: str) -> None:
    """Rewrite the first version field in place, preserving all formatting."""
    if not is_semver(version):
        raise ValueError(f"not a valid version: {version!r}")
    pattern = _TOML_VERSION if manifest.kind == "toml" else _JSON_VERSION
    text = manifest.path.read_text()
    new_text, count = pattern.subn(rf"\g<1>{version}\g<3>", text, count=1)
    if count != 1:
        raise ValueError(f"no version field in {manifest.path}")
    manifest.path.write_text(new_text)


def _main(argv: list[str]) -> int:
    root = Path(__file__).resolve().parents[1]
    command = argv[1] if len(argv) > 1 else "list"
    manifests = discover(root)

    if command == "list":
        for m in manifests:
            tier = m.tier if m.tier is not None else "-"
            print(f"{tier}\t{m.name or '(version only)'}\t"
                  f"{m.path.relative_to(root)}\t{read_version(m)}")
        return 0

    if command == "check":
        missing = unassigned(manifests)
        if missing:
            for name in missing:
                print(f"error: {name} has no tier in TIERS", file=sys.stderr)
            return 1
        versions = {read_version(m) for m in manifests}
        if len(versions) > 1:
            print(f"versions disagree: {sorted(versions)}", file=sys.stderr)
            return 1
        print(f"all {len(manifests)} manifests at {versions.pop()}")
        return 0

    if command == "set":
        if len(argv) < 3:
            print("usage: release_manifests.py set <version>", file=sys.stderr)
            return 2
        version = argv[2]
        if not is_semver(version):
            print(f"error: not a valid version: {version}", file=sys.stderr)
            return 2
        missing = unassigned(manifests)
        if missing:
            for name in missing:
                print(f"error: {name} has no tier in TIERS", file=sys.stderr)
            return 1
        for m in manifests:
            write_version(m, version)
            print(f"  {m.path.relative_to(root)} -> {version}")
        return 0

    print(f"unknown command: {command}", file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(_main(sys.argv))
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python3 -m pytest tests/unit_tests/release/ -v`
Expected: PASS, 10 tests.

- [ ] **Step 6: Run it against the real repository**

```bash
python3 scripts/release_manifests.py list
python3 scripts/release_manifests.py check; echo "exit=$?"
```
Expected: `list` prints 30 rows. `check` exits **1** and reports that versions disagree, which is correct right now: the repository is mid-drift and Task 10 is what reconciles it. Confirm no package is reported as missing a tier.

- [ ] **Step 7: Lint to the repository's standard**

```bash
python3 -m ruff format --check scripts/release_manifests.py tests/unit_tests/release/
python3 -m ruff check scripts/release_manifests.py tests/unit_tests/release/
python3 -m mypy scripts/release_manifests.py
```
Expected: clean. Fix anything reported; `python-lint.yml` runs the same tools and is a required check.

- [ ] **Step 8: Commit and open a pull request**

```bash
git add scripts/release_manifests.py tests/unit_tests/release/
git commit -m "feat(release): add manifest discovery and version rewriting

Discovers every versioned manifest by globbing the workspace and validates
each published package against a tier map, so a newly added package that
nobody registered aborts the release instead of being skipped silently.

Versions are rewritten with a targeted regular expression rather than by
reserialising, because reserialising package.json would reorder keys and
reformat the document."
git push -u origin HEAD
gh pr create --base dev --fill
```

---

### Task 6: Rewrite `scripts/release.sh`

**Files:**
- Rewrite: `scripts/release.sh`

**Interfaces:**
- Consumes: every function and the CLI of `scripts/release_manifests.py` from Task 5.
- Produces: the command surface used in Task 10 to cut the release.

- [ ] **Step 1: Branch from `dev`**

```bash
git checkout dev && git pull && git checkout -b feat/dynamic-release-script
```

- [ ] **Step 2: Install shellcheck**

Run: `brew install shellcheck`
It is not currently installed and is needed to verify the script in Step 5.

- [ ] **Step 3: Write the new script**

Replace `scripts/release.sh` entirely:

```bash
#!/usr/bin/env bash
# Zobi release driver.
#
# Every package tracks the application version. The version is committed to
# the repository first, then published from that commit, so a published
# artifact can always be traced back to a tag.
#
#   release.sh bump 1.2.3     rewrite manifests, commit, open a pull request
#   release.sh publish 1.2.3  push package tags in tiers and watch each run
#   release.sh release 1.2.3  push the bare tag, creating the GitHub release
#   release.sh check          report drift between the repo and the registries
#
# Safe to rerun. Packages already published at the target version are skipped.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFESTS="$ROOT/scripts/release_manifests.py"

DRY_RUN="${DRY_RUN:-false}"
ONLY="${ONLY:-}"
SKIP="${SKIP:-}"
FROM_TIER="${FROM_TIER:-0}"

declare -a DISPATCHED=()

die() { echo "error: $*" >&2; exit 1; }

###############################################################################
# Registry checks
###############################################################################

npm_published() {
    npm view "$1@$2" version >/dev/null 2>&1
}

pypi_published() {
    curl -fsS "https://pypi.org/pypi/$1/json" 2>/dev/null \
        | python3 -c "import json,sys; sys.exit(0 if '$2' in json.load(sys.stdin)['releases'] else 1)"
}

# Package name -> the tag prefix its workflow listens on. npm packages drop
# the @zobi.dev/ scope; the PyPI packages each have their own prefix.
tag_prefix() {
    case "$1" in
        @zobi.dev/*) echo "${1#@zobi.dev/}" ;;
        zobi-core) echo "zobi-core" ;;
        zobi-extensions-cli) echo "extensions-cli" ;;
        zobi-dev) echo "zobi" ;;
        *) die "no tag prefix known for $1" ;;
    esac
}

# Package name -> its workflow filename. This is deliberately separate from
# tag_prefix: the three PyPI workflows are named publish-pypi-*.yml, so
# deriving the filename from the tag prefix would look for runs of a
# workflow that does not exist.
workflow_file() {
    case "$1" in
        @zobi.dev/*)         echo "publish-${1#@zobi.dev/}.yml" ;;
        zobi-core)           echo "publish-pypi-zobi-core.yml" ;;
        zobi-extensions-cli) echo "publish-pypi-extensions-cli.yml" ;;
        zobi-dev)            echo "publish-pypi-zobi.yml" ;;
        *) die "no workflow known for $1" ;;
    esac
}

is_published() {
    case "$1" in
        @zobi.dev/*) npm_published "$1" "$2" ;;
        *) pypi_published "$1" "$2" ;;
    esac
}

selected() {
    local name="$1"
    if [ -n "$ONLY" ] && [[ ",$ONLY," != *",$name,"* ]]; then return 1; fi
    if [ -n "$SKIP" ] && [[ ",$SKIP," == *",$name,"* ]]; then return 1; fi
    return 0
}

###############################################################################
# Phases
###############################################################################

preflight() {
    local version="$1"

    command -v gh  >/dev/null || die "gh is not installed"
    command -v npm >/dev/null || die "npm is not installed"
    gh auth status >/dev/null 2>&1 || die "gh is not authenticated"

    python3 - "$version" <<'PY' || die "not a valid version"
import re, sys
sys.exit(0 if re.match(r"^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$", sys.argv[1]) else 1)
PY

    grep -q "^## \[$version\]" "$ROOT/CHANGELOG.md" \
        || die "CHANGELOG.md has no '## [$version]' section"

    # A tier-less package would be skipped silently, so refuse to continue.
    python3 "$MANIFESTS" check >/dev/null 2>&1 || {
        python3 "$MANIFESTS" check || true
    }
    python3 - <<PY || die "a package has no tier; register it in TIERS"
import sys
sys.path.insert(0, "$ROOT/scripts")
from pathlib import Path
import release_manifests as rm
sys.exit(1 if rm.unassigned(rm.discover(Path("$ROOT"))) else 0)
PY
}

cmd_bump() {
    local version="$1"
    preflight "$version"

    [ -z "$(git -C "$ROOT" status --porcelain)" ] \
        || die "working tree is not clean"

    echo "=== Bumping every manifest to $version ==="
    python3 "$MANIFESTS" set "$version"

    echo "=== Refreshing the lockfile ==="
    (cd "$ROOT/frontend" && npm install --package-lock-only --legacy-peer-deps)

    python3 "$MANIFESTS" check || die "manifests disagree after the bump"

    if [ "$DRY_RUN" = true ]; then
        echo
        echo "Dry run: leaving the changes uncommitted."
        git -C "$ROOT" --no-pager diff --stat
        return
    fi

    git -C "$ROOT" checkout -b "release/v$version"
    git -C "$ROOT" add -A
    git -C "$ROOT" commit -m "chore(release): $version"
    git -C "$ROOT" push -u origin "release/v$version"
    gh pr create --base dev --title "chore(release): $version" \
        --body "Sets every manifest to $version. Merge, then run 'scripts/release.sh publish $version'."
}

wait_tier() {
    if [ "${#DISPATCHED[@]}" -eq 0 ]; then
        echo "  nothing to publish"
        return
    fi

    local failed=0
    for entry in "${DISPATCHED[@]}"; do
        local workflow="${entry%%:*}"
        local id
        id=$(gh run list --workflow="$workflow" --limit 1 \
                --json databaseId --jq '.[0].databaseId')
        gh run watch "$id" >/dev/null
        local conclusion
        conclusion=$(gh run view "$id" --json conclusion --jq .conclusion)
        printf '  %-28s %s\n' "${entry##*:}" "$conclusion"
        [ "$conclusion" = "success" ] || failed=1
    done

    DISPATCHED=()
    [ "$failed" -eq 0 ] || die "a workflow failed; fix it and rerun this command"
}

cmd_publish() {
    local version="$1"
    preflight "$version"

    python3 "$MANIFESTS" check \
        || die "manifests are not all at $version; run 'bump' and merge it first"

    local current_tier=""
    while IFS=$'\t' read -r tier name path _; do
        [ "$tier" = "-" ] && continue
        [ "$tier" -lt "$FROM_TIER" ] && continue
        selected "$name" || continue

        if [ "$tier" != "$current_tier" ]; then
            [ -n "$current_tier" ] && wait_tier
            echo
            echo "=== Tier $tier ==="
            current_tier="$tier"
        fi

        if [ "$DRY_RUN" != true ] && is_published "$name" "$version"; then
            printf '  %-28s already published\n' "$name"
            continue
        fi

        local prefix tag
        prefix="$(tag_prefix "$name")"
        tag="$prefix-v$version"

        if [ "$DRY_RUN" = true ]; then
            printf '  %-28s would tag %s\n' "$name" "$tag"
            continue
        fi

        printf '  %-28s ' "$name"
        git -C "$ROOT" tag -f "$tag"
        git -C "$ROOT" push -f origin "$tag"
        echo "tagged $tag"
        DISPATCHED+=("$(workflow_file "$name"):$name")
    done < <(python3 "$MANIFESTS" list | sort -n -k1,1)

    wait_tier
    echo
    echo "All tiers published at $version."
}

cmd_release() {
    local version="$1"
    preflight "$version"

    local branch
    branch=$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)
    [ "$branch" = "main" ] || die "release tags are cut from main, not $branch"

    if [ "$DRY_RUN" = true ]; then
        echo "Dry run: would tag $version on main."
        return
    fi

    git -C "$ROOT" tag "$version"
    git -C "$ROOT" push origin "$version"
    echo "Pushed $version. release.yml is creating the GitHub release."
}

cmd_check() {
    python3 "$MANIFESTS" check || true
    echo
    echo "=== Repository versus registries ==="
    while IFS=$'\t' read -r tier name path version; do
        [ "$tier" = "-" ] && continue
        if is_published "$name" "$version"; then
            printf '  %-28s %-10s published\n' "$name" "$version"
        else
            printf '  %-28s %-10s NOT PUBLISHED\n' "$name" "$version"
        fi
    done < <(python3 "$MANIFESTS" list)
}

###############################################################################
# Entry point
###############################################################################

case "${1:-}" in
    bump)    [ $# -ge 2 ] || die "usage: release.sh bump <version>";    cmd_bump "$2" ;;
    publish) [ $# -ge 2 ] || die "usage: release.sh publish <version>"; cmd_publish "$2" ;;
    release) [ $# -ge 2 ] || die "usage: release.sh release <version>"; cmd_release "$2" ;;
    check)   cmd_check ;;
    *)
        cat >&2 <<'USAGE'
usage: release.sh <command> [version]

  bump <version>     rewrite every manifest, commit, open a pull request
  publish <version>  push package tags in dependency tiers, watching each run
  release <version>  push the bare tag from main, creating the GitHub release
  check              report drift between the repository and the registries

environment:
  DRY_RUN=true       describe actions without tagging, pushing or committing
  ONLY=a,b           restrict to these package names
  SKIP=a,b           exclude these package names
  FROM_TIER=N        resume publishing at tier N
USAGE
        exit 2
        ;;
esac
```

- [ ] **Step 4: Make it executable**

Run: `chmod +x scripts/release.sh scripts/release_manifests.py`

- [ ] **Step 5: Verify shellcheck is clean**

Run: `shellcheck scripts/release.sh`
Expected: no output. Fix anything reported; unquoted expansions in a release script are how a bad tag reaches a registry.

- [ ] **Step 6: Exercise the read-only paths**

```bash
./scripts/release.sh              # usage, exit 2
./scripts/release.sh check
DRY_RUN=true ./scripts/release.sh publish 1.0.0
```
Expected: usage prints and exits 2. `check` lists each package against the registries. The dry-run publish prints the tag it *would* push for each package, grouped by tier in the order 1, 2, 3, 4, 5, 6, 7, and pushes nothing.

- [ ] **Step 7: Verify preflight rejects bad input**

```bash
./scripts/release.sh bump 1.0        ; echo "exit=$?"
./scripts/release.sh bump 9.9.9      ; echo "exit=$?"
```
Expected: the first fails with "not a valid version"; the second fails with "CHANGELOG.md has no '## [9.9.9]' section". Both exit non-zero, and neither modifies any file. Confirm with `git status --porcelain` that the tree is unchanged.

- [ ] **Step 8: Commit and open a pull request**

```bash
git add scripts/release.sh scripts/release_manifests.py
git commit -m "feat(release): make the release script version-driven

The script took a hardcoded VERSION and a hardcoded package list, so every
release meant editing it and a newly added plugin was silently skipped.

It now takes the version as an argument and derives the package list and
tier order from the manifests on disk, refusing to run if any published
package has no tier. Splitting bump, publish and release into separate
commands lets the version bump land as a reviewed commit before anything
is published."
git push -u origin HEAD
gh pr create --base dev --fill
```

---

### Task 7: Convert one npm publish workflow to the verify model (pilot)

**Files:**
- Modify: `.github/workflows/publish-core.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: the exact step text that Task 8 replicates across the remaining 24 workflows.

- [ ] **Step 1: Branch from `dev`**

```bash
git checkout dev && git pull && git checkout -b ci/verify-version-core
```

- [ ] **Step 2: Replace the trigger inputs**

In `.github/workflows/publish-core.yml`, replace the whole `on:` block with:

```yaml
on:
  push:
    tags:
      - 'core-v[0-9]+.[0-9]+.[0-9]+'
      - 'core-v[0-9]+.[0-9]+.[0-9]+-*'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Pack only, do not publish'
        type: boolean
        required: false
        default: true
```

The `version` input is gone: the version now comes from the committed manifest. `dry_run` now defaults to `true`, matching the PyPI workflows, so a manual run cannot publish by accident.

- [ ] **Step 3: Capture the version from the manifest**

Replace the `Verify package identity` step with one that also exports the version:

```yaml
      - name: Verify package identity
        id: meta
        run: |
          set -euo pipefail
          NAME=$(node -p "require('./packages/core/package.json').name")
          VERSION=$(node -p "require('./packages/core/package.json').version")
          if [ "$NAME" != "@zobi.dev/core" ]; then
            echo "::error::frontend/packages/core declares '$NAME', expected '@zobi.dev/core'"
            exit 1
          fi
          echo "$NAME @ $VERSION"
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"
```

- [ ] **Step 4: Replace `Set version` with `Verify tag matches manifest`**

Delete this step entirely:

```yaml
      - name: Set version
        if: github.event_name == 'workflow_dispatch'
        run: |
          set -euo pipefail
          npm version "${{ inputs.version }}" --no-git-tag-version --allow-same-version --workspace @zobi.dev/core
```

Put this in its place:

```yaml
      - name: Verify tag matches manifest
        if: startsWith(github.ref, 'refs/tags/')
        run: |
          set -euo pipefail
          TAG_VERSION="${GITHUB_REF_NAME#core-v}"
          if [ "$TAG_VERSION" != "${{ steps.meta.outputs.version }}" ]; then
            echo "::error::Tag $GITHUB_REF_NAME implies version $TAG_VERSION but the manifest declares ${{ steps.meta.outputs.version }}"
            exit 1
          fi
```

- [ ] **Step 5: Validate the YAML and confirm no rewrite remains**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/publish-core.yml'))" && echo "yaml ok"
grep -n "no-git-tag-version\|inputs.version" .github/workflows/publish-core.yml || echo "no rewrite remains"
```
Expected: `yaml ok` and `no rewrite remains`.

- [ ] **Step 6: Commit, merge, and prove it against npm**

```bash
git add .github/workflows/publish-core.yml
git commit -m "ci(core): verify the tag against the manifest instead of rewriting

The workflow rewrote package.json at build time and discarded the change,
so no commit corresponded to the published artifact. The version now comes
from the committed manifest and the workflow refuses to publish when the
tag disagrees, matching the PyPI workflows."
git push -u origin HEAD
gh pr create --base dev --fill
```

Merge the pull request, then run a dry run from the Actions tab:

```bash
gh workflow run publish-core.yml --ref dev -f dry_run=true
sleep 10 && gh run watch "$(gh run list --workflow=publish-core.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Expected: the run succeeds, the log shows `@zobi.dev/core @ <manifest version>`, and `npm pack --dry-run` output appears with no publish step. **Do not start Task 8 until this passes**, since Task 8 replicates this diff 24 times.

---

### Task 8: Convert the remaining 24 npm publish workflows

**Files:**
- Modify: the 24 `.github/workflows/publish-*.yml` files other than `publish-core.yml`, excluding the two `publish-pypi-*` files and `publish-mcp-server.yml` (already written in the new style in Task 4).

**Interfaces:**
- Consumes: the step text proven in Task 7.
- Produces: 25 npm workflows that all verify rather than rewrite.

- [ ] **Step 1: Branch from `dev`**

```bash
git checkout dev && git pull && git checkout -b ci/verify-version-all
```

- [ ] **Step 2: Write the conversion script**

The workflows are uniform apart from three substitutions: the package name, its directory, and its tag prefix. Create `/tmp/convert.py`:

```python
"""Convert the npm publish workflows from rewriting to verifying the version."""

import re
from pathlib import Path

WORKFLOWS = Path(".github/workflows")
SKIP = {"publish-core.yml", "publish-mcp-server.yml",
        "publish-pypi-zobi-core.yml", "publish-pypi-extensions-cli.yml"}

ON_BLOCK = """on:
  push:
    tags:
      - '{prefix}-v[0-9]+.[0-9]+.[0-9]+'
      - '{prefix}-v[0-9]+.[0-9]+.[0-9]+-*'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Pack only, do not publish'
        type: boolean
        required: false
        default: true
"""

VERIFY_TAG = """      - name: Verify tag matches manifest
        if: startsWith(github.ref, 'refs/tags/')
        run: |
          set -euo pipefail
          TAG_VERSION="${{GITHUB_REF_NAME#{prefix}-v}}"
          if [ "$TAG_VERSION" != "${{{{ steps.meta.outputs.version }}}}" ]; then
            echo "::error::Tag $GITHUB_REF_NAME implies version $TAG_VERSION but the manifest declares ${{{{ steps.meta.outputs.version }}}}"
            exit 1
          fi
"""

for path in sorted(WORKFLOWS.glob("publish-*.yml")):
    if path.name in SKIP:
        continue
    text = path.read_text()
    prefix = path.name[len("publish-"):-len(".yml")]

    # Replace the on: block, which runs from "on:" to the "concurrency:" line.
    text = re.sub(r"(?ms)^on:\n.*?(?=^concurrency:)",
                  ON_BLOCK.format(prefix=prefix) + "\n", text)

    # Give the identity step an id and have it export the version.
    text = text.replace(
        "      - name: Verify package identity\n        run: |",
        "      - name: Verify package identity\n        id: meta\n        run: |",
    )
    text = re.sub(
        r'(\n          echo "\$ACTUAL @ \$\(node -p "require\(\'[^\']+\'\)\.version"\)")',
        r'\1\n          echo "version=$(node -p "require(\'./PLACEHOLDER\').version")" >> "$GITHUB_OUTPUT"',
        text,
    )
    manifest = re.search(r"require\('(\./[^']+package\.json)'\)\.name", text).group(1)
    text = text.replace("./PLACEHOLDER", manifest.lstrip("./"))

    # Swap the rewrite step for the verify step.
    text = re.sub(r"(?ms)^      - name: Set version\n.*?(?=^      - name: )",
                  VERIFY_TAG.format(prefix=prefix) + "\n", text)

    path.write_text(text)
    print(f"converted {path.name} (prefix {prefix})")
```

Run: `python3 /tmp/convert.py`

- [ ] **Step 3: Verify every workflow converted correctly**

```bash
echo "--- any rewrite left? (expect none) ---"
grep -ln "no-git-tag-version\|inputs.version" .github/workflows/publish-*.yml || echo "clean"

echo "--- every npm workflow has the verify step? (expect 25) ---"
grep -l "Verify tag matches manifest" .github/workflows/publish-*.yml | grep -v pypi | wc -l

echo "--- all YAML parses ---"
python3 -c "
import yaml, pathlib, sys
for p in sorted(pathlib.Path('.github/workflows').glob('publish-*.yml')):
    try: yaml.safe_load(p.read_text())
    except Exception as e: print('FAIL', p.name, e); sys.exit(1)
print('all parse')
"
```
Expected: `clean`; the count is `25`; `all parse`.

- [ ] **Step 4: Spot-check two different archetypes by eye**

```bash
git diff .github/workflows/publish-echarts.yml
git diff .github/workflows/publish-embedded-sdk.yml
```

Confirm the tag prefixes read `echarts-v` and `embedded-sdk-v` respectively, and that `embedded-sdk` kept its own `working-directory`, `npm install`, `npm run build` and `npm test` steps. If the regex mangled either file, fix it by hand rather than adjusting the script.

- [ ] **Step 5: Commit and open a pull request**

```bash
git add .github/workflows/
git commit -m "ci(publish): verify the tag against the manifest in every npm workflow

Applies the change proven on publish-core.yml to the remaining 24 npm
workflows. None of them rewrite a version at build time now, so every
published artifact corresponds to a commit.

Manual runs default to dry_run: true, matching the PyPI workflows, so a
dispatch cannot publish by accident."
git push -u origin HEAD
gh pr create --base dev --fill
```

---

### Task 9: Publish the application to PyPI as `zobi-dev`

**Files:**
- Modify: `pyproject.toml`
- Modify: `setup.py`
- Create: `.github/workflows/publish-pypi-zobi.yml`

**Interfaces:**
- Consumes: nothing.
- Produces: the `zobi-dev` distribution and the `zobi-v` tag prefix, matching `tag_prefix()` in Task 6.

- [ ] **Step 1: Branch from `dev`**

```bash
git checkout dev && git pull && git checkout -b feat/publish-app-to-pypi
```

- [ ] **Step 2: Rename the distribution**

In `pyproject.toml`, change `name = "zobi"` to `name = "zobi-dev"`.

In `setup.py`, change `name="zobi"` to `name="zobi-dev"`.

Change **only** the distribution name. `packages=find_packages()`, the import package `zobi`, and the `console_scripts` entry `zobi=zobi.cli.main:zobi` all stay exactly as they are. Under PEP 503 normalisation this publishes as `zobi-dev` and installs with either `pip install zobi-dev` or `pip install zobi.dev`.

- [ ] **Step 3: Add the project URLs the current manifest lacks**

Add to the `[project]` table in `pyproject.toml`:

```toml
[project.urls]
Homepage = "https://zobi.dev"
Repository = "https://github.com/HafizMMoaz/zobi"
Issues = "https://github.com/HafizMMoaz/zobi/issues"
Changelog = "https://github.com/HafizMMoaz/zobi/blob/main/CHANGELOG.md"
```

- [ ] **Step 4: Build the distribution and verify name and size**

```bash
python3 -m pip install --upgrade build twine
python3 -m build --wheel --outdir /tmp/zobi-dist .
ls -lh /tmp/zobi-dist/
python3 -m twine check --strict /tmp/zobi-dist/*
```

Expected: a file named `zobi_dev-<version>-py3-none-any.whl`; `twine check` passes.

Then assert the size budget. The static assets measure 51 MB compressed against a PyPI per-file limit of 100 MB:

```bash
python3 -c "
import pathlib
w = next(pathlib.Path('/tmp/zobi-dist').glob('*.whl'))
mb = w.stat().st_size / 1_000_000
print(f'{w.name}: {mb:.1f} MB')
assert mb < 90, f'wheel is {mb:.1f} MB, too close to the 100 MB PyPI limit'
print('within budget')
"
```

If this assertion fails, stop and report. The fallbacks are to request a file-size increase from PyPI, or to ship an sdist that builds assets at install time.

- [ ] **Step 5: Confirm the built wheel actually contains the frontend**

```bash
python3 -c "
import zipfile, pathlib
w = next(pathlib.Path('/tmp/zobi-dist').glob('*.whl'))
names = zipfile.ZipFile(w).namelist()
assets = [n for n in names if n.startswith('zobi/static/assets/')]
print('asset files in wheel:', len(assets))
assert any(n.endswith('.js') for n in assets), 'no JavaScript in the wheel'
assert 'zobi/cli/main.py' in names, 'CLI missing from the wheel'
print('wheel contents look right')
"
```
Expected: a four-digit asset count and both assertions passing. A wheel without `zobi/static/assets` installs an application that serves no frontend.

- [ ] **Step 6: Create the publish workflow**

Create `.github/workflows/publish-pypi-zobi.yml`, modelled on `publish-pypi-zobi-core.yml`. The version is dynamic here (`setup.py` reads `frontend/package.json`), so the identity step reads it from there:

```yaml
name: Publish zobi-dev (PyPI)

# Publishes the Zobi application itself as the zobi-dev distribution.
#
# The PyPI name 'zobi' belongs to an unrelated third party, so the
# application ships as zobi-dev. PEP 503 name normalisation means it
# installs with either 'pip install zobi-dev' or 'pip install zobi.dev'.
#
# The version comes from frontend/package.json, which setup.py reads.

on:
  push:
    tags:
      - 'zobi-v[0-9]+.[0-9]+.[0-9]+'
      - 'zobi-v[0-9]+.[0-9]+.[0-9]+-*'
  workflow_dispatch:
    inputs:
      dry_run:
        description: 'Build and check only, do not publish'
        type: boolean
        required: false
        default: true
      repository:
        description: 'Target index'
        type: choice
        required: false
        default: pypi
        options:
          - pypi
          - testpypi

concurrency:
  group: publish-pypi-zobi
  cancel-in-progress: false

jobs:
  publish:
    name: zobi-dev
    runs-on: ubuntu-24.04
    environment: ${{ github.event_name == 'workflow_dispatch' && inputs.repository || 'pypi' }}
    permissions:
      contents: read
      id-token: write # PyPI trusted publishing
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22.22.0'
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Verify package identity
        id: meta
        run: |
          set -euo pipefail
          NAME=$(python -c 'import tomllib,pathlib; print(tomllib.loads(pathlib.Path("pyproject.toml").read_text())["project"]["name"])')
          VERSION=$(node -p "require('./frontend/package.json').version")
          if [ "$NAME" != "zobi-dev" ]; then
            echo "::error::pyproject.toml declares '$NAME', expected 'zobi-dev'"
            exit 1
          fi
          echo "$NAME @ $VERSION"
          echo "version=$VERSION" >> "$GITHUB_OUTPUT"

      - name: Verify tag matches manifest
        if: startsWith(github.ref, 'refs/tags/')
        run: |
          set -euo pipefail
          TAG_VERSION="${GITHUB_REF_NAME#zobi-v}"
          if [ "$TAG_VERSION" != "${{ steps.meta.outputs.version }}" ]; then
            echo "::error::Tag $GITHUB_REF_NAME implies version $TAG_VERSION but frontend/package.json declares ${{ steps.meta.outputs.version }}"
            exit 1
          fi

      - name: Build the frontend
        run: |
          set -euo pipefail
          cd frontend
          npm ci --legacy-peer-deps
          npm run build

      - name: Build the distribution
        run: |
          python -m pip install --upgrade build twine
          python -m build --wheel --outdir dist .

      - name: Check the distribution
        run: twine check --strict dist/*

      - name: Verify the wheel is within the PyPI size limit
        run: |
          python - <<'PY'
          import pathlib
          wheel = next(pathlib.Path("dist").glob("*.whl"))
          mb = wheel.stat().st_size / 1_000_000
          print(f"{wheel.name}: {mb:.1f} MB")
          if mb >= 90:
              raise SystemExit(f"::error::wheel is {mb:.1f} MB, too close to the 100 MB PyPI limit")
          PY

      - uses: actions/upload-artifact@v4
        with:
          name: zobi-dev-dist
          path: dist/

      - name: Publish to PyPI
        if: github.event_name != 'workflow_dispatch' || !inputs.dry_run
        uses: pypa/gh-action-pypi-publish@release/v1
        with:
          packages-dir: dist/
          repository-url: ${{ (github.event_name == 'workflow_dispatch' && inputs.repository == 'testpypi') && 'https://test.pypi.org/legacy/' || 'https://upload.pypi.org/legacy/' }}
          password: ${{ secrets.PYPI_API_TOKEN }}
```

- [ ] **Step 7: Configure PyPI trusted publishing**

This is a manual step in the PyPI web interface and cannot be scripted. At <https://pypi.org/manage/account/publishing/>, add a pending publisher:

- PyPI project name: `zobi-dev`
- Owner: `HafizMMoaz`
- Repository: `zobi`
- Workflow filename: `publish-pypi-zobi.yml`
- Environment: `pypi`

Repeat on <https://test.pypi.org> with environment `testpypi` so the rehearsal in Step 9 can run.

- [ ] **Step 8: Commit and merge**

```bash
git add pyproject.toml setup.py .github/workflows/publish-pypi-zobi.yml
git commit -m "feat(pypi): publish the application as zobi-dev

The PyPI name 'zobi' is registered to an unrelated third party, and the
README told users to install it. The application now ships as zobi-dev,
which PEP 503 normalisation also makes installable as 'pip install
zobi.dev', matching the @zobi.dev npm scope.

Only the distribution name changes. The import package and the console
script are both still 'zobi'."
git push -u origin HEAD
gh pr create --base dev --fill
```

- [ ] **Step 9: Rehearse against TestPyPI**

After merging:

```bash
gh workflow run publish-pypi-zobi.yml --ref dev -f dry_run=false -f repository=testpypi
sleep 10 && gh run watch "$(gh run list --workflow=publish-pypi-zobi.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
```

Then verify the rehearsal installs in a clean environment:

```bash
python3 -m venv /tmp/zobi-testinstall
/tmp/zobi-testinstall/bin/pip install \
  --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ zobi.dev
/tmp/zobi-testinstall/bin/zobi --help
```

Expected: the install resolves via the `zobi.dev` spelling, and `zobi --help` prints the CLI usage. Do not proceed to Task 10 until this works.

---

### Task 10: Cut the 1.0.0 release

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `README.md`
- Modify: `.github/workflows/README.md`
- Modify: all 30 version manifests, via `scripts/release.sh bump`

**Interfaces:**
- Consumes: everything from Tasks 1 through 9.
- Produces: the 1.0.0 release.

- [ ] **Step 1: Branch from `dev` and write the changelog section**

```bash
git checkout dev && git pull && git checkout -b docs/changelog-1.0.0
```

Add this above the `## [0.2.0]` section in `CHANGELOG.md`. `release.yml` extracts everything between this heading and the next `## `, so the heading format must match exactly:

```markdown
## [1.0.0] - 2026-08-03

### Added

- The Zobi application is published to PyPI as `zobi-dev`, installable with
  `pip install zobi.dev`. The import package and the `zobi` command are
  unchanged.
- `@zobi.dev/mcp-server`, the npx wrapper for the Zobi MCP server, is published
  for the first time. It requires a local Zobi installation, since it spawns the
  Python server.
- Branch protection on `main` and `dev`. Changes reach `main` through a pull
  request against `dev`; direct pushes to either branch are refused.

### Changed

- Every distributed package now tracks the application version. A single number
  identifies the application, the 26 npm packages and the three PyPI
  distributions.
- The npm publish workflows verify that the git tag and the committed manifest
  agree, rather than rewriting the version during the build. Every published
  artifact now corresponds to a commit that can be checked out.
- `scripts/release.sh` takes the version as an argument and derives the package
  list from the manifests on disk. It refuses to run when a published package
  has no tier assigned, so a newly added package cannot be skipped silently.
- `@zobi.dev/generator-zobi` is renamed to `@zobi.dev/generator-plugin`,
  invoked as `yo @zobi.dev/plugin`. The old package is deprecated on npm.
- `@zobi.dev/mcp-server` ships only its Node.js wrapper. The Python service it
  spawns is no longer included in the npm tarball.

### Fixed

- The README instructed users to run `pip install zobi`, which installs an
  unrelated third-party package of that name. It now documents `pip install
  zobi.dev`.
```

- [ ] **Step 2: Correct the README install instructions**

In `README.md`, replace the `### Installation` block:

```markdown
### Installation

```bash
# Install the application from PyPI
pip install zobi.dev

# Initialise and run
zobi db upgrade
zobi init
zobi run
```
```

- [ ] **Step 3: Correct the two false claims in the workflows README**

In `.github/workflows/README.md`:

Replace "These are the two packages extension authors install. The Zobi application itself is not published to PyPI; it ships as a Docker image and a git tag." with:

```markdown
`zobi-core` and `zobi-extensions-cli` are the packages extension authors
install. The application itself is published as the `zobi-dev` distribution,
because the PyPI name `zobi` belongs to an unrelated third party. PEP 503 name
normalisation means it installs with either spelling: `pip install zobi-dev` or
`pip install zobi.dev`.
```

Replace "Package versions are independent of the application version." with:

```markdown
Every package tracks the application version. `scripts/release.sh` sets them
all in one commit, so a single number identifies the whole release.
```

Add `zobi-dev` and `@zobi.dev/mcp-server` to the package tables, and rename the `generator-zobi` row to `generator-plugin`.

- [ ] **Step 4: Commit the documentation and merge it**

```bash
git add CHANGELOG.md README.md .github/workflows/README.md
git commit -m "docs: add the 1.0.0 changelog and correct the install instructions

The README told users to run 'pip install zobi', which installs an unrelated
third-party package. The workflows README claimed the application is not
published to PyPI and that package versions are independent of the
application version; neither is true as of 1.0.0."
git push -u origin HEAD
gh pr create --base dev --fill
```

Merge before continuing: `release.sh` preflight requires the changelog section to exist.

- [ ] **Step 5: Rehearse the bump**

```bash
git checkout dev && git pull
DRY_RUN=true ./scripts/release.sh bump 1.0.0
git --no-pager diff --stat
```

Expected: 30 manifests modified, plus `frontend/package-lock.json`. Confirm `frontend/package.json` moved `0.2.0 -> 1.0.0` and `frontend/lerna.json` moved `0.20.4 -> 1.0.0`.

```bash
git checkout .    # discard the rehearsal
```

- [ ] **Step 6: Run the real bump and merge it**

```bash
./scripts/release.sh bump 1.0.0
```

This opens a pull request from `release/v1.0.0` into `dev`. Review the diff, confirm CI is green, then merge it and fast-forward `main`:

```bash
gh pr merge --squash --delete-branch
git checkout dev && git pull
gh pr create --base main --head dev --title "release: 1.0.0" \
  --body "Promotes 1.0.0 to main for tagging."
gh pr merge --merge
git checkout main && git pull
```

- [ ] **Step 7: Verify the repository now agrees with itself**

```bash
python3 scripts/release_manifests.py check
```
Expected: `all 30 manifests at 1.0.0`, exit 0. This is the moment the drift closes.

- [ ] **Step 8: Publish**

```bash
DRY_RUN=true ./scripts/release.sh publish 1.0.0   # review the plan first
./scripts/release.sh publish 1.0.0
```

Expected: tiers 1 through 4 report `already published` for the 24 packages that npm already holds at 1.0.0. What actually publishes is `@zobi.dev/generator-plugin`, `@zobi.dev/mcp-server`, and `zobi-dev`. `zobi-core` and `zobi-extensions-cli` report `already published`.

If a tier fails, fix the cause and rerun the same command: published packages are skipped, so it resumes where it stopped.

- [ ] **Step 9: Create the GitHub release**

```bash
git checkout main && git pull
./scripts/release.sh release 1.0.0
gh release view 1.0.0
```
Expected: a release titled `1.0.0` whose body is the changelog section from Step 1.

- [ ] **Step 10: Deprecate the old generator package**

```bash
npm deprecate @zobi.dev/generator-zobi \
  "Renamed to @zobi.dev/generator-plugin. Install that instead and run 'yo @zobi.dev/plugin'."
npm view @zobi.dev/generator-zobi deprecated
```
Expected: the deprecation message is returned. Do not unpublish the old package; existing installs must keep resolving.

- [ ] **Step 11: Verify every acceptance criterion**

```bash
echo "--- 1: branch protection ---"
gh api repos/HafizMMoaz/zobi/rulesets --jq '.[] | "\(.name)\t\(.enforcement)"'

echo "--- 2 and 3: repository agrees at 1.0.0 ---"
git checkout 1.0.0 -q && python3 scripts/release_manifests.py check && git checkout main -q

echo "--- 4: the application installs from PyPI ---"
python3 -m venv /tmp/zobi-verify && /tmp/zobi-verify/bin/pip install -q zobi.dev \
  && /tmp/zobi-verify/bin/zobi --help | head -3

echo "--- 5: new packages published, old one deprecated ---"
npm view @zobi.dev/generator-plugin version
npm view @zobi.dev/mcp-server version
npm view @zobi.dev/generator-zobi deprecated

echo "--- 6: the GitHub release exists ---"
gh release view 1.0.0 --json tagName,name --jq '"\(.tagName) \(.name)"'

echo "--- 7: no workflow rewrites a version ---"
grep -l "no-git-tag-version" .github/workflows/*.yml || echo "clean"

echo "--- 8: the README does not tell users to install a package we do not own ---"
grep -n "pip install zobi" README.md
```

Expected: both rulesets `active`; `all 30 manifests at 1.0.0`; the CLI help prints; both new packages report `1.0.0`; the deprecation message is returned; the release exists; `clean`; and the only README match is `pip install zobi.dev`.

---

## Self-Review

**Spec coverage.** A0 maps to Tasks 1 and 2. A1 maps to Task 5, whose `discover` encodes the exact include and exclude lists. A2 maps to Tasks 5 and 6. A3 maps to Tasks 4, 7, 8 and 9. A4 maps to Task 9. A5 maps to Task 3, with the npm deprecation in Task 10 Step 10 because it can only run after the new name publishes. A6 maps to Task 10. A7 maps to Task 10 Steps 2 and 3. Every acceptance criterion in the spec is checked in Task 10 Step 11. No gaps.

**Placeholder scan.** No `TBD`, `TODO`, "handle edge cases", or "similar to Task N". Every code step carries the actual content. The one unscriptable step, PyPI trusted publishing (Task 9 Step 7), lists the exact field values to enter.

**Type consistency.** `Manifest` fields (`path`, `kind`, `name`, `published`, `tier`) are defined in Task 5 and used with those names by `release.sh` in Task 6 through the `list` CLI, whose four tab-separated columns (`tier`, `name`, `path`, `version`) match the `read` statements in `cmd_publish` and `cmd_check`. `TIERS` and `PLUGIN_TIER` are referenced by the tests and by `_make`. The tag prefixes in `tag_prefix()` match the tag patterns in every workflow: `core-v`, `echarts-v`, `embedded-sdk-v`, `generator-plugin-v`, `mcp-server-v`, `zobi-core-v`, `extensions-cli-v`, `zobi-v`.

**One bug this review caught and fixed.** `cmd_publish` originally derived the workflow filename from the tag prefix as `publish-$prefix.yml`. That is correct for all 26 npm packages but wrong for all three PyPI ones, whose workflows are named `publish-pypi-zobi-core.yml`, `publish-pypi-extensions-cli.yml` and `publish-pypi-zobi.yml`. The tags would have pushed and the publishes would have run, but `wait_tier` would have queried a workflow that does not exist and failed at the point of reporting the result. `workflow_file()` is now a separate function from `tag_prefix()` precisely because the two mappings differ.

**Tag namespace check.** The per-package tag `zobi-v1.0.0` does not match `release.yml`'s trigger pattern `[0-9]+.[0-9]+.[0-9]+`, so publishing the application distribution cannot accidentally fire the GitHub release job. The bare `1.0.0` tag in Task 10 Step 9 is the only thing that triggers it.

**One deliberate ordering note.** Task 5 Step 6 expects `release_manifests.py check` to exit 1 against the real repository, because the manifests genuinely disagree until Task 10 reconciles them. That is asserted as the expected result rather than treated as a failure.
