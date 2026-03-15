export interface GhlApiErrorPayload {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  [key: string]: unknown;
}

export class GhlApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  public constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = "GhlApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface GhlListMeta {
  total?: number;
  currentPage?: number;
  nextPage?: number | null;
  startAfterId?: string | null;
  [key: string]: unknown;
}

export interface GhlPaginatedResponse<TItem, TKey extends string> {
  meta?: GhlListMeta;
  [key: string]: TItem[] | GhlListMeta | unknown;
}

export interface Contact {
  id: string;
  locationId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  notes?: string[];
  customFields?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface ContactNote {
  id?: string;
  body?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface Opportunity {
  id: string;
  locationId?: string;
  contactId?: string;
  pipelineId?: string;
  pipelineStageId?: string;
  name?: string;
  monetaryValue?: number;
  status?: string;
  assignedTo?: string;
  [key: string]: unknown;
}

export interface Pipeline {
  id: string;
  name?: string;
  locationId?: string;
  stages?: PipelineStage[];
  [key: string]: unknown;
}

export interface PipelineStage {
  id: string;
  name?: string;
  position?: number;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  contactId?: string;
  locationId?: string;
  status?: string;
  unreadCount?: number;
  lastMessageBody?: string;
  [key: string]: unknown;
}

export interface ConversationMessage {
  id?: string;
  conversationId?: string;
  contactId?: string;
  type?: string;
  direction?: string;
  body?: string;
  dateAdded?: string;
  [key: string]: unknown;
}

export interface Calendar {
  id: string;
  name?: string;
  groupId?: string;
  locationId?: string;
  [key: string]: unknown;
}

export interface CalendarEvent {
  id?: string;
  calendarId?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  contactId?: string;
  [key: string]: unknown;
}

export interface Workflow {
  id: string;
  name?: string;
  status?: string;
  locationId?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export interface ToolResponsePayload {
  summary: string;
  data: unknown;
}

export interface GhlClientConfig {
  apiToken: string;
  locationId: string;
  baseUrl?: string;
  minRequestIntervalMs?: number;
}

export interface RequestOptions {
  query?: Record<string, unknown> | undefined;
  body?: unknown;
  includeLocationId?: boolean;
}

export type JsonObject = Record<string, unknown>;

export function formatToolResult(summary: string, data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ summary, data }, null, 2),
      },
    ],
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function withToolErrorHandling(
  action: string,
  task: () => Promise<ReturnType<typeof formatToolResult>>,
) {
  try {
    return await task();
  } catch (error) {
    const normalized =
      error instanceof GhlApiError
        ? {
            statusCode: error.statusCode,
            message: error.message,
            details: error.details,
          }
        : {
            message: error instanceof Error ? error.message : `Unknown error during ${action}.`,
          };

    return formatToolResult(`Failed to ${action}.`, normalized);
  }
}
