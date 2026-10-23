# Scenario Agent Configuration

> Read when changing Parent Trial Follow-up's prompt, tools, provider chain or turn detection.

## Source Files

- `scenarios/07-basketball-trial-sales/config.ts`: role, workflow, guardrails and greeting.
- `scenarios/index.ts`: selected prompt and default/tool mode context.
- `scenarios/tool-contracts.ts`: optional tool origin validation, schemas and server-bound scope.
- `app/api/invite-agent/route.ts`: actual SDK builder and session options.
- `scenarios/runtime-profile.ts`: non-secret configured provider/model display.

There are no generic Ada/ADA_PROMPT constants to edit. Use the scenario config and prompt assembly actually imported by the invite route.

## Request And Startup

The invite additionally requires the server-created follow-up `session_id`. The supplied page creates it; do not generate one in the model.

The server reads the App ID and App Certificate, builds AgoraClient with the selected area, and creates an Agent. The configured pipeline is Deepgram nova-3, OpenAI gpt-4o-mini and MiniMax speech_2_6_turbo. Copy the route's current builder pattern and createSession options; do not add an extra client argument or reproduce older SDK signatures.

The browser and invite route share DEFAULT_AGENT_UID. RTM, transcript/error delivery and metrics remain enabled. Session startup returns the Agent ID, creation timestamp and state; ending uses that same Agent ID.

## Prompt And Tools

Default behavior: The prompt includes course data and parent inquiry context. A local incomplete session/history record is created, but spoken answers, trial requests and advisor notifications are not saved by the Agent.

Tool behavior: Session-bound course lookup, follow-up saving and trial-request submission update the local result store. A received request remains pending advisor confirmation.

`find_trial_courses` reads configured courses. `save_follow_up_result` saves confirmed facts and supported outcomes. `submit_trial_request` requires saved context, an eligible exact time and explicit consent, and writes the request together with its linked result. Invite receives `session_id`; tool URLs fix that session server-side.

`request_received` is not a reserved seat or confirmed booking. No real CRM notification, phone call, SMS, payment or human transfer is connected. Do not infer consent from interest.

## Provider And Turn Detection Changes

Edit the actual constructor blocks and turnDetection.config fields in the invite route. Provider BYOK examples are opt-in; keys stay server-side and are not part of the default two-key environment contract. For recruitment, preserve the configured 1,500 ms end-of-speech pause and 50-message LLM history unless intentionally changing interview pacing.

## Verification

Run `pnpm run verify:api`, `pnpm run verify:scenario` and canonical `pnpm run verify`. Real microphone pacing, interruptions and cloud HTTP execution require separate acceptance; mock Agent startup cannot establish those outcomes.

## See Also

- [Interfaces](../06_interfaces.md)
- [Workflows](../05_workflows.md)
- [Token model](token_model.md)
