export const outcomes = ['incomplete', 'trial_requested', 'follow_up_needed', 'not_interested', 'not_eligible', 'do_not_contact', 'wrong_contact'] as const;
export type Outcome = typeof outcomes[number];
export const outcomeLabels: Record<Outcome, string> = {
  incomplete: 'Incomplete', trial_requested: 'Trial requested', follow_up_needed: 'Follow-up needed',
  not_interested: 'Not interested', not_eligible: 'Not eligible', do_not_contact: 'Do not contact', wrong_contact: 'Wrong contact',
};
export interface TrialRequest {
  request_id: string;
  course_id: string;
  preferred_time: string;
  status: 'request_received';
  created_at: string;
}
export interface FollowUpResult {
  result_id: string;
  session_id: string;
  lead_id: string;
  parent_name: string;
  contact: string;
  source: string;
  child_age?: number;
  experience: string;
  goals: string;
  preferred_times: string;
  outcome: Outcome;
  reason: string;
  summary: string;
  next_action: string;
  callback_at: string;
  follow_up_consent: boolean;
  trial_request?: TrialRequest;
  created_at: string;
  updated_at: string;
  ended_at?: string;
}
