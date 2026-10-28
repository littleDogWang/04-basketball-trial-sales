import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parentLead } from './leads';
import { findCourse } from './courses';
import { outcomes, type FollowUpResult } from './result-types';

export class ResultError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
function directory() {
  return path.join(process.env.TOP_TEN_DATA_DIR ?? path.join(process.cwd(), '.scenario-data'), '04-basketball-trial-sales');
}
function filename(sessionId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)) throw new ResultError('Invalid session ID');
  return path.join(directory(), `${sessionId}.json`);
}
function write(result: FollowUpResult, create = false) {
  const file = filename(result.session_id);
  fs.mkdirSync(directory(), { recursive: true });
  const contents = JSON.stringify(result, null, 2) + '\n';
  if (create) { fs.writeFileSync(file, contents, { flag: 'wx', mode: 0o600 }); return result; }
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, contents, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    fs.rmSync(temporary, { force: true });
  }
  return result;
}
export function getFollowUp(sessionId: string): FollowUpResult {
  try { return JSON.parse(fs.readFileSync(filename(sessionId), 'utf8')) as FollowUpResult; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new ResultError('Follow-up not found', 404);
    throw error;
  }
}
export function listFollowUps(leadId?: string) {
  let files: string[];
  try { files = fs.readdirSync(directory()); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  return files.filter(file => /^[0-9a-f-]+\.json$/i.test(file))
    .map(file => getFollowUp(file.slice(0, -5)))
    .filter(result => !leadId || result.lead_id === leadId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}
export function createFollowUp(leadId: string) {
  if (leadId !== parentLead.lead_id) throw new ResultError('Unknown parent lead', 404);
  const id = randomUUID();
  const now = new Date().toISOString();
  return write({
    result_id: id, session_id: id, lead_id: leadId, parent_name: parentLead.parent_name,
    contact: parentLead.contact, source: parentLead.source, child_age: parentLead.child_age,
    experience: '', goals: '', preferred_times: '', outcome: 'incomplete', reason: '',
    summary: 'Follow-up opened; no conversation outcome recorded yet.', next_action: '', callback_at: '',
    follow_up_consent: false, created_at: now, updated_at: now,
  }, true);
}
export function parseBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ResultError('A JSON object is required');
  return value as Record<string, unknown>;
}
function usableContact(value: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || /^\+?[\d ()-]{7,25}$/.test(value); }
function text(value: unknown, name: string, required = false) {
  if (value === undefined && !required) return undefined;
  if (typeof value !== 'string' || value.length > 4000 || (required && !value.trim())) throw new ResultError(`Invalid ${name}`);
  return value.trim();
}
export function saveFollowUp(sessionId: string, input: unknown) {
  const body = parseBody(input);
  if (typeof body.child_age === 'string' && /^\d{1,2}$/.test(body.child_age)) body.child_age = Number(body.child_age);
  if (body.follow_up_consent === 'true' || body.follow_up_consent === 'false') body.follow_up_consent = body.follow_up_consent === 'true';
  const current = getFollowUp(sessionId);
  if (current.ended_at) throw new ResultError('This follow-up has ended', 409);
  if (!outcomes.includes(body.outcome as FollowUpResult['outcome']) || body.outcome === 'trial_requested') throw new ResultError('Use a valid outcome; trial_requested requires a received trial request');
  if (current.trial_request || (current.outcome !== 'incomplete' && body.outcome !== current.outcome)) throw new ResultError('A recorded conclusion cannot be replaced; start a new follow-up', 409);
  const result = { ...current, outcome: body.outcome as FollowUpResult['outcome'], updated_at: new Date().toISOString() };
  for (const key of ['experience', 'goals', 'preferred_times', 'reason', 'summary', 'next_action', 'callback_at', 'contact'] as const) {
    const value = text(body[key], key);
    if (value) result[key] = value;
  }
  if (body.child_age !== undefined && body.child_age !== 0) {
    if (typeof body.child_age !== 'number' || !Number.isInteger(body.child_age) || body.child_age < 1 || body.child_age > 17) throw new ResultError('Child age must be a whole number from 1 to 17');
    result.child_age = body.child_age;
  }
  if (body.follow_up_consent !== undefined) {
    if (typeof body.follow_up_consent !== 'boolean') throw new ResultError('Invalid follow-up consent');
    result.follow_up_consent = body.follow_up_consent;
  }
  if (result.outcome !== 'incomplete' && !text(body.summary, 'summary', true)) throw new ResultError('A factual summary is required');
  if (result.outcome === 'follow_up_needed' && (!result.follow_up_consent || !result.reason || !result.next_action)) throw new ResultError('Follow-up requires agreement, reason, and next action');
  if (result.outcome === 'not_eligible' && (!result.child_age || findCourse(result.child_age).length !== 0 || !result.reason)) throw new ResultError('Not eligible requires an age outside the configured range and a reason');
  if (['not_interested', 'do_not_contact', 'wrong_contact'].includes(result.outcome)) {
    result.follow_up_consent = false; result.callback_at = ''; result.next_action = '';
  }
  if (!usableContact(result.contact)) throw new ResultError('Provide a usable email address or phone number');
  if (result.callback_at && !result.follow_up_consent) throw new ResultError('A callback requires follow-up agreement');
  return write(result);
}
export function requestTrial(sessionId: string, input: unknown) {
  const body = parseBody(input);
  const current = getFollowUp(sessionId);
  if (body.consent !== true && body.consent !== 'true') throw new ResultError('Explicit parent agreement is required');
  const courseId = text(body.course_id, 'course_id', true)!;
  const preferredTime = text(body.preferred_time, 'preferred_time', true)!;
  if (current.trial_request) {
    if (current.trial_request.course_id !== courseId || current.trial_request.preferred_time !== preferredTime) throw new ResultError('A different trial request is already recorded', 409);
    return { result: current, request: current.trial_request, duplicate: true };
  }
  if (current.ended_at || current.outcome !== 'incomplete') throw new ResultError('This follow-up is already concluded', 409);
  const course = current.child_age && findCourse(current.child_age).find(item => item.courseId === courseId);
  if (!course || !course.availableTimes.includes(preferredTime) || Date.parse(preferredTime) <= Date.now()) throw new ResultError('Course or time unavailable', 409);
  const contact = text(body.contact, 'contact') || current.contact;
  if (!usableContact(contact)) throw new ResultError('Provide a usable email address or phone number');
  if (!contact || !current.goals || !current.experience || !current.preferred_times) throw new ResultError('Save the child experience, goals, time preferences, and usable contact before submitting');
  const now = new Date().toISOString();
  const request = { request_id: randomUUID(), course_id: courseId, preferred_time: preferredTime, status: 'request_received' as const, created_at: now };
  const result = write({ ...current, contact, trial_request: request, outcome: 'trial_requested',
    summary: text(body.summary, 'summary', true)!, reason: 'The parent agreed to submit this trial request.',
    next_action: 'Course advisor to review the request and confirm availability. No seat is reserved yet.', updated_at: now });
  return { result, request, duplicate: false };
}
export function endFollowUp(sessionId: string) {
  const current = getFollowUp(sessionId);
  if (current.ended_at) return current;
  return write({ ...current, ended_at: new Date().toISOString(), updated_at: new Date().toISOString() });
}
