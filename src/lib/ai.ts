import Anthropic from "@anthropic-ai/sdk";
import { AITaskSuggestion, ExtractTasksResponse } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function extractTasksFromMessage(
  content: string,
  sender?: string,
  subject?: string
): Promise<ExtractTasksResponse> {
  const contextInfo = [
    subject ? `Subject: ${subject}` : "",
    sender ? `From: ${sender}` : "",
    `Content: ${content}`,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Analyze the following message and extract any actionable tasks or action items. For each task, provide:
- A clear, concise title
- An optional description with more details
- Priority (low, medium, high, or urgent)
- Due date if mentioned (in ISO format)
- Confidence score (0-1) for how certain you are this is a real task

Message:
${contextInfo}

Respond in JSON format:
{
  "tasks": [
    {
      "title": "string",
      "description": "string or null",
      "priority": "low" | "medium" | "high" | "urgent",
      "dueDate": "ISO date string or null",
      "confidence": number between 0 and 1
    }
  ],
  "summary": "brief summary of the message"
}

If there are no actionable tasks, return an empty tasks array.`,
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { tasks: [], summary: "Could not parse response" };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      tasks: (parsed.tasks || []).map((task: AITaskSuggestion) => ({
        title: task.title,
        description: task.description || undefined,
        priority: task.priority || "medium",
        dueDate: task.dueDate || undefined,
        confidence: task.confidence || 0.5,
      })),
      summary: parsed.summary,
    };
  } catch {
    console.error("Failed to parse AI response:", responseText);
    return { tasks: [], summary: "Failed to parse response" };
  }
}

export async function summarizeMessages(
  messages: Array<{ content: string; sender: string; subject?: string }>
): Promise<string> {
  const messageList = messages
    .map(
      (m, i) =>
        `${i + 1}. From: ${m.sender}${m.subject ? ` | Subject: ${m.subject}` : ""}\n${m.content}`
    )
    .join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Provide a brief summary of the following messages, highlighting key points and any action items:

${messageList}

Keep the summary concise (2-3 sentences max).`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "Unable to generate summary";
}

export async function suggestReply(
  messageContent: string,
  context?: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Based on the following message, suggest a professional reply:

Message:
${messageContent}

${context ? `Additional context: ${context}` : ""}

Provide a brief, professional reply that addresses the main points of the message.`,
      },
    ],
  });

  return response.content[0].type === "text"
    ? response.content[0].text
    : "Unable to generate reply suggestion";
}
