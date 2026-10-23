# 06 Interfaces

> Actual scenario API, event and configuration boundaries.

## Browser Or User-Facing APIs

- `GET /api/generate-agora-token`: optional uid/channel; returns `{ token, uid, channel }`; server credential/configuration errors return failure.
- `POST /api/invite-agent`: requester/channel are required. The invite additionally requires the server-created follow-up `session_id`. The supplied page creates it; do not generate one in the model. Returns Agent ID, creation time and state; input and runtime failures are reported explicitly.
- `POST /api/stop-conversation`: requires agent_id; already-stopping/not-found handling is idempotent.
- `POST /api/chat/completions`: optional custom-LLM proxy, not used by the default managed pipeline.

`find_trial_courses` reads configured courses. `save_follow_up_result` saves confirmed facts and supported outcomes. `submit_trial_request` requires saved context, an eligible exact time and explicit consent, and writes the request together with its linked result. Invite receives `session_id`; tool URLs fix that session server-side.

The prompt includes course data and parent inquiry context. A local incomplete session/history record is created, but spoken answers, trial requests and advisor notifications are not saved by the Agent.

Session-bound course lookup, follow-up saving and trial-request submission update the local result store. A received request remains pending advisor confirmation.

Use the scenario-specific entry and persistent identity; starting voice requires a user action.



See [scenario guide](../../../scenarios/07-basketball-trial-sales/README.md) and the scenario source for exact business request shapes, validation errors and ownership rules.

## Events And Media

RTC carries microphone and synthesized audio. RTM/toolkit provides TRANSCRIPT_UPDATED, AGENT_STATE_CHANGED, AGENT_METRICS, completed-turn, error and SAL events where reported. Normalize toolkit local uid zero before display and retain interrupted turns. Preserve missing metric fields and data provenance; Inspector outcomes are manually confirmed.

## Environment Contract

Local Next.js reads `.env.local` from tracked `env.local.example`. Hosted/Docker servers inject runtime values; the public App ID must also be supplied to the browser build.

| Variable | Required | Owner / exposure | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Required | Next.js build and runtime; public | App ID from the selected Agora project; Docker must receive the same value at build and runtime. |
| `NEXT_AGORA_APP_CERTIFICATE` | Required | Next.js server runtime; secret | Signs RTC/RTM credentials and authenticates managed Agent operations; never a build argument. |
| `TOP_TEN_SCENARIO_TOOL_BASE_URL` | Optional | Next.js server; non-secret | This same app's public HTTPS origin. Omit for default conversation; enabling tools requires actual cloud reachability. |
| `TOP_TEN_DATA_DIR` | Optional | Next.js server; local path | Optional persistent directory for follow-up result and request files. |

## External Services

The server uses agora-agents with the configured managed STT/LLM/TTS providers. The browser uses RTC, Signaling and the Agent Client Toolkit. Optional business tools call this same app over public HTTPS, and their returned success is required before reporting an action complete. Provider BYOK blocks are opt-in, server-only and require separate verification.

## Related Deep Dives

- [Tokens](L2/token_model.md)
- [Transcript pipeline](L2/transcript_pipeline.md)
- [Agent configuration](L2/invite_agent_config.md)
