'use client';
import { Badge } from '@/components/ui/badge';
import { outcomeLabels, type FollowUpResult } from '@/scenarios/07-basketball-trial-sales/result-types';
export function FollowUpResultPanel({ result }: { result?: FollowUpResult }) {
  if (!result) return <section className="follow-up-card result-empty"><span className="eyebrow">FOLLOW-UP RESULT</span><h2>A conversation with a clear next step.</h2><p>Discuss the family’s needs, their decision, and the next step. Connected tools can save the agreed outcome.</p><div className="result-preview"><span>01 · Understand the family</span><span>02 · Find a suitable trial</span><span>03 · Review the next step</span></div><p className="small-note">No follow-up selected. Start a call or open a saved result below.</p></section>;
  const missing = [!result.child_age && 'Child age', !result.experience && 'Experience', !result.goals && 'Learning goals', !result.preferred_times && 'Time preferences'].filter(Boolean);
  const time = result.trial_request?.preferred_time;
  const formatTime = (value: string) => new Intl.DateTimeFormat('en', { timeZone: 'Asia/Shanghai', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  return <section className="follow-up-card" aria-label="Saved follow-up result">
    <div className="result-heading"><div><span className="eyebrow">FOLLOW-UP RESULT</span><h2>{outcomeLabels[result.outcome]}</h2></div><Badge variant={result.outcome === 'trial_requested' ? 'default' : 'secondary'}>{result.ended_at ? 'Conversation ended' : 'Saved progress'}</Badge></div>
    <p className="result-summary">{result.summary}</p>
    <dl className="result-fields">
      <div><dt>Parent / contact</dt><dd>{result.parent_name}<br />{result.contact}</dd></div>
      <div><dt>Child’s age</dt><dd>{result.child_age ? `${result.child_age} years` : 'Not recorded'}</dd></div>
      <div><dt>Experience</dt><dd>{result.experience || 'Not recorded'}</dd></div>
      <div><dt>Learning goals</dt><dd>{result.goals || 'Not recorded'}</dd></div>
      <div><dt>Time preferences</dt><dd>{result.preferred_times || 'Not recorded'}</dd></div>
      {result.reason && <div><dt>Reason</dt><dd>{result.reason}</dd></div>}
    </dl>
    {missing.length > 0 && <p className="small-note">Not yet recorded: {missing.join(', ')}.</p>}
    {result.trial_request && <div className="request-receipt"><Badge>Request received</Badge><h3>{time && formatTime(time)} · Asia/Shanghai</h3><p>{result.trial_request.course_id}</p><p className="small-note">Request ID: {result.trial_request.request_id}</p><p>Awaiting course advisor confirmation. A seat has not been reserved.</p></div>}
    <div className="next-action"><span className="eyebrow">NEXT STEP</span><p>{result.next_action || (result.outcome === 'incomplete' ? 'No next action agreed yet.' : 'No further contact agreed.')}</p>{result.callback_at && <p>Requested callback: {result.callback_at}</p>}<p className="small-note">Follow-up contact agreed: {result.follow_up_consent ? 'Yes' : 'Not recorded'}. No advisor notification or live transfer is implied.</p></div>
    <details className="result-reference"><summary>Record details</summary><p>Lead: {result.lead_id}</p><p>Result / session: {result.result_id}</p><p>Saved: {formatTime(result.updated_at)} · Asia/Shanghai</p></details>
  </section>;
}
