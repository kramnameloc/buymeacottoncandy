#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-4321}"
HOST="${HOST:-127.0.0.1}"

cd "$ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required to run Astro locally." >&2
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Serving Astro dev server at http://${HOST}:${PORT}"
echo "Press Ctrl+C to stop."

exec npm run dev -- --host "$HOST" --port "$PORT"
