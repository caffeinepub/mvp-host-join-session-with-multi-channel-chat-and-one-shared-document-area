# Specification

## Summary
**Goal:** Expand the UI scale setting to support a wider range from 10% to 200% while keeping all UI scale values safely within that range.

**Planned changes:**
- Update the UI scale slider to use a 10% minimum and 200% maximum, and clamp slider-driven updates to 10–200.
- Update UI scale preset buttons so all preset values fall within 10–200 and cover small/normal/large options; selecting a preset updates both the stored value and the slider position.
- Clamp persisted `uiScale` on preference load and on save/update so out-of-range values from localStorage cannot be applied to `--ui-scale`.

**User-visible outcome:** The UI scale settings popover allows scaling the UI from 10% up to 200% (via slider or presets), and the app will never apply a UI scale outside that range—even if an invalid value was previously stored.
