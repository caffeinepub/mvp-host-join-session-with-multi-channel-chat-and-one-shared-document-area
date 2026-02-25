# Specification

## Summary
**Goal:** Build a full CommunityPage with banner, stats bar, tabs, post feed, and host edit controls, navigable from the Communities Hub via the "Open" button on a CommunityCard.

**Planned changes:**
- Clicking "Open" on a CommunityCard navigates to that community's dedicated CommunityPage, with a back button returning to the hub
- Build a CommunityPage with a full-width banner showing the community's banner image (or cosmic gradient fallback), community name in large bold text, and tagline/description
- Add a stats bar below the banner showing member count with a people icon, styled in dark cosmic theme
- Add a horizontally scrollable tab bar with six tabs: Home, Chat, Lore, Polls, Quizzes, Rules; tab reordering via drag-and-drop is host-only (or per-member if host grants permission); tab order persisted in backend
- Implement the Home tab with a post composer (text + optional image upload) and a reverse-chronological post feed; posts stored in backend per community
- Implement Chat tab as a "Coming Soon" placeholder styled to match the dark cosmic theme
- Implement Lore, Polls, Quizzes, and Rules tabs as styled placeholder content areas
- Add a host-only edit/settings icon button on the community page opening a controls panel for: uploading/changing banner image, changing primary and accent colors, changing community font, toggling layout options; all changes persisted to backend
- Add a host-only member permissions panel (within host controls) listing members with per-member toggles for tab reorder permission; persisted to backend
- Extend backend data model with CommunityPost type (id, communityId, authorPrincipal, authorName, text, optional image, timestamp), tab order per community, and per-member tab reorder permissions; add backend functions to create/list posts, update tab order, and update member permissions

**User-visible outcome:** Users can open any community from the hub and view its dedicated page with a cosmic banner, member stats, navigable tabs, and a working post feed on the Home tab. The host can customize the community page appearance and manage member tab-reorder permissions from within the community page.
