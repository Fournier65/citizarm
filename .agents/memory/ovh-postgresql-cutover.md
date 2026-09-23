---
name: OVH PostgreSQL cutover
description: User-verified outcome and lasting boundary between a one-time external data cutover and future schema changes.
---

Keep the one-time Replit-to-OVH data transfer separate from future schema updates. Do not rerun the initial import as a routine deployment step. The user confirmed that both live newsletter subscription and contact submission returned success after the cutover.

**Why:** The external OVH deployment initially had a running PostgreSQL database without application tables, while the app's password-containing URI was invalid when the password contained a URL-reserved character. Explicit initialization, data transfer, and separate connection settings resolved the reported form failures.

**How to apply:** For later changes to the OVH database, plan reviewed, explicit migrations against that external target and verify live behavior afterward. Follow the project's deployment documentation for the actual procedure; do not assume Replit's Publish database flow or the one-time import maintains OVH.