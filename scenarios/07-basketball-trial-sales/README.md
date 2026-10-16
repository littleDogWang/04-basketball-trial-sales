# 07 Parent trial follow-up

Follow up with an existing parent inquiry, qualify interest, and submit a trial request only with agreement. Every session has a durable result, including declines, callback needs, and incomplete conversations. This Web/RTC experience uses Alex Morgan, a fictional parent, and fixed basketball courses.

See [design](design.md) and [acceptance](acceptance.md). Course configuration lives in `courses.json`; sample lead context lives in `leads.ts`. `results.ts` writes one atomic JSON file per session under `.scenario-data/07-basketball-trial-sales`, or `TOP_TEN_DATA_DIR/07-basketball-trial-sales`. A received trial request and its follow-up result are written together. `request_received` does not reserve a seat or confirm a booking.

The home page shows the original inquiry, selected result, and advisor-readable history. Refresh/restart preserves results when the data directory persists. Cloud agent tools require `TOP_TEN_SCENARIO_TOOL_BASE_URL` to point at this app on a cloud-reachable URL; localhost is insufficient for cloud callbacks. Voice start remains available without a callback URL; spoken answers and requests cannot be saved in that mode.

## Routes

- `POST /api/scenarios/07-basketball-trial-sales/sessions`: `{ lead_id: "PARENT-1042" }` creates an incomplete result.
- `GET /api/scenarios/07-basketball-trial-sales/sessions/:sessionId`: retrieve one saved result.
- `POST /api/scenarios/07-basketball-trial-sales/sessions/:sessionId`: idempotently end without overwriting the saved outcome.
- `GET /api/scenarios/07-basketball-trial-sales/results?lead_id=PARENT-1042`: list results and local tool configuration availability.
- `POST /api/scenarios/07-basketball-trial-sales/results?session_id=:id`: save known context or a supported non-request outcome.
- `GET /api/scenarios/07-basketball-trial-sales/courses?child_age=9`: configured eligible courses and times.
- `POST /api/scenarios/07-basketball-trial-sales/requests?session_id=:id`: `{ course_id, preferred_time, contact?, consent: true, summary }`; requires previously saved experience, goals and time preferences. Repeating the same received request returns its original ID. A different request conflicts.

Result writes accept `outcome`, `child_age`, `experience`, `goals`, `preferred_times`, `contact`, `reason`, `summary`, `next_action`, `callback_at`, and `follow_up_consent`. Tool-interpolated numeric/boolean strings are normalized strictly. Blank strings and age zero preserve known details. Follow-up requires agreement, reason and a next action. Terminal outcomes cannot be replaced with another conclusion.

## Local boundary

The file store supports one local Node.js process on persistent disk. Multiple server processes and ephemeral serverless filesystems need a shared durable store before real deployment. Routes are unauthenticated sample routes: use fictional data, not real family records, until application authentication and access control are provided. No CRM notification, phone call, SMS, payment, booking confirmation, or human transfer is executed.

Local HTTP tests and UI screenshots prove the local workflow only. Real voice/tool invocation requires separate live acceptance with a reachable callback URL.


## Local conversation and optional tools

Default conversations append courses.json and existing parent inquiry context to the prompt. The advisor can discuss age eligibility, fixed trial times, needs and contact preferences, then give a verbal summary. Missing tool configuration does not block the start button or invite. Local session/history scaffolding remains, but spoken answers are not saved and no trial request or advisor notification is submitted. A public HTTPS tool origin enables the existing session-bound save/submission workflow; failures must not be replaced by fixture success.

TOP_TEN_SCENARIO_TOOL_BASE_URL is optional. Only an explicitly configured public HTTPS endpoint enables tools; malformed, HTTP, localhost and local/private origins leave tools disabled. URL validation does not prove network reachability. No tunnel, knowledge base or database is needed for the default conversation. Local checks do not establish live speech or cloud callback acceptance.

## U.S. example data

The fictional academy is in Austin, Texas. Course records include location and `America/Chicago`; October trial times use CDT (`-05:00`). Prompts, course tool results and saved-result/history labels use the same course time zone.
