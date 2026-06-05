#!/bin/bash
set -euo pipefail

echo '{"async": true, "asyncTimeout": 300000}'

# Install Node.js dependencies
npm install

# Install notebooklm-py and deploy the Claude Code skill
pip install "notebooklm-py[browser]" --quiet
notebooklm skill install

# If NOTEBOOKLM_AUTH_JSON is set, write it to the default profile storage
# so notebooklm commands work without re-authentication each session
if [ -n "${NOTEBOOKLM_AUTH_JSON:-}" ]; then
  STORAGE_DIR="$HOME/.notebooklm/profiles/default"
  mkdir -p "$STORAGE_DIR"
  echo "$NOTEBOOKLM_AUTH_JSON" > "$STORAGE_DIR/storage_state.json"
  echo "notebooklm: auth written from NOTEBOOKLM_AUTH_JSON"
fi
