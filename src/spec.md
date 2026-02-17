# Specification

## Summary
**Goal:** Restore reliable app startup after deployment and make the channel chat usable on mobile with constrained scrolling and an auto-scroll toggle.

**Planned changes:**
- Fix the post-deployment initialization/runtime error that leaves the app stuck on the “Initializing…” screen, ensuring the Lobby/Session UI renders and initialization failures surface via the existing recoverable error boundary.
- Update the channel chat layout for mobile so it fits the phone viewport height, prevents unintended page-level scrolling, and restricts scrolling to the messages list (vertical only, no horizontal scroll), with the input anchored at the bottom.
- Add an auto-scroll-to-bottom toggle near the message input (with an English label/tooltip and accessible aria-label).
- When auto-scroll is ON, scroll to the newest message after send/receive and after switching channels; when OFF, preserve the user’s current scroll position as new messages arrive.
- Ensure the layout/scroll behavior and toggle work consistently across all channel types (including member channels) without breaking existing channel selection or channel management flows.

**User-visible outcome:** The deployed app loads past “Initializing…” into the Lobby/Session UI, and on mobile the chat stays fixed to the screen with only the message list scrolling; users can toggle auto-scroll near the input to avoid being forced to the bottom while reading older messages.
