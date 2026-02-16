# Specification

## Summary
**Goal:** Add an Edit/Preview toggle to the session document editor so users can read documents with inline-rendered uploaded files without changing existing editing, upload, or save behavior.

**Planned changes:**
- Add a visible toggle control in `DocumentEditorView` labeled “Preview” and “Edit” to switch between the existing editable textarea and a read-only preview panel.
- Implement a minimal preview renderer that parses file markers in the form `[FILE:<id>:<filename>]`, preserving multiline text and rendering content in reading order (text segments interleaved with file elements).
- In Preview mode, resolve file markers using the existing `documentFiles` list / existing fileMap lookup and render:
  - Images (mimeType starts with `image/`) as inline images using `file.getDirectURL()` sized to fit the editor width (contain behavior).
  - Non-image files as an attachment row showing filename plus an “Open file” action that opens/downloads the direct URL.
  - Missing file references as an inline placeholder such as `File not found: <filename>`.
- Keep the preview area scrollable within the editor panel; keep all changes scoped to `DocumentEditorView` only with no backend changes and no new third-party libraries.

**User-visible outcome:** Users can toggle between editing the raw document text (including `[FILE:...]` markers) and a scrollable Preview that shows the formatted text with inline images/attachments rendered at the marker locations.
