---
name: Selective GitHub pushes
description: Avoid accidentally publishing uploaded attachments after a selective remote push and local checkpoint divergence.
---

When a remote receives only a reviewed subset of local changes, do not assume the local main branch can later be pushed normally. Check its relationship to the remote and inspect which files a push would include, especially attachments created by automatic checkpoints.

**Why:** Automatic local checkpoints may commit user-uploaded images separately. A selective push from a clean temporary branch leaves local main diverged; naively merging or pushing later can bring those attachments into the remote history.

**How to apply:** Before the next user-authorized push, inspect both sides of the history and the path diff. If reconciliation is needed, explain the consequences, keep a local backup branch, and stage only reviewed files on top of the remote. Verify the result is fast-forwardable and excludes sensitive attachments. Never push without the user's explicit instruction for that push.