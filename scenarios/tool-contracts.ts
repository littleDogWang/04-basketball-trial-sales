import type { LlmTool } from 'agora-agents';
type Property = Record<string, unknown>;
function tool(baseUrl: string, name: string, description: string, method: 'GET' | 'POST', path: string, properties: Property, required: string[], body?: Record<string, unknown>): LlmTool {
  return { type: 'function', function: { name, description, parameters: { type: 'object', properties, required } }, server: { method, url: `${baseUrl.replace(/\/$/, '')}${path}`, ...(body ? { body } : {}) } };
}
export function getScenarioTools(_scenarioId: string, baseUrl = process.env.TOP_TEN_SCENARIO_TOOL_BASE_URL): LlmTool[] {
  if (!baseUrl) return [];
  const stringProperty = { type: 'string' };
  const integerProperty = { type: 'integer' };
  return [
        tool(baseUrl, 'find_trial_courses', 'Find courses matching a child age.', 'GET', '/api/scenarios/07-basketball-trial-sales/courses?child_age={{args.child_age}}', { child_age: integerProperty }, ['child_age']),
        tool(baseUrl, 'submit_trial_request', 'Submit a trial request; this is not a confirmed booking.', 'POST', '/api/scenarios/07-basketball-trial-sales/requests', { request_id: stringProperty, course_id: stringProperty, child_age: integerProperty, preferred_time: stringProperty, contact: stringProperty }, ['request_id', 'course_id', 'child_age', 'preferred_time', 'contact'], { request_id: '{{args.request_id}}', course_id: '{{args.course_id}}', child_age: '{{args.child_age}}', preferred_time: '{{args.preferred_time}}', contact: '{{args.contact}}' }),
      ];
}
