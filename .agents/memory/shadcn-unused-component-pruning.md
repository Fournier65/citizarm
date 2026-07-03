---
name: Pruning unused shadcn/ui components
description: How to safely identify and remove unused shadcn/ui components and their backing npm packages when reducing JS bundle size.
---

When asked to reduce unused JS in a fullstack-js template project, the
`client/src/components/ui/` folder (shadcn/ui) often contains many
components that were scaffolded but never actually used by any page.

**Rule:** Before deleting a ui component, check the full dependency
chain, not just direct imports from pages. Some "unused" components are
only imported by *other* unused components (e.g. `sidebar.tsx` pulls in
`input.tsx`, `separator.tsx`, `sheet.tsx`; `command.tsx` pulls in
`dialog.tsx`; `form.tsx` pulls in `label.tsx`). Grep for
`components/ui/X"` across the whole client, excluding the component's
own file, to find its real usage. Do this for every ui file before
deleting, then re-check the survivors don't only exist to support a
component you're about to delete.

**Why:** Deleting only the components with zero *direct* external
references can miss chains, and deleting only components with zero
references at all (including from other unused components) risks
leaving orphaned files if done in the wrong order. A two-pass check
(direct usage, then re-check chains among candidates) avoids both
under- and over-deletion.

**How to apply:** After deleting unused ui components, also check which
npm packages exclusively backed those components (e.g. `cmdk` for
`command.tsx`, `vaul` for `drawer.tsx`, `embla-carousel-react` for
`carousel.tsx`, `react-day-picker` for `calendar.tsx`, `input-otp`,
`react-resizable-panels` for `resizable.tsx`) and uninstall them via the
package manager tool (never hand-edit `package.json`) if nothing else
in the project imports them.
