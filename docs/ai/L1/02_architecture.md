# 02 Architecture

> Topology and state ownership for Parent Trial Follow-up.

## Components

One Next.js App Router process serves the browser and routes. RTC carries audio; RTM carries transcript, Agent state, metrics and errors. The server SDK manages the cloud STT/LLM/TTS Agent. Scenario files define the business behavior.

## Data And Event Flow

The user start action creates any necessary scenario session, fetches the combined RTC/RTM token and bootstraps RTM plus invite. RTC/microphone hooks wait for the StrictMode guard. Toolkit events feed transcript and Inspector. Renew both token identities consistently; end calls stop, logs out RTM and unmounts hook-owned resources.

The invite additionally requires the server-created follow-up `session_id`. The supplied page creates it; do not generate one in the model.

`find_trial_courses` reads configured courses. `save_follow_up_result` saves confirmed facts and supported outcomes. `submit_trial_request` requires saved context, an eligible exact time and explicit consent, and writes the request together with its linked result. Invite receives `session_id`; tool URLs fix that session server-side.

## Ownership Boundaries

LandingPage owns pre-call bootstrap/RTM; ConversationComponent owns joined RTC/toolkit subscriptions. Token/invite/stop routes own privileged operations. `lib/basketball-trial-sales/` owns business rules/data; tool-contracts owns server-bound tool execution scope. Session evidence and manually selected outcomes are not automatic proof of business completion.

## Runtime Modes

Local development runs one Next.js process at http://localhost:3000 using `.env.local`. Native production uses `pnpm run build` then `pnpm run start`. Docker runs the same app as non-root UID 1001 on port 3000, without a reverse proxy inside the image. Use one long-lived Node process with persistent writable disk. `TOP_TEN_DATA_DIR` selects the result directory; otherwise .scenario-data is used. The sample routes are unauthenticated and intended for fictional families. Multi-instance or serverless use requires shared storage and application authorization.

Docker embeds the public App ID at build and receives the certificate only at runtime. It copies the actual runtime fixtures and supplies a non-root-owned data directory. File-backed scenarios require a retained writable volume; process-local scenarios require a single long-lived process. See [full architecture](../../../ARCHITECTURE.md).

## Related Deep Dives

- [Lifecycle](L2/conversation_lifecycle.md)
- [Tokens](L2/token_model.md)
