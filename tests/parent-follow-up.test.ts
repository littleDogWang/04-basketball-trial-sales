import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFollowUp, getFollowUp, saveFollowUp, requestTrial, endFollowUp, listFollowUps } from '../lib/basketball-trial-sales/results';
import { POST as saveResult, GET as listResults } from '../app/api/scenarios/07-basketball-trial-sales/results/route';
import { POST as submitRequest } from '../app/api/scenarios/07-basketball-trial-sales/requests/route';
import { POST as openSession } from '../app/api/scenarios/07-basketball-trial-sales/sessions/route';
import { getScenarioTools } from '../lib/agent-tools';
let directory: string;
const originalNow = Date.now;
const originalDirectory = process.env.TOP_TEN_DATA_DIR;
beforeEach(() => { Date.now = () => Date.parse('2026-10-16T00:00:00Z'); directory = fs.mkdtempSync(path.join(os.tmpdir(), 'parent-follow-up-')); process.env.TOP_TEN_DATA_DIR = directory; });
afterEach(() => { Date.now = originalNow; if (originalDirectory === undefined) delete process.env.TOP_TEN_DATA_DIR; else process.env.TOP_TEN_DATA_DIR = originalDirectory; fs.rmSync(directory, { recursive: true, force: true }); });
const details = { outcome: 'incomplete', experience: 'No prior lessons', goals: 'Build confidence', preferred_times: 'Saturday morning', summary: 'The parent is interested in a beginner trial.' };
const trial = { course_id: 'BASKET-8-12-BEGINNER', preferred_time: '2026-10-24T10:00:00-05:00', consent: true, summary: 'Parent agreed to the Saturday beginner trial request.' };
function post(pathname: string, body: unknown) { return new Request(`http://localhost/api/scenarios/07-basketball-trial-sales/${pathname}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); }

test('an existing lead starts with honest incomplete progress and retains collected details after process restart', () => {
 const result = createFollowUp('PARENT-1042'); assert.equal(result.outcome, 'incomplete'); assert.equal(result.child_age, 9);
 saveFollowUp(result.session_id, details);
 const code = `const { getFollowUp } = require('./lib/basketball-trial-sales/results.ts'); console.log(JSON.stringify(getFollowUp('${result.session_id}')));`;
 const child = spawnSync(process.execPath, ['--import', 'tsx', '-e', code], { cwd: process.cwd(), env: process.env, encoding: 'utf8' });
 assert.equal(child.status, 0, child.stderr); assert.equal(JSON.parse(child.stdout).goals, details.goals);
});
test('trial request and result save together; repeats preserve the request ID even after end', () => {
 const { session_id: id } = createFollowUp('PARENT-1042'); saveFollowUp(id, details);
 const saved = requestTrial(id, trial); assert.equal(saved.result.outcome, 'trial_requested'); assert.equal(saved.request.status, 'request_received');
 assert.equal(getFollowUp(id).trial_request?.request_id, saved.request.request_id);
 endFollowUp(id); const retry = requestTrial(id, trial); assert.equal(retry.duplicate, true); assert.equal(retry.request.request_id, saved.request.request_id);
 assert.throws(() => requestTrial(id, { ...trial, preferred_time: '2026-10-25T14:00:00-05:00' }), /different trial/);
});
test('requests require explicit agreement, collected needs, and a configured eligible time', () => {
 const { session_id: id } = createFollowUp('PARENT-1042');
 assert.throws(() => requestTrial(id, { ...trial, consent: false }), /agreement/);
 assert.throws(() => requestTrial(id, trial), /experience/); saveFollowUp(id, details);
 assert.throws(() => requestTrial(id, { ...trial, contact: 'invalid-contact' }), /usable/);
 assert.throws(() => requestTrial(id, { ...trial, preferred_time: '2026-10-24T11:00:00-05:00' }), /unavailable/);
 saveFollowUp(id, { outcome: 'incomplete', child_age: 7 }); assert.throws(() => requestTrial(id, trial), /unavailable/);
 assert.equal(getFollowUp(id).trial_request, undefined);
});
test('each non-request conclusion persists independently, with consent required for callback', () => {
 for (const outcome of ['not_interested', 'do_not_contact', 'wrong_contact']) {
  const { session_id: id } = createFollowUp('PARENT-1042');
  const saved = saveFollowUp(id, { outcome, summary: `The parent confirmed ${outcome}.`, follow_up_consent: true, next_action: 'Call again', callback_at: 'Tomorrow' });
  assert.equal(saved.outcome, outcome); assert.equal(saved.follow_up_consent, false); assert.equal(saved.callback_at, ''); assert.equal(saved.next_action, '');
  assert.throws(() => requestTrial(id, trial), /concluded/);
 }
 const { session_id: id } = createFollowUp('PARENT-1042');
 assert.throws(() => saveFollowUp(id, { ...details, outcome: 'follow_up_needed', reason: 'Parent is busy', next_action: 'Callback' }), /agreement/);
 const saved = saveFollowUp(id, { ...details, outcome: 'follow_up_needed', reason: 'No matching time', next_action: 'Advisor to discuss an alternative', follow_up_consent: true });
 assert.equal(getFollowUp(id).next_action, saved.next_action);
 const other = createFollowUp('PARENT-1042'); assert.throws(() => saveFollowUp(other.session_id, { outcome: 'not_eligible', summary: 'Ineligible', reason: 'Age' }), /outside/);
 assert.equal(saveFollowUp(other.session_id, { outcome: 'not_eligible', child_age: 7, summary: 'Child is seven', reason: 'Course accepts ages 8–12' }).outcome, 'not_eligible');
});
test('ending partial progress preserves known details and cannot downgrade a received request', () => {
 const { session_id: id } = createFollowUp('PARENT-1042'); saveFollowUp(id, details); const ended = endFollowUp(id);
 assert.equal(ended.outcome, 'incomplete'); assert.equal(ended.goals, details.goals); assert.equal(endFollowUp(id).ended_at, ended.ended_at);
 assert.throws(() => saveFollowUp(id, { ...details, outcome: 'not_interested' }), /ended/);
 const other = createFollowUp('PARENT-1042'); saveFollowUp(other.session_id, details); requestTrial(other.session_id, trial);
 assert.throws(() => saveFollowUp(other.session_id, details), /conclusion/); assert.equal(endFollowUp(other.session_id).outcome, 'trial_requested');
});
test('HTTP boundaries reject malformed input and cannot fabricate a trial_requested result', async () => {
 assert.equal((await openSession(post('sessions', null))).status, 400);
 assert.equal((await openSession(post('sessions', { lead_id: 'unknown' }))).status, 404);
 const id = createFollowUp('PARENT-1042').session_id;
 assert.equal((await saveResult(post(`results?session_id=${id}`, { outcome: 'trial_requested', summary: 'Booked' }))).status, 400);
 assert.equal((await saveResult(post(`results?session_id=${id}`, { outcome: 'incomplete', child_age: 1.5 }))).status, 400);
 assert.equal((await saveResult(post(`results?session_id=${id}`, { ...details, contact: 'not-a-contact' }))).status, 400);
 assert.equal((await submitRequest(post('requests', trial))).status, 400);
 assert.equal((await saveResult(new Request(`http://localhost/results?session_id=${id}`, { method: 'POST', body: '{' }))).status, 400);
 assert.throws(() => getFollowUp('../other'), /Invalid session/);
});
test('tool interpolation strings are normalized without treating false as consent', async () => {
 const id = createFollowUp('PARENT-1042').session_id;
 const response = await saveResult(post(`results?session_id=${id}`, { ...details, child_age: '9', follow_up_consent: 'false' }));
 assert.equal(response.status, 200); assert.equal(getFollowUp(id).follow_up_consent, false);
 assert.equal((await submitRequest(post(`requests?session_id=${id}`, { ...trial, consent: 'false' }))).status, 400);
 assert.equal((await submitRequest(post(`requests?session_id=${id}`, { ...trial, consent: 'true' }))).status, 200);
});
test('session-specific tool URLs bind writes to the selected server session', () => {
 const id = createFollowUp('PARENT-1042').session_id;
 const tools = getScenarioTools('07-basketball-trial-sales', 'https://tools.example.test', id);
 assert.equal(tools.length, 3);
 for (const tool of tools.filter(tool => tool.server?.method === 'POST')) assert.equal(new URL(tool.server!.url!).searchParams.get('session_id'), id);
 assert.deepEqual(getScenarioTools('07-basketball-trial-sales', '', id), []);
});
test('save failures are server failures and leave the last durable result unchanged', async () => {
 const id = createFollowUp('PARENT-1042').session_id; const before = getFollowUp(id);
 const originalRename = fs.renameSync; fs.renameSync = () => { throw new Error('Simulated disk failure'); };
 const originalError = console.error; console.error = () => {};
 try { assert.equal((await saveResult(post(`results?session_id=${id}`, details))).status, 500); assert.deepEqual(getFollowUp(id), before); }
 finally { fs.renameSync = originalRename; console.error = originalError; }
 assert.equal(fs.readdirSync(path.join(directory, '07-basketball-trial-sales')).filter(file => file.endsWith('.tmp')).length, 0);
});
test('a corrupt stored record is reported as a server error and never silently overwritten', async () => {
 const id = createFollowUp('PARENT-1042').session_id;
 const file = path.join(directory, '07-basketball-trial-sales', `${id}.json`); fs.writeFileSync(file, '{corrupt');
 const originalError = console.error; console.error = () => {};
 try { assert.equal((await listResults(new Request('http://localhost/results'))).status, 500); }
 finally { console.error = originalError; }
 assert.equal(fs.readFileSync(file, 'utf8'), '{corrupt');
});
test('list filtering and selected result retrieval preserve independent follow-ups', () => {
 const a = createFollowUp('PARENT-1042'); const b = createFollowUp('PARENT-1042');
 saveFollowUp(a.session_id, { outcome: 'not_interested', summary: 'Parent declined.' });
 assert.equal(getFollowUp(b.session_id).outcome, 'incomplete'); assert.equal(listFollowUps('PARENT-1042').length, 2); assert.equal(listFollowUps('other').length, 0);
});
