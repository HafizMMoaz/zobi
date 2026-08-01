#!/usr/bin/env bash

set -euo pipefail

# Ensure this script is run as root
if [[ ${EUID} -ne 0 ]]; then
  echo "This script must be run as root" >&2
  exit 1
fi

# Check for required arguments
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <package1> [<package2> ...]" >&2
  exit 1
fi

# Colors for better logging (optional)
GREEN='\033[0;32m'
RED='\033[0;31m'
RESET='\033[0m'

# Install packages with clean-up
echo -e "${GREEN}Updating package lists...${RESET}"
apt-get update -qq

echo -e "${GREEN}Installing packages: $@${RESET}"
apt-get install -yqq --no-install-recommends "$@"

echo -e "${GREEN}Autoremoving unnecessary packages...${RESET}"
apt-get autoremove -yqq --purge

echo -e "${GREEN}Cleaning up package cache and metadata...${RESET}"
apt-get clean
rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*

echo -e "${GREEN}Installation and cleanup complete.${RESET}"
