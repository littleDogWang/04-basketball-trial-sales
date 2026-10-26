import type { LlmTool } from 'agora-agents';
export function getToolBaseUrl(value = process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    const localHost = (!host.includes('.') && !host.startsWith('[')) || /(^|\.)(localhost|local|internal)$/.test(host) ||
      /^(0\.|10\.|127\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host) ||
      /^(\[::|\[f[cd]|\[fe[89ab])/.test(host);
    if (url.protocol !== 'https:' || localHost || url.username || url.password || url.search || url.hash) return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getScenarioTools(_scenarioId: string, baseUrl = process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL, sessionId?: string): LlmTool[] {
  const origin = getToolBaseUrl(baseUrl);
  if (!origin || !sessionId) return [];
  const root = `${origin}/api/scenarios/07-basketball-trial-sales`;
  const string = { type: 'string' };
  function post(name: string, description: string, path: string, properties: Record<string, unknown>): LlmTool {
    const keys = Object.keys(properties);
    return { type: 'function', function: { name, description, parameters: { type: 'object', properties, required: keys } },
      server: { method: 'POST', url: `${root}/${path}?session_id=${encodeURIComponent(sessionId!)}`, body: Object.fromEntries(keys.map(key => [key, `{{args.${key}}}`])) } };
  }
  return [
    { type: 'function', function: { name: 'find_trial_courses', description: 'Look up configured eligible courses and trial times. Never invent availability.', parameters: { type: 'object', properties: { child_age: { type: 'integer', minimum: 1, maximum: 17 } }, required: ['child_age'] } }, server: { method: 'GET', url: `${root}/courses?child_age={{args.child_age}}` } },
    post('save_follow_up_result', 'Save known information after meaningful answers using incomplete; conclude with the supported outcome before goodbye. Blank strings and age 0 preserve known values. Never invent consent, summaries, or next actions. trial_requested can only be created by submit_trial_request.', 'results', {
      outcome: { type: 'string', enum: ['incomplete', 'follow_up_needed', 'not_interested', 'not_eligible', 'do_not_contact', 'wrong_contact'] },
      child_age: { type: 'integer', minimum: 0, maximum: 17 }, experience: string, goals: string, preferred_times: string, contact: string,
      reason: string, summary: string, next_action: string, callback_at: string,
      follow_up_consent: { type: 'boolean', description: 'True only when the parent explicitly agreed to further contact.' },
    }),
    post('submit_trial_request', 'After saving age, experience, goals and preferred times, submit the exact eligible course/time only with explicit parent agreement. Atomically saves the request and follow-up result. request_received is not a confirmed booking. Repeating the same request returns the original ID.', 'requests', {
      course_id: string, preferred_time: string, contact: string, consent: { type: 'boolean' }, summary: string,
    }),
  ];
}
