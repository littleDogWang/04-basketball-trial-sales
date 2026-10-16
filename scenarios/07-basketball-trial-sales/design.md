# Parent trial follow-up design

## Business goal

Convert a previously submitted parent inquiry into qualified interest and an actionable trial request, or a saved reason why no request was made. The existing basketball course context remains. New lead acquisition and reminders for confirmed trials are separate workflows.

## Starting context and flow

The selected lead provides parent name, contact, inquiry source, course interest and known child age. The entry Dialog tells the user to speak as that parent. Riley confirms availability and interest, collects only missing child experience, goals and time preferences, checks course eligibility, proposes an exact configured time, and requests explicit agreement before submitting.

Tools save progressive information, so an interrupted session retains known details. They are bound to the session created by the server, not a model-selected lead ID. Submission atomically stores the request and follow-up result; only an actual request receipt produces `trial_requested`. Ending the browser conversation preserves that result or marks the existing incomplete record ended.

## Required result

Every session has a result ID, original lead/session identity, parent/contact, known child needs, outcome, factual summary, reason, agreed next action, callback preference when supplied, and saved timestamps. A received trial adds request ID, course, exact time and `request_received` status. See [route and field details](README.md).

Outcomes: incomplete, trial requested, follow-up needed, not interested, not eligible, do not contact, wrong contact. No suitable time is a follow-up opportunity only if the parent agrees. Unknown answers remain missing. Declines and do-not-contact clear callback instructions. A saved next action does not imply an advisor was notified.

## Interface and storage

Scenario identity remains visible after dismissing the initial Dialog. The main workspace contains the existing inquiry, saved result and advisor history. Actual agent-ui Button/Badge source, adapted native Dialog composition, and its theme/styles are used; see `styles/agent-ui/PROVENANCE.md`. The voice client retains the official quickstart RTC/RTM lifecycle.

One atomic file per session persists across reload/restart on local persistent disk. Received requests and results share the same write. The interface polls during a call and reloads the result on end. Errors remain visible and saving can be retried in the same session.

## Scope and failure behavior

Fixed course data, fictional lead, Web/RTC voice, durable local results, and advisor-readable history. No real CRM, SIP, telephone campaign, SMS, payment, seat reservation, or staffed human transfer. Missing callback configuration blocks voice startup. Failures never become successful saves or confirmed bookings. Multi-process/serverless production persistence is outside this local file store.
