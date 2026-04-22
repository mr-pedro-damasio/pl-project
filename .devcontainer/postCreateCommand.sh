#!/usr/bin/env bash
set -euo pipefail

# Keep git happy when the workspace is mounted from the host.
git config --global --add safe.directory "$(pwd)"

# Install Claude Code CLI
curl -fsSL https://claude.ai/install.sh | bash

# Ensure the official Claude plugin marketplace is configured.
# Ignore "already exists" style errors.
claude plugins marketplace add anthropics/claude-plugins-official --scope user || true
claude plugins marketplace update claude-plugins-official || true

# Install required plugin from the explicit marketplace.
claude plugins install ralph-loop@claude-plugins-official

# Register the GitHub Copilot MCP server (requires GITHUB_TOKEN, available in Codespaces).
if [ -n "${GITHUB_TOKEN:-}" ]; then
  claude mcp add \
    --transport http \
    --header "Authorization: Bearer ${GITHUB_TOKEN}" \
    --scope project \
    github-copilot https://api.githubcopilot.com/mcp || true
else
  echo "GITHUB_TOKEN not set — skipping GitHub Copilot MCP registration."
fi

echo "Dev container is ready."
