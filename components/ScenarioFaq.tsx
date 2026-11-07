'use client';

import { ChevronDown } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

const questions = [
  {
    "question": "How do I start a conversation?",
    "answer": "Choose Start parent follow-up and allow microphone access when your browser asks. Speak in English and describe what you need. You can mute the microphone or end the conversation with the voice controls."
  },
  {
    "question": "What should I say?",
    "answer": "Share the child’s age range, basketball experience and interests without using their legal name. For example: “My eight-year-old is new to basketball. What would a beginner trial involve?” Ask about the example curriculum or discuss whether it may be suitable."
  },
  {
    "question": "Is this a real basketball course?",
    "answer": "The course and curriculum are fictional examples for a parent follow-up conversation. The assistant can explain the configured program and discuss concerns, but has no current class availability, fees or enrollment records."
  },
  {
    "question": "Can I reserve a trial or request a callback?",
    "answer": "No. This demo cannot reserve a place, submit a trial request, enroll a child or arrange a callback. Ask for a verbal recap, then contact the actual course provider. No phone number, home address or child’s health history is needed here."
  },
  {
    "question": "Can I change what I said?",
    "answer": "Yes. Tell the assistant which detail to correct, ask it to repeat or clarify an answer, or request a verbal recap. Details are used within the current conversation; this demo does not save business results or remember them across sessions."
  },
  {
    "question": "What if my microphone does not work?",
    "answer": "Check that microphone access is allowed for this page and that the correct input device is selected in your browser or system settings. Make sure the microphone is not muted, then try Start parent follow-up again."
  }
];

export function ScenarioFaq() {
  return (
    <DialogContent className="demo-inspector demo-faq-drawer">
      <DialogHeader className="demo-faq-heading">
        <DialogTitle>Frequently asked questions</DialogTitle>
        <DialogDescription>How to get started, what to ask, and what to expect.</DialogDescription>
      </DialogHeader>
      <div className="demo-faq-list">
        {questions.map(({ question, answer }) => (
          <details className="demo-faq-item" key={question}>
            <summary>
              <span>{question}</span>
              <ChevronDown className="demo-faq-chevron" size={16} aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </DialogContent>
  );
}
