#!/usr/bin/env bash
# Zobi 1.0.0 release
#
# Safe to rerun. Packages already published at 1.0.0 are skipped.

set -euo pipefail

DRY_RUN="${DRY_RUN:-false}"
REF=main
VERSION=1.0.0

PLUGINS="ag-grid-table calendar cartodiagram chord country-map deckgl echarts
handlebars horizon nvd3 paired-t-test parallel-coordinates partition
pivot-table point-cluster-map rose table word-cloud world-map"

declare -a DISPATCHED=()

###############################################################################
# Registry checks
###############################################################################

npm_exists() {
    npm view "@zobi.dev/$1@$VERSION" version >/dev/null 2>&1
}

pypi_exists() {
    python_pkg="$1"
    curl -fsS "https://pypi.org/pypi/$python_pkg/json" \
        | grep -q "\"$VERSION\"" >/dev/null 2>&1
}

###############################################################################
# Workflow helpers
###############################################################################

dispatch() {
    local workflow="$1"

    printf '  %-24s ' "$workflow"

    if gh workflow run "publish-$workflow.yml" \
        --ref "$REF" \
        -f version="$VERSION" \
        -f dry_run="$DRY_RUN" >/dev/null
    then
        echo "dispatched"
        DISPATCHED+=("$workflow")
    else
        echo "DISPATCH FAILED"
        exit 1
    fi
}

dispatch_npm() {
    local pkg="$1"

    if [ "$DRY_RUN" = false ] && npm_exists "$pkg"; then
        printf '  %-24s already published\n' "$pkg"
        return
    fi

    dispatch "$pkg"
}

dispatch_pypi() {
    local workflow="$1"
    local package="$2"

    if [ "$DRY_RUN" = false ] && pypi_exists "$package"; then
        printf '  %-24s already published\n' "$workflow"
        return
    fi

    printf '  %-24s ' "$workflow"

    if gh workflow run "publish-$workflow.yml" \
        --ref "$REF" \
        -f repository=pypi \
        -f dry_run="$DRY_RUN" >/dev/null
    then
        echo "dispatched"
        DISPATCHED+=("$workflow")
    else
        echo "DISPATCH FAILED"
        exit 1
    fi
}

wait_tier() {
    if [ "${#DISPATCHED[@]}" -eq 0 ]; then
        echo "  Nothing to publish."
        return
    fi

    echo "  Waiting..."

    sleep 10

    local failed=0

    for workflow in "${DISPATCHED[@]}"; do

        id=$(
            gh run list \
                --workflow="publish-$workflow.yml" \
                --limit 1 \
                --json databaseId \
                --jq '.[0].databaseId'
        )

        gh run watch "$id"

        conclusion=$(
            gh run view "$id" \
                --json conclusion \
                --jq .conclusion
        )

        printf '  %-24s %s\n' "$workflow" "$conclusion"

        if [ "$conclusion" != "success" ]; then
            failed=1
        fi
    done

    DISPATCHED=()

    if [ "$failed" -ne 0 ]; then
        echo
        echo "A workflow failed."
        echo "Fix the issue and rerun this script."
        exit 1
    fi
}

###############################################################################
# Tier 1
###############################################################################

echo "=== Tier 1 ==="

dispatch_npm extension-api
dispatch_npm switchboard
dispatch_npm generator-zobi

wait_tier

###############################################################################
# Tier 2
###############################################################################

echo
echo "=== Tier 2 ==="

dispatch_npm core

wait_tier

###############################################################################
# Tier 3
###############################################################################

echo
echo "=== Tier 3 ==="

dispatch_npm chart-controls

wait_tier

###############################################################################
# Tier 4
###############################################################################

echo
echo "=== Tier 4 ==="

for plugin in $PLUGINS; do
    dispatch_npm "$plugin"
done

dispatch_npm embedded-sdk

wait_tier

###############################################################################
# PyPI
###############################################################################

echo
echo "=== PyPI ==="

dispatch_pypi pypi-zobi-core zobi-core
dispatch_pypi pypi-extensions-cli zobi-extensions-cli

wait_tier

echo
echo "🎉 Release complete."
echo
echo "Remember to commit the repository version bumps."