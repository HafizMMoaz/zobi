#!/bin/bash
rootDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

lernaVersionArg="$1"
if [[ -z $lernaVersionArg ]]; then
  echo '[ERROR] Please provide argument for "lerna version".'
  exit 1
fi

currentNpm=$(npm --version)
npmVersion=$(node -e "process.stdout.write(require('./package.json').engines.npm)");
isSatisfiedNpm=$(node -e "process.stdout.write(require('semver').satisfies('$currentNpm', '$npmVersion').toString())");

currentNode=$(node --version)
nodeVersion=$(node -e "process.stdout.write(require('./package.json').engines.node)");
isSatisfiedNode=$(node -e "process.stdout.write(require('semver').satisfies('$currentNode', '$nodeVersion').toString())");

# Check node version compatible with package.json
if [[ $isSatisfiedNode != 'true' ]]; then
  echo "[ERROR] Your node version($currentNode) is not compatible with package.json($nodeVersion)"
  exit 1
fi

# Check npm version compatible with package.json
if [[ $isSatisfiedNpm != 'true' ]]; then
  echo "[ERROR] Your npm version($currentNpm) is not compatible with package.json($npmVersion)"
  exit 1
fi

# Ignore Lerna's tag and push
lerna version $1 --no-push --no-git-tag-version --yes

if [[ -z $(git diff --stat) ]]; then
  echo '[ERROR] No changed packages to version.'
  exit 1
fi

# Get the current tag version
tag=v$(node -e "process.stdout.write(require('./lerna.json').version)");
message="chore(plugins): publish $tag"

if [[ $? -ne 0 ]]; then
  echo '[ERROR] Can not update package-lock.json'
  exit 1
fi

# Auto-tag and auto-commit like usual
git commit --all -m "${message}"
git tag -a ${tag} -m ${tag}
git push origin ${tag}
git push
