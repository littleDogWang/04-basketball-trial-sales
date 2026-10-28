import { resultResponse } from '@/lib/basketball-trial-sales/http';
import { endFollowUp, getFollowUp } from '@/lib/basketball-trial-sales/results';
type Context = { params: Promise<{ sessionId: string }> };
export async function GET(_request: Request, context: Context) {
  return resultResponse(async () => ({ result: getFollowUp((await context.params).sessionId) }));
}
export async function POST(_request: Request, context: Context) {
  return resultResponse(async () => ({ result: endFollowUp((await context.params).sessionId) }));
}
