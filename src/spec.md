# Specification

## Summary
**Goal:** Make theme/preferences changes apply immediately across the app and add user profile pictures that can be managed in Settings and shown in chat.

**Planned changes:**
- Fix Dark Mode so toggling applies instantly, persists across reloads, and is consistent on all screens (login, lobby, settings, session).
- Ensure there is a single reactive preferences source so Settings/Pre‑Lobby changes (theme, background image, nickname, template) update the running UI immediately without refresh.
- Add profile picture management in Settings (preview, upload, remove) with validation (image-only, reasonable size limits) and persistent storage.
- Extend backend user profile model/APIs to store/serve optional profile pictures (including migration if needed) and provide endpoints for caller and other users as required for in-session display.
- Display avatars next to chat message authors with a placeholder fallback (e.g., initials) and performant fetching/caching.

**User-visible outcome:** Users can change Dark Mode and other preferences and see updates immediately throughout the app without reloading, can upload/remove a profile picture in Settings that persists across sessions, and will see avatars shown alongside chat messages (with sensible fallbacks).
