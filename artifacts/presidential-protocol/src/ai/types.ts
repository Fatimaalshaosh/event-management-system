export type AssistantReply = {
  analysis: string;
  sections: Array<{ title: string; body: string }>;
  risks: Array<{
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    impact: string;
    mitigation: string;
  }>;
  nextActions: Array<{ label: string; prompt: string }>;
};

export type ChatMessage =
  | { role: "user"; text: string }
  | { role: "assistant"; reply: AssistantReply; reportTitle: string };

export type PageContext = {
  page: string;
  titleAr: string;
  titleEn: string;
  data?: Record<string, unknown>;
  suggestions?: Array<{ labelAr: string; labelEn: string; prompt: string }>;
};
