import { readJson, resultResponse, sessionFrom } from '@/lib/basketball-trial-sales/http';
import { requestTrial } from '@/lib/basketball-trial-sales/results';
export async function POST(request: Request) {
  return resultResponse(async () => requestTrial(sessionFrom(request), await readJson(request)));
}
