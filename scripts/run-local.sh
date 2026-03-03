#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-8080}"
HOST="${HOST:-127.0.0.1}"

cd "$ROOT_DIR"

echo "Serving ./public at http://${HOST}:${PORT}"
echo "Press Ctrl+C to stop."

if command -v npx >/dev/null 2>&1; then
  exec npx --yes http-server public -a "$HOST" -p "$PORT" -c-1
fi

echo "Error: No supported runtime found." >&2
echo "Install one of the following and retry:" >&2
echo "  - Python 3 (python3)" >&2
echo "  - Node.js + npx" >&2
exit 1
