---
name: OVH PostgreSQL cutover
description: User-verified outcome and lasting boundary between a one-time external data cutover and future schema changes.
---

Keep the one-time Replit-to-OVH data transfer separate from future schema updates. Do not rerun the initial import as a routine deployment step. The user confirmed that both live newsletter subscription and contact submission returned success after the cutover.

**Why:** The external OVH deployment initially had a running PostgreSQL database without application tables, while the app's password-containing URI was invalid when the password contained a URL-reserved character. Explicit initialization, data transfer, and separate connection settings resolved the reported form failures.

**How to apply:** For later changes to the OVH database, plan reviewed, explicit migrations against that external target and verify live behavior afterward. Follow the project's deployment documentation for the actual procedure; do not assume Replit's Publish database flow or the one-time import maintains OVH.

Keep a deployment-maintained, convenient copy of CitiZarm's migration launcher directly in the application's server folder, not at the Ubuntu user's home root.

**Why:** The user clarified that the aim was to retain the simple human-facing command while moving the copy into CitiZarm's folder, not to remove the convenient copy altogether.

**How to apply:** Preserve both the convenient application-specific copy and its refresh at deployment; do not replace it solely with an invocation of the nested source script or introduce a common launcher for multiple apps.

Document one current deployment procedure, without legacy installation variants or obsolete launcher locations.

**Why:** The user explicitly asked to remove notions of an old installation to avoid confusion for humans and the AI adapting the guide to another app.

**How to apply:** Keep historical context out of the deployment guide while retaining necessary safety checks for existing resources and the distinction between initial data import and later schema migrations.