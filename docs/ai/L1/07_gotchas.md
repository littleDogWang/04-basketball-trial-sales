# 07 Gotchas

> High-impact setup and business-state pitfalls.

## Setup Pitfalls

- pnpm 8 does not match lockfile 9; use declared pnpm 9.15.9.
- Missing .env.local values fail doctor; do not log or paste credentials.
- Docker needs a running engine and the public App ID at build time. A runtime-only ID cannot repair an already-built client bundle.
- A private/localhost callback URL cannot be used as a cloud business-tool origin.

## Runtime Pitfalls

The prompt includes course data and parent inquiry context. A local incomplete session/history record is created, but spoken answers, trial requests and advisor notifications are not saved by the Agent.

`request_received` is not a reserved seat or confirmed booking. No real CRM notification, phone call, SMS, payment or human transfer is connected. Do not infer consent from interest.

Use one long-lived Node process with persistent writable disk. `TOP_TEN_DATA_DIR` selects the result directory; otherwise .scenario-data is used. The sample routes are unauthenticated and intended for fictional families. Multi-instance or serverless use requires shared storage and application authorization.

Keep combined token privileges, StrictMode initialization, toolkit readiness and hook-owned cleanup. A missing transcript is an RTM/event question, not evidence that the model never responded. Tool failures cannot silently fall back to fixture success.

## Documentation Or Contract Drift

The repository identity must be `littleDogWang/07-basketball-trial-sales`, while upstream attribution remains separate. Keep invite fields, data paths, time zones, Docker volume behavior and pnpm/verification commands synchronized. Run `pnpm run verify:template` for structure/link drift and the canonical checks for source behavior.

## Related Deep Dives

- [Lifecycle](L2/conversation_lifecycle.md)
- [Transcript pipeline](L2/transcript_pipeline.md)
