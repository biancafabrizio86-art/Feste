#!/bin/bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

# Install Node.js dependencies
npm install

# Install notebooklm-py and deploy the Claude Code skill
pip install "notebooklm-py[browser]" --quiet
notebooklm skill install
