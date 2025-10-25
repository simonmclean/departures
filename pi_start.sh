#!/bin/bash

set -euo pipefail

USER_DIR="/home/simonmclean"
PROJECT_DIR="$USER_DIR/departures"
GIT_BIN="/usr/bin/git"
NODE_BIN="$USER_DIR/.nvm/versions/node/v24.10.0/bin/node"
NPM_BIN="$USER_DIR/.nvm/versions/node/v24.10.0/bin/npm"

# Log everything from this script
exec >> "$PROJECT_DIR/cron.log" 2>&1
echo "---- $(date) boot job start ----"

export PATH="$NODE_DIR:$PATH"

cd "$PROJECT_DIR"

sleep 10

# Update project
$GIT_BIN fetch --all --prune
$GIT_BIN reset --hard
$GIT_BIN pull

# Build and run
npm install
npm run build
node "$PROJECT_DIR/dist/index.js" &
