---
name: Replit internal npm registry breaks external Docker builds
description: package-lock.json can capture Replit's internal npm proxy URL, which fails when building outside the Replit sandbox (e.g. on a self-hosted server via CI/CD).
---

Replit's sandbox forces all npm installs through an internal proxy (`http://package-firewall.replit.local/npm/`) via `NPM_CONFIG_REGISTRY`/`npm_config_registry` env vars. When a package is installed inside Replit, `package-lock.json` records `resolved` URLs pointing at that internal host.

**Why this matters:** if the project deploys elsewhere (e.g. a self-managed server building the Docker image via CI/CD), `npm ci` on that server cannot resolve `package-firewall.replit.local` (DNS only exists inside Replit) and the build fails with `ENOTFOUND`. If the deploy script doesn't fail loudly (no `set -e` in a multi-line SSH/CI script), the build failure is swallowed and the old code keeps running — CI shows "success" while production is stale.

**How to apply:** after installing any package in Replit for a project that self-deploys outside Replit, check `package-lock.json` for `package-firewall.replit.local` references (`grep -c` for it). If found, rewrite the `resolved` field host to `https://registry.npmjs.org/` (integrity hashes are unchanged since it's the same registry content, just proxied) — do NOT re-run `npm ci`/`npm install` in the Replit sandbox afterward, as that re-applies the internal proxy and reverts the fix. Also ensure external deploy scripts use `set -e` (or equivalent) so a failed build/pull surfaces as a failed CI run instead of silently keeping stale code live.
