---
name: Radix toast verification
description: Avoid ambiguous browser assertions caused by Radix's hidden live announcements.
---

Scope toast text assertions to the visible notification region rather than using page-wide text matching.

**Why:** Radix also creates a hidden ARIA-live announcement with the toast's text. Its insertion timing makes page-wide text locators intermittently match two elements, even when only one notification is visible.

**How to apply:** Target the accessible notification region before finding toast descriptions. Keep the screen-reader announcements intact; do not remove accessibility behavior to make browser tests pass.
