import { getToolBaseUrl } from '@/lib/agent-tools';
import { readJson, resultResponse, sessionFrom } from '@/lib/basketball-trial-sales/http';
import { listFollowUps, saveFollowUp } from '@/lib/basketball-trial-sales/results';
export async function GET(request: Request) {
  return resultResponse(() => ({
    results: listFollowUps(new URL(request.url).searchParams.get('lead_id') ?? undefined),
    tools_ready: Boolean(getToolBaseUrl()),
  }));
}
export async function POST(request: Request) {
  return resultResponse(async () => ({ result: saveFollowUp(sessionFrom(request), await readJson(request)) }));
}
