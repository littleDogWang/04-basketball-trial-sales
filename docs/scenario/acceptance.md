# Parent trial follow-up acceptance

- The initial Dialog identifies scenario 04, the existing inquiry, the parent's role, and the intended result. Identity remains visible after closing it on desktop/mobile.
- The agent uses actual lead context and does not repeat known details unnecessarily.
- Age eligibility, experience, goals, preferences and submission agreement are checked before an eligible trial request.
- A received request has a stable ID and exact configured course/time; it is shown as awaiting advisor confirmation. Repeating the same submission preserves its ID.
- No-request outcomes are saved: follow-up needed (with agreement), not interested, not eligible, do not contact, wrong contact, incomplete.
- Child experience and goals remain in the saved result and are visible to the next advisor.
- Reloading and a new Node.js process can retrieve the same result. Ending cannot downgrade a received request or manufacture missing answers.
- Save failures remain failures; a corrupt store is not silently replaced. Request and result writes are atomic.
- History can reopen earlier results for the original lead.
- Missing cloud callback configuration prevents voice startup; local UI/API acceptance must be distinguished from live voice/tool invocation.

Run `pnpm run verify` (including `test:follow-up`). Screenshots and synthetic acceptance records stay local and are not business-conversion evidence.
