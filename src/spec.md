# Specification

## Summary
**Goal:** Add a mobile-friendly Settings control in the Session sidebar header to adjust overall UI scale by percentage, persist the preference, and apply it across the entire Session page layout.

**Planned changes:**
- Add a Settings button in the Session sidebar header row (same area as the existing collapse/expand control) that opens a popover/dialog with a percentage-based UI scale control.
- Persist the selected UI scale percentage in localStorage (preferences) and restore/apply it automatically on app load (default 100% when unset).
- Apply the chosen scale across the whole Session UI (sidebar, header, chat, inputs) with immediate feedback, bounded min/max values, and without breaking scrolling/overflow or access to key controls on mobile.

**User-visible outcome:** Users can open Settings from the Session sidebar header on mobile, adjust the app’s UI size by percentage, and have that preference remembered and applied automatically on future visits.
