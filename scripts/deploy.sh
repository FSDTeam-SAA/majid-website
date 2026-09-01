#!/usr/bin/env bash

set -euo pipefail

# Source user profile/nvm if available (needed for non-interactive SSH sessions)
if [ -f "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
fi
if [ -f "$HOME/.profile" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.profile"
fi
if [ -f "$HOME/.bashrc" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.bashrc"
fi

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$APP_ROOT"

echo "[majid-website] Installing dependencies"
npm ci

echo "[majid-website] Building app"
npm run build

echo "[majid-website] Restarting PM2 process"
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "[majid-website] Deployment finished"

