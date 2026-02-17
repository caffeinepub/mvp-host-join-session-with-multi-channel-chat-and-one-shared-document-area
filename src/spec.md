# Specification

## Summary
**Goal:** Let users remove communities from the “My Communities” section and keep those removals after reload.

**Planned changes:**
- Add a clear, accessible remove action on each “My Communities” card that does not interfere with the existing “Open” button.
- Add an English confirmation step before removing a community from “My Communities”.
- Persist removed communities locally (e.g., localStorage) so they stay removed after refresh, and restore defaults when local persistence is cleared.
- Ensure removal only affects “My Communities” and does not change the “Discover” section.

**User-visible outcome:** Users can remove communities from “My Communities” with a confirmation prompt, and removed items remain hidden after reloading the app while “Discover” stays unchanged.
