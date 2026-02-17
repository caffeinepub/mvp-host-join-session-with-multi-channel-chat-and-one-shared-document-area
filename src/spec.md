# Specification

## Summary
**Goal:** Enhance the existing document preview so it can display a few additional lightweight markup patterns (centering, sizing, spoiler reveal, underline) without changing stored document text.

**Planned changes:**
- Extend `DocumentContentPreview` rendering to recognize line-based prefixes: `[C] ` (center), `[B] ` (large), `# ` (extra-large heading), and `-# ` (extra-small).
- Add inline parsing for `||spoiler||` segments that are hidden by default and reveal on click/tap with keyboard-accessible interaction.
- Add inline parsing for `__underlined__` so only the wrapped text is underlined (including cases like `- __text__`), while preserving surrounding characters.
- Ensure the new markup rendering works anywhere preview text appears, including when mixed with existing `[FILE:id:name]` markers, and keep file marker rendering behavior unchanged.

**User-visible outcome:** When viewing documents in the main session preview panel (and anywhere else `DocumentContentPreview` is used), users can type the specified patterns and immediately see centered/bigger/smaller/heading text, clickable spoilers, and underlined segments in preview—while the saved text remains exactly what they typed.
