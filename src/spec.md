# Specification

## Summary
**Goal:** Make the Session page header fully visible on mobile (no clipping/overflow) while reducing its height to free vertical space for more chat messages.

**Planned changes:**
- Adjust only the SessionPage `<header>` (frontend/src/pages/SessionPage.tsx) layout/markup/styles so all header controls and labels fit within narrow phone widths without horizontal overflow or cut-off.
- Reduce header vertical footprint on mobile by tightening spacing/typography (e.g., padding, gaps, font sizes, wrapping) without modifying the chat component.

**User-visible outcome:** On mobile, the Session header shows all controls (Leave, session info/host label, Documents/Player Documents, members count, logout) fully on-screen with no horizontal scrolling, and the chat area displays roughly ~3 more messages due to a shorter header.
