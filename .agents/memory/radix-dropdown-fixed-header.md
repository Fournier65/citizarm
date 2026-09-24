---
name: Radix dropdowns in fixed headers
description: Why opening and closing a dropdown can move a fixed header or leave a visual effect after a click.
---

For lightweight dropdowns in fixed headers, check both scroll locking while open and trigger styling after an item is selected.

**Why:** Radix's modal dropdown behavior locks body scrolling; removing a conventional scrollbar can shift a fixed header. After selection, Radix restores focus to the trigger, which can match `:focus-visible` even following a pointer click. A focus ring or background may therefore remain after the menu closes.

**How to apply:** When the menu does not need modal scroll locking, consider non-modal behavior and verify header position before/after opening. Check the trigger after the closing animation and after moving the pointer away, in both themes. Preserve a usable keyboard interaction rather than assuming hover-only tests catch focus styling.