# Specification

## Summary
**Goal:** Add modern chat message bubbles with left/right alignment and a long-press “reply to message” workflow, including persisted reply metadata and reply rendering styled to match the provided screenshots.

**Planned changes:**
- Update chat message rendering to use left/right aligned rounded bubbles: current user messages on the right, other members on the left, while preserving existing author/timestamp display and roll/image rendering.
- Add long-press on a message bubble to select it as a reply target (React DOM events only), without interfering with existing click behavior (e.g., opening images).
- Show a compact reply preview above the message input when a reply target is selected: label “You replied”, a 1–2 line truncated quote of the original message, and an X control to cancel.
- Persist replies end-to-end by extending the backend Message with optional `replyToId`, updating message creation and message listing to include it, and updating frontend send/upload flows to pass `replyToId` when set; clear reply state after a successful send.
- Render reply styling for messages with `replyToId` by showing a purple rounded “Replay message” indicator bubble above and visually attached to the main bubble, with a truncated original-message snippet; indicator is clickable/tappable with no navigation behavior required.
- Apply a cohesive dark chat theme consistent with the screenshots (dark background, spacing, typography) limited to the chat view.

**User-visible outcome:** In chat, messages appear in left/right bubbles based on author, users can long-press a message to reply, see and cancel a reply preview above the input, send replies that remember the referenced message, and view replies with a purple “Replay message” indicator matching the screenshot style.
