#!/bin/bash

PROJECT_DIR="/home/simonmclean/departures"

# Exit immediately if any command fails
set -e

cd "$PROJECT_DIR"

git fetch
git reset --hard
git pull

npm run build

node "$PROJECT_DIR/dist/index.js" >> "$PROJECT_DIR/log.txt" 2>&1 &
