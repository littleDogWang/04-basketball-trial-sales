import type { ScenarioPresentation } from '@/types/presentation';
export type { ScenarioPresentation } from '@/types/presentation';

export const presentation: ScenarioPresentation = {
  "id": "07-basketball-trial-sales",
  "name": "Parent Trial Follow-up",
  "purpose": "Family needs and basketball trial interest",
  "headline": [
    "From interest to next steps."
  ],
  "summary": "Discuss your family’s needs with Riley and find a suitable basketball trial.",
  "featuresHeading": "Beyond starter",
  "features": [
    {
      "emoji": "🏀",
      "title": "Existing parent inquiry"
    },
    {
      "emoji": "🧭",
      "title": "Suitable trial guidance"
    },
    {
      "emoji": "📝",
      "title": "Saved follow-up results"
    }
  ],
  "builtWith": [
    "Agora Conversational AI",
    "Agents SDK",
    "Next.js"
  ],
  "startLabel": "Start parent follow-up",
  "boundaryShort": "Connected tools can save the agreed outcome. Trial requests need advisor confirmation.",
  "outcomes": [
    {
      "id": "clear",
      "label": "I understand the next step"
    },
    {
      "id": "needs-help",
      "label": "I need advisor help"
    }
  ],
  "developer": {
    "sourceUrl": "https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs",
    "runCommand": "pnpm install\nagora login\nagora project use <your-project>\nagora project env write .env.local\npnpm dev",
    "skillsCommand": "npx skills add github:AgoraIO/skills",
    "assistantPrompt": "Use Agora Skills to work in the existing 07-basketball-trial-sales scenario checkout. Preserve the working Agora session lifecycle and business contracts. Help me adapt its business data and assistant instructions for my workflow.",
    "docsUrl": "https://docs.agora.io/en/ai/build/build-server-client",
    "sdkUrl": "https://www.npmjs.com/package/agora-agents",
    "consoleUrl": "https://console.agora.io/",
    "cliUrl": "https://github.com/AgoraIO/cli",
    "skillsUrl": "https://github.com/AgoraIO/skills",
    "extensionPoints": [
      {
        "title": "Change assistant instructions",
        "path": "lib/agent-config.ts"
      },
      {
        "title": "Adapt courses.ts",
        "path": "lib/basketball-trial-sales/courses.ts"
      },
      {
        "title": "Adapt leads.ts",
        "path": "lib/basketball-trial-sales/leads.ts"
      },
      {
        "title": "Choose models and voice",
        "path": "app/api/invite-agent/route.ts"
      },
      {
        "title": "Adapt scenario UI content",
        "path": "lib/presentation.ts"
      }
    ]
  }
};

export function getScenarioPresentation(): ScenarioPresentation {
  return presentation;
}
