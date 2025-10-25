#!/bin/bash

set -euo pipefail

USER_HOME="/home/simonmclean"
PROJECT_DIR="$USER_HOME/departures"
GIT_BIN="/usr/bin/git"

# Uncomment these lines for logging and troubleshooting
# exec >> "$PROJECT_DIR/cron.log" 2>&1
# echo "---- $(date) boot job start ----"

export NVM_DIR="$USER_HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$PROJECT_DIR"

sleep 10

nvm use 24 1> /dev/null

# Update project
$GIT_BIN fetch --all --prune
$GIT_BIN reset --hard
$GIT_BIN pull

# Build and run
npm install
npm run build
node "$PROJECT_DIR/dist/index.js" &
