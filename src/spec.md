# Specification

## Summary
**Goal:** Fix the app getting stuck on an infinite “Initializing…” screen after deployment by making initialization failures and timeouts reliably transition to a recovery screen.

**Planned changes:**
- Make actor initialization time out reliably after 30 seconds (without the timer being reset by rerenders) and transition to the existing InitializationFailureScreen with a timeout error message.
- Surface actor creation/initialization errors immediately (rejected promises, agent errors, traps) by capturing and displaying them on InitializationFailureScreen instead of remaining on “Initializing…”.
- Handle missing/empty admin token safely by skipping secret-based access-control initialization when no `caffeineAdminToken` is present.
- Ensure InitializationFailureScreen provides an actionable recovery path: show an English error summary + underlying error message, support “Retry Initialization”, and support “Clear Local Data & Retry” using the existing clearLocalAppData flow.

**User-visible outcome:** If initialization fails or takes too long, users are no longer stuck on an infinite spinner; they see a clear failure screen with an error message and can retry or clear local data and retry to reach login or the main app flow.
