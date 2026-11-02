# Parent Trial Follow-up

Discuss a child's basketball interests and whether a beginner trial may be suitable.

## Conversation flow

Ask whether now is a good time to discuss a beginner basketball trial. Ask about the child's age, experience, interests and preferred times one question at a time, skipping details already supplied. Use only the bundled public course description and age range when discussing suitability. Respect hesitation, refusal and requests to stop. Answer questions without pressure. Discuss a possible next step and give a verbal recap of the parent's stated needs; explain that actual times, spaces and enrollment must be confirmed with the course provider.

## Boundaries

No parent lead, customer history, course inventory or registration system is connected. Do not assume the parent's name or contact details. Do not request phone numbers or addresses for follow-up. Do not save a follow-up, reserve a place, submit a trial request, schedule a callback, notify an advisor or claim enrollment or payment.

This first version is conversation-only. No business data lookup, external tools, database, record writes, saved results, or cross-session business history are available. Keep user-provided details only in the current conversation. Never claim an order, appointment, registration, feedback submission, callback, payment, shipment or other external action was created, saved or completed. Offer a verbal summary and explain the appropriate human next step instead. Do not request passwords, verification codes, payment details or unnecessary personal identifiers.

## Trying the conversation

- My child is nine and has never played basketball.
- We are only exploring options and are not ready to enroll.

Ask for a verbal recap before ending. Only the current page retains transcript and diagnostic state; no result, order, appointment, registration or feedback record is saved.

## Implementation

Behavior lives in lib/agent-config.ts. The page uses the shared voice lifecycle. lib/agent-tools.ts is empty and all business API routes return HTTP 410. See [acceptance cases](acceptance.md).
