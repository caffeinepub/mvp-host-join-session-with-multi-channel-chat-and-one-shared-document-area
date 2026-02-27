# Specification

## Summary
**Goal:** Build out the full Community Page experience within the Communities tab, including a banner, stats, reorderable tabs, a live Home post feed, and placeholder content for all other tabs.

**Planned changes:**
- Add backend data types: `CommunityPost`, `CommunityTabOrder`, `CommunityTabPermissions`, and extend the `Community` type with `bannerBlob`, `bannerColor`, `bannerFont`, and `accentColor`
- Add backend canister methods: `createPost`, `getPosts`, `updateBannerSettings` (host-only), `updateTabOrder` (host or permitted member), `grantTabReorderPermission` (host-only), `revokeTabReorderPermission` (host-only), `getTabPermissions`, and `getTabOrder`
- Wire the "Open" button on `CommunityCard` to navigate into a new `CommunityPage` component rendered inside the Communities tab
- Preserve the active community ID in React state/context so returning to the Communities tab restores the open community page
- Build `CommunityPage` with a full-width banner (image or solid-color fallback), community name, host-only "Edit Banner" control, a stats bar (member count, post count), and a horizontal tab bar (Home, Chat, Lore, Polls, Quizzes, Rules)
- Implement host-only banner customization modal/editor: upload banner image (stored on-chain), pick background color, select title font (4+ presets), pick accent color; saved via `updateBannerSettings`
- Implement draggable/reorderable tabs for the host (and members granted permission); tab order persisted on-chain; non-permitted members see static tabs; host can grant/revoke reorder permission per principal from within the community page
- Implement the Home tab: authenticated post creation form (text + optional image stored on-chain), feed of all community posts showing author, content, image, and timestamp fetched via `getPosts`; unauthenticated users see a login prompt
- Implement the Chat tab as a greyed-out non-functional mockup (chat bubbles, input bar) with a "Coming Soon" overlay
- Implement styled "Coming Soon" placeholder layouts for Lore, Polls, Quizzes, and Rules tabs, using the community's accent color and font
- Scope all changes strictly to the Communities tab feature area; no other files or components are modified

**User-visible outcome:** Users can open a community page from the Communities tab, view and customize the banner (host), reorder tabs (host or permitted members), create and browse posts in the Home tab, and see placeholder UIs for Chat, Lore, Polls, Quizzes, and Rules — with all state preserved when navigating away and back to the Communities tab.
