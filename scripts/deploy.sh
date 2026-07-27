#!/usr/bin/env bash

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$APP_ROOT"

echo "[majid-website] Installing dependencies"
yarn install --frozen-lockfile

echo "[majid-website] Building app"
yarn build

echo "[majid-website] Restarting PM2 process"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "[majid-website] Deployment finished"
