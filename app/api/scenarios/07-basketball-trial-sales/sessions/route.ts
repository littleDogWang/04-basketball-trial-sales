import { readJson, resultResponse } from '@/scenarios/07-basketball-trial-sales/http';
import { createFollowUp, parseBody, ResultError } from '@/scenarios/07-basketball-trial-sales/results';
export async function POST(request: Request) {
  return resultResponse(async () => {
    const body = parseBody(await readJson(request));
    if (typeof body.lead_id !== 'string') throw new ResultError('lead_id is required');
    return { result: createFollowUp(body.lead_id) };
  }, 201);
}
