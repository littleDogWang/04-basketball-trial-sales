# Parent Trial Follow-up

Follow up on a basketball inquiry and capture the parent's next step.

Riley follows up with an existing fictional parent inquiry at Northside Basketball Academy in Austin, Texas. The conversation reuses known context, checks interest, discusses the child's goals and eligible courses, and can submit a trial request with explicit agreement when tools are enabled.

Read the [eight-part recipe](RECIPE.md) for example conversations and business customization. This independent scenario derives its RTC/RTM lifecycle from the official [Agora Next.js quickstart](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs); its scenario facts and tools live in this repository.

## Prerequisites

- Node.js 22 or newer; pnpm **9.15.9** (`packageManager` in package.json; lockfile format 9).
- Access to this repository and an Agora project with RTC, Signaling and Conversational AI available.
- Browser microphone permission; HTTPS for hosted use.
- Docker with a running engine for container verification. Agora CLI is optional for manual setup and required only for its binding commands.

## Run It

```bash
git clone https://github.com/littleDogWang/07-basketball-trial-sales.git
cd 07-basketball-trial-sales
pnpm install --frozen-lockfile
cp env.local.example .env.local
```

Fill the two required Agora values in `.env.local`, then run `pnpm run doctor` and `pnpm run dev`. Keep an existing env file instead of overwriting it. With a ready Agora CLI, use `agora quickstart env write . --template nextjs --project <your-project> --json` to write template-aware keys for an existing authorized project. Check `agora version` and `agora doctor --json` first; do not create or change a remote project without authorization.

Open [http://localhost:3000](http://localhost:3000) and choose **Start parent follow-up**. Confirm two-way audio and both transcript speakers with a real call; local checks cannot establish that result.

## Working From A Clone

Run all commands at this repository root. Install the declared pnpm version before using the frozen lockfile; pnpm 8 cannot consume lockfile format 9. On an existing clone, retain `.env.local` and use `pnpm install --frozen-lockfile`, `pnpm run doctor`, then `pnpm run dev`.

Use the scenario-specific entry and persistent identity; starting voice requires a user action.

## Environment Variables

The tracked example is [env.local.example](env.local.example); local Next.js loads `.env.local`. Hosted environments provide the same values through the platform's secret store.

| Variable | Required | Owner / exposure | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Required | Next.js build and runtime; public | App ID from the selected Agora project; Docker must receive the same value at build and runtime. |
| `NEXT_AGORA_APP_CERTIFICATE` | Required | Next.js server runtime; secret | Signs RTC/RTM credentials and authenticates managed Agent operations; never a build argument. |
| `TOP_TEN_SCENARIO_TOOL_BASE_URL` | Optional | Next.js server; non-secret | This same app's public HTTPS origin. Omit for default conversation; enabling tools requires actual cloud reachability. |
| `TOP_TEN_DATA_DIR` | Optional | Next.js server; local path | Optional persistent directory for follow-up result and request files. |

With no valid public HTTPS tool origin, voice uses default conversation mode. A valid-looking URL does not prove that Agora cloud can reach it. Restart/redeploy after changing env and start a new conversation.

Optional BYOK credentials appear only in the invite route's commented provider blocks. They are not needed by default; enabling a block requires supplying its server-only variables and separately verifying the provider.

## Commands

### Setup

`pnpm install --frozen-lockfile`, configure `.env.local`, then `pnpm run doctor`.

### Development

`pnpm run dev` starts Next.js with its local API routes.

### Quality

| Command | Purpose |
| --- | --- |
| `pnpm run doctor` | `node scripts/doctor.mjs` |
| `pnpm run dev` | `next dev --webpack` |
| `pnpm run build` | `next build` |
| `pnpm run start` | `next start` |
| `pnpm run lint` | `eslint .` |
| `pnpm run verify:api` | `node --import tsx scripts/verify-api-contracts.ts` |
| `pnpm run typecheck` | `tsc --noEmit` |
| `pnpm run verify` | Canonical local/CI checks: `pnpm run doctor`, `pnpm run verify:template`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run verify:api`, `pnpm run verify:scenario`, `pnpm run test:follow-up`, `pnpm run build` |
| `pnpm run verify:scenario` | `node --import tsx scripts/verify-scenario.ts` |
| `pnpm run test:follow-up` | `node --import tsx --test tests/parent-follow-up.test.ts` |
| `pnpm run verify:template` | Standard repository paths, identity, documentation links and delivery contracts. |
| `pnpm run verify:docker` | Separate Docker image + startup + scenario-route smoke check (synthetic credentials). |

### CI / Pre-ship

`pnpm run verify` is the canonical local and project-CI entry. It includes every shipped scenario check. Doctor requires a populated local env file; CI uses synthetic credentials and mocked Agora operations. `pnpm run verify:docker` is the separate container check.

## Architecture

A browser joins Agora RTC for audio and RTM for transcript/state/metrics events. Next.js signs short-lived tokens and starts/stops the cloud Agent. Scenario instructions select the actual business behavior.

Local development runs one Next.js process at http://localhost:3000 using `.env.local`. Native production uses `pnpm run build` then `pnpm run start`. Docker runs the same app as non-root UID 1001 on port 3000, without a reverse proxy inside the image. Use one long-lived Node process with persistent writable disk. `TOP_TEN_DATA_DIR` selects the result directory; otherwise .scenario-data is used. The sample routes are unauthenticated and intended for fictional families. Multi-instance or serverless use requires shared storage and application authorization.

See [ARCHITECTURE.md](ARCHITECTURE.md) for topology, ownership and deployment details.

## What You Get

- Existing-parent context instead of a cold qualification checklist.
- Age-eligible course recommendations with explicit America/Chicago trial times.
- Optional saved follow-up outcomes and an atomically linked received trial request.

**Default mode:** The prompt includes course data and parent inquiry context. A local incomplete session/history record is created, but spoken answers, trial requests and advisor notifications are not saved by the Agent.

**Tool mode:** Session-bound course lookup, follow-up saving and trial-request submission update the local result store. A received request remains pending advisor confirmation.

**Limits:** `request_received` is not a reserved seat or confirmed booking. No real CRM notification, phone call, SMS, payment or human transfer is connected. Do not infer consent from interest.

## How It Works

| User step | Assistant / app behavior | Result |
| --- | --- | --- |
| Start parent follow-up | Create an incomplete follow-up session for the existing lead before voice startup. | A stable session ID and visible inquiry context. |
| Confirm interest, goals and times | Discuss local data; in tool mode progressively save confirmed facts and query eligible courses. | A useful summary without invented availability. |
| Agree to submit, decline or request follow-up | Use the matching session-bound tool when available. | A received trial request or supported saved outcome; the page reads actual stored results. |

`find_trial_courses` reads configured courses. `save_follow_up_result` saves confirmed facts and supported outcomes. `submit_trial_request` requires saved context, an eligible exact time and explicit consent, and writes the request together with its linked result. Invite receives `session_id`; tool URLs fix that session server-side.

The invite additionally requires the server-created follow-up `session_id`. The supplied page creates it; do not generate one in the model.

## Repo Map

- `app/api/`: token, invite, stop and scenario HTTP routes.
- `components/`: browser RTC/RTM lifecycle, transcript and scenario presentation.
- `lib/basketball-trial-sales/`: repository-local business data and rules.
- `lib/agent-config.ts`, `lib/agent-tools.ts`: prompt and optional tool assembly.
- `types/`: application, Agent configuration and presentation types.
- `docs/scenario/`: business guide, design and acceptance cases.
- `scripts/`: doctor, contracts, scenario checks and delivery verification.
- `docs/ai/`: AI loading card, internal recipe, all eight L1 summaries and L2 deep dives.

## Troubleshooting

- **Wrong pnpm / frozen-lockfile error:** install pnpm 9.15.9; do not regenerate the lockfile with pnpm 8.
- **Doctor fails:** check Node, pnpm and the two populated values in `.env.local`.
- **Agent/transcript fails:** inspect token/invite errors, then RTM login. Preserve `RtcTokenBuilder.buildTokenWithRtm`.
- **No business write:** The prompt includes course data and parent inquiry context. A local incomplete session/history record is created, but spoken answers, trial requests and advisor notifications are not saved by the Agent.
- **Lost result or state:** Use one long-lived Node process with persistent writable disk. `TOP_TEN_DATA_DIR` selects the result directory; otherwise .scenario-data is used. The sample routes are unauthenticated and intended for fictional families. Multi-instance or serverless use requires shared storage and application authorization.
- **Docker has no usable client App ID:** rebuild with the correct public App ID and use that same ID at runtime.

## Deployment

Native hosting runs `pnpm run build` and `pnpm run start` on the documented Node runtime. Use one long-lived Node process with persistent writable disk. `TOP_TEN_DATA_DIR` selects the result directory; otherwise .scenario-data is used. The sample routes are unauthenticated and intended for fictional families. Multi-instance or serverless use requires shared storage and application authorization. Serve the public origin through HTTPS; configure the optional business-tool origin only for a cloud-reachable deployment.

### Docker

```bash
docker build --build-arg NEXT_PUBLIC_AGORA_APP_ID=YOUR_AGORA_APP_ID -t 07-basketball-trial-sales:local .
docker run --rm -p 3000:3000 --env-file .env.local --mount source=07-basketball-trial-sales-data,target=/app/.scenario-data 07-basketball-trial-sales:local
```

Replace `YOUR_AGORA_APP_ID` with the public App ID used in `.env.local`. Next.js embeds that identifier in the browser bundle, so changing projects requires rebuilding the image. The App Certificate is supplied only at container runtime. The named volume preserves the non-root-owned `.scenario-data` directory. Leave custom host storage variables unset inside Docker or map them to the mounted directory; a host absolute path is not automatically mounted.

`pnpm run verify:docker` independently builds the image with synthetic credentials, starts an isolated localhost-bound container, checks the home page and a scenario route, then removes only that container. It does not contact Agora or prove a live voice session.

## More Docs

- [AGENTS.md](AGENTS.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [RECIPE.md](RECIPE.md)
- [AI repo card](docs/ai/L0_repo_card.md)
- [Internal recipe contract](docs/ai/RECIPE.md)
- [Scenario guide](docs/scenario/README.md)
- [Acceptance cases](docs/scenario/acceptance.md)

## Security

Use fictional business data. The sample is not a production authentication, authorization or multi-tenant system. Keep certificates, provider keys, local data and local project bindings out of Git, logs and images. Rotate exposed credentials through the owning service and replace the runtime secret. Report security issues privately to security@agora.io; do not post credentials in an issue.

## License

Released under the [MIT License](LICENSE). Preserve upstream copyright and source attribution.
