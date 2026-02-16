# Specification

## Summary
**Goal:** Replace host Documents and sidebar Player Documents navigation with Members' Channels, enforce player document privacy, and fix the app getting stuck on “Initializing...” after login.

**Planned changes:**
- Remove the host-owned “Documents” feature from the UI (sidebar section, document CRUD/lock controls, and the host document editor route/view).
- Add “Members' Channels” as a new session feature, separate from host-managed “Channels,” with list + selectable chat behavior.
- Implement backend APIs/storage for Members' Channels (list/create/rename/delete) independent from existing host Channels.
- Enforce Members' Channels permissions: any session member can create; creator can rename/delete their own; host can rename/delete any; only session members can access/list them.
- Remove the “Players' Documents” sidebar section and replace it with “Members' Channels” navigation (no broken imports/references).
- Add a per-player-document privacy toggle (“Private” or “Hide from others”) in the player document UI; only the document owner can change it; state persists and reflects after refresh/refetch.
- Enforce player document privacy on the backend so private player docs are not listed/fetchable/editable by non-authorized members (owner, and host only if that policy is chosen).
- Fix the post-login initialization flow so authenticated users reliably leave “Initializing...”; show a recoverable error state on init failure; ensure normal login lands on Lobby and restored session lands on Session.

**User-visible outcome:** The Session UI no longer includes host Documents; members can create and use Members’ Channels chat alongside host Channels; player documents can be marked Private to hide them from other members; and the app no longer hangs on “Initializing...” after login.
