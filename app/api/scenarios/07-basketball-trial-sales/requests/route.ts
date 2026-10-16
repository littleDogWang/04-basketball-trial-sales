import { readJson, resultResponse, sessionFrom } from '@/scenarios/07-basketball-trial-sales/http';
import { requestTrial } from '@/scenarios/07-basketball-trial-sales/results';
export async function POST(request: Request) {
  return resultResponse(async () => requestTrial(sessionFrom(request), await readJson(request)));
}
