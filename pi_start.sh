#!/bin/bash

set -euo pipefail

USER_DIR="/home/simonmclean"
PROJECT_DIR="$USER_DIR/departures"
GIT_BIN="/usr/bin/git"
NODE_BIN="$USER_DIR/.nvm/versions/node/v24.10.0/bin/node"
NPM_BIN="$USER_DIR/.nvm/versions/node/v24.10.0/bin/npm"

cd "$PROJECT_DIR"

sleep 10

# Update project
$GIT_BIN fetch --all --prune
$GIT_BIN reset --hard
$GIT_BIN pull

# Build and run
"$NPM_BIN" run build
"$NODE_BIN" "$PROJECT_DIR/dist/index.js" &
