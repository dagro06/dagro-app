export type IntegrationProvider =
  | "clickup"
  | "slack"
  | "outlook"
  | "notion"
  | "gdrive";

export type MessageSource =
  | "slack"
  | "outlook"
  | "notion";

export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface IntegrationConfig {
  provider: IntegrationProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
  scopes?: string[];
}

export interface UnifiedMessage {
  id: string;
  source: MessageSource;
  sourceId: string;
  content: string;
  sender: string;
  senderEmail?: string;
  senderAvatar?: string;
  subject?: string;
  receivedAt: Date;
  isRead: boolean;
  isArchived: boolean;
  metadata?: Record<string, unknown>;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  sourceMessageId?: string;
  aiGenerated: boolean;
  position: number;
  createdAt: Date;
}

export interface AITaskSuggestion {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  confidence: number;
}

export interface ExtractTasksResponse {
  tasks: AITaskSuggestion[];
  summary?: string;
}

export interface IntegrationStatus {
  provider: IntegrationProvider;
  isConnected: boolean;
  accountName?: string;
  lastSync?: Date;
  error?: string;
}

export interface OAuthCallbackParams {
  code: string;
  state?: string;
  error?: string;
  error_description?: string;
}
