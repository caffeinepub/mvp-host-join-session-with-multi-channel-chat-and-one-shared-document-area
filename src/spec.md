# Specification

## Summary
**Goal:** Add a “PLAYERS' DOCUMENTS” section to the session sidebar, enable opening player-owned documents in the main panel, and add a per-document privacy toggle that hides documents from other session members.

**Planned changes:**
- Add a new sidebar section labeled “PLAYERS' DOCUMENTS” below the existing “Documents” section, listing player documents for the active session and allowing selection.
- Update Session page navigation/state to support selecting and rendering a player document in the main panel using the existing `PlayerDocumentEditorView`.
- Add an owner-only “Private” (or “Hide from others”) toggle for each player document and wire it to a backend update so the UI reflects the current privacy state.
- Enforce privacy on the backend so private player documents are excluded from non-owner list results and cannot be fetched/edited by non-owners.

**User-visible outcome:** Session members see a new “PLAYERS' DOCUMENTS” sidebar section; selecting an item opens that player document in the main panel. Document owners can toggle a document as Private/Hidden so other members no longer see or can open it; when not private, other members can access it according to existing permissions.
