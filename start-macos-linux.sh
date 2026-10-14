#!/bin/sh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo 'Install Node.js 18 or later from https://nodejs.org/'
  exit 1
fi
exec node server.mjs
