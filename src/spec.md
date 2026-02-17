# Specification

## Summary
**Goal:** Let users quickly and locally change their chat display name and avatar via a new sidebar “Quick profile” button, and apply those changes to their outgoing messages.

**Planned changes:**
- Add a new 👨🏻‍🦱-style icon button to the Session sidebar header top control row (inside the existing sidebar header container) without replacing existing UI scale and collapse/expand controls; include English tooltip and aria-label; only show when sidebar is expanded.
- Implement an in-app dialog/popover opened by the new button with: display name text input, profile picture picker with preview, and Save/Cancel/Clear actions (English text only).
- Persist the quick profile (name + avatar image) to localStorage, load it on app start/session entry, and handle missing/invalid/unavailable storage gracefully.
- Apply the stored quick profile to the chat UI/behavior: use the quick display name for newly posted outgoing messages and render the current user’s message avatar using the locally-stored picture when set (without affecting other users).

**User-visible outcome:** When the sidebar is expanded, users can click a new “Quick profile” button to set (or clear) a locally saved chat name and avatar; their new outgoing messages use that name and their messages show the chosen avatar, surviving page reloads on the same device/browser.
