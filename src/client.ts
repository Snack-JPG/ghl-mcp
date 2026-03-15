import {
  Contact,
  ContactNote,
  Conversation,
  ConversationMessage,
  GhlApiError,
  GhlApiErrorPayload,
  GhlClientConfig,
  JsonObject,
  Pipeline,
  RequestOptions,
  User,
  Workflow,
} from "./types.js";

const DEFAULT_BASE_URL = "https://services.leadconnectorhq.com";
const DEFAULT_MIN_REQUEST_INTERVAL_MS = 650;

export class GhlClient {
  private readonly apiToken: string;
  private readonly locationId: string;
  private readonly baseUrl: string;
  private readonly minRequestIntervalMs: number;
  private lastRequestAt = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  public constructor(config?: Partial<GhlClientConfig>) {
    const apiToken = config?.apiToken ?? process.env.GHL_API_TOKEN;
    const locationId = config?.locationId ?? process.env.GHL_LOCATION_ID;

    if (!apiToken) {
      throw new Error("Missing GHL_API_TOKEN environment variable.");
    }

    if (!locationId) {
      throw new Error("Missing GHL_LOCATION_ID environment variable.");
    }

    this.apiToken = apiToken;
    this.locationId = locationId;
    this.baseUrl = config?.baseUrl ?? DEFAULT_BASE_URL;
    this.minRequestIntervalMs =
      config?.minRequestIntervalMs ?? DEFAULT_MIN_REQUEST_INTERVAL_MS;
  }

  public async getContact(contactId: string) {
    return this.request<{ contact?: Contact }>("GET", `/contacts/${contactId}`);
  }

  public async searchContacts(params: Record<string, unknown>) {
    return this.request("GET", "/contacts/", { query: params });
  }

  public async createContact(body: Record<string, unknown>) {
    return this.request("POST", "/contacts/", { body });
  }

  public async updateContact(contactId: string, body: Record<string, unknown>) {
    return this.request("PUT", `/contacts/${contactId}`, { body, includeLocationId: false });
  }

  public async deleteContact(contactId: string) {
    return this.request("DELETE", `/contacts/${contactId}`, { includeLocationId: false });
  }

  public async advancedSearchContacts(body: Record<string, unknown>) {
    return this.request("POST", "/contacts/search", { body });
  }

  public async getContactTasks(contactId: string, query?: Record<string, unknown>) {
    return this.request("GET", `/contacts/${contactId}/tasks`, { query });
  }

  public async addContactTags(contactId: string, tags: string[]) {
    return this.request("POST", `/contacts/${contactId}/tags`, {
      body: { tags },
      includeLocationId: false,
    });
  }

  public async removeContactTags(contactId: string, tags: string[]) {
    return this.request("DELETE", `/contacts/${contactId}/tags`, {
      body: { tags },
      includeLocationId: false,
    });
  }

  public async getContactNotes(contactId: string, query?: Record<string, unknown>) {
    return this.request<{ notes?: ContactNote[] }>(
      "GET",
      `/contacts/${contactId}/notes`,
      { query, includeLocationId: false },
    );
  }

  public async createContactNote(contactId: string, body: Record<string, unknown>) {
    return this.request("POST", `/contacts/${contactId}/notes`, { body, includeLocationId: false });
  }

  public async searchOpportunities(params: Record<string, unknown>) {
    // GHL opportunities search uses location_id (snake_case) instead of locationId
    const query = { ...params, location_id: params.location_id ?? this.locationId };
    return this.request("GET", "/opportunities/search", { query, includeLocationId: false });
  }

  public async getOpportunity(opportunityId: string) {
    return this.request("GET", `/opportunities/${opportunityId}`);
  }

  public async createOpportunity(body: Record<string, unknown>) {
    return this.request("POST", "/opportunities/", { body });
  }

  public async updateOpportunity(opportunityId: string, body: Record<string, unknown>) {
    return this.request("PUT", `/opportunities/${opportunityId}`, { body, includeLocationId: false });
  }

  public async deleteOpportunity(opportunityId: string) {
    return this.request("DELETE", `/opportunities/${opportunityId}`, { includeLocationId: false });
  }

  public async updateOpportunityStatus(
    opportunityId: string,
    body: Record<string, unknown>,
  ) {
    return this.request("PUT", `/opportunities/${opportunityId}/status`, { body, includeLocationId: false });
  }

  public async listPipelines(query?: Record<string, unknown>) {
    const pipelinesResponse = await this.request<{ pipelines?: Pipeline[] }>(
      "GET",
      "/opportunities/pipelines",
      { query },
    );

    const pipelines = pipelinesResponse.pipelines ?? [];
    const enrichedPipelines = await Promise.all(
      pipelines.map(async (pipeline) => {
        const stages = await this.getPipelineStages(pipeline.id);
        return {
          ...pipeline,
          stages:
            (stages as { stages?: unknown[]; pipeline?: { stages?: unknown[] } }).stages ??
            (stages as { pipeline?: { stages?: unknown[] } }).pipeline?.stages ??
            [],
        };
      }),
    );

    return {
      ...pipelinesResponse,
      pipelines: enrichedPipelines,
    };
  }

  public async getPipelineStages(pipelineId: string) {
    return this.request("GET", `/opportunities/pipelines/${pipelineId}`);
  }

  public async searchConversations(params: Record<string, unknown>) {
    return this.request("GET", "/conversations/search", { query: params });
  }

  public async getConversation(conversationId: string) {
    return this.request<{ conversation?: Conversation }>(
      "GET",
      `/conversations/${conversationId}`,
    );
  }

  public async createConversation(body: Record<string, unknown>) {
    return this.request("POST", "/conversations/", { body });
  }

  public async updateConversation(
    conversationId: string,
    body: Record<string, unknown>,
  ) {
    return this.request("PUT", `/conversations/${conversationId}`, { body, includeLocationId: false });
  }

  public async sendMessage(body: Record<string, unknown>) {
    return this.request("POST", "/conversations/messages", { body });
  }

  public async getConversationMessages(
    conversationId: string,
    query?: Record<string, unknown>,
  ) {
    return this.request<{ messages?: ConversationMessage[] }>(
      "GET",
      `/conversations/${conversationId}/messages`,
      { query },
    );
  }

  public async listCalendars(query?: Record<string, unknown>) {
    return this.request("GET", "/calendars/", { query });
  }

  public async getCalendar(calendarId: string) {
    return this.request("GET", `/calendars/${calendarId}`);
  }

  public async listEvents(query?: Record<string, unknown>) {
    return this.request("GET", "/calendars/events", { query });
  }

  public async createEvent(body: Record<string, unknown>) {
    return this.request("POST", "/calendars/events", { body });
  }

  public async updateEvent(eventId: string, body: Record<string, unknown>) {
    return this.request("PUT", `/calendars/events/${eventId}`, { body, includeLocationId: false });
  }

  public async getAvailableSlots(query: Record<string, unknown>) {
    return this.request("GET", "/calendars/events/slots", { query });
  }

  public async listWorkflows(query?: Record<string, unknown>) {
    return this.request<{ workflows?: Workflow[] }>("GET", "/workflows/", { query });
  }

  public async triggerWorkflow(workflowId: string, body: Record<string, unknown>) {
    return this.request("POST", `/workflows/${workflowId}/trigger`, { body });
  }

  public async listUsers(query?: Record<string, unknown>) {
    return this.request<{ users?: User[] }>("GET", "/users/", { query });
  }

  public async getUser(userId: string) {
    return this.request<{ user?: User }>("GET", `/users/${userId}`);
  }

  public getLocationId() {
    return this.locationId;
  }

  private async request<TResponse = JsonObject>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<TResponse> {
    await this.waitForRateLimit();

    const url = new URL(path, this.baseUrl);
    const query = this.withLocationId(options.query, options.includeLocationId !== false) ?? {};
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
        continue;
      }

      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: options.body === undefined ? null : JSON.stringify(this.withLocationId(options.body, options.includeLocationId !== false)),
    });

    const responseText = await response.text();
    const parsed = responseText ? this.tryParseJson(responseText) : undefined;

    if (!response.ok) {
      const errorPayload = parsed as GhlApiErrorPayload | undefined;
      const apiMessage = Array.isArray(errorPayload?.message)
        ? errorPayload.message.join(", ")
        : errorPayload?.message;

      throw new GhlApiError(
        apiMessage ?? `GoHighLevel API request failed with status ${response.status}.`,
        response.status,
        errorPayload ?? responseText,
      );
    }

    return (parsed ?? ({} as TResponse)) as TResponse;
  }

  private withLocationId<TValue>(value: TValue, includeLocationId = true): TValue {
    if (!includeLocationId || value === undefined || value === null) {
      return value;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "object") {
      return {
        ...(value as Record<string, unknown>),
        locationId:
          (value as { locationId?: unknown }).locationId ?? this.locationId,
      } as TValue;
    }

    return value;
  }

  private tryParseJson(text: string): unknown {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  private async waitForRateLimit() {
    const previous = this.requestQueue;
    let release!: () => void;

    this.requestQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;

    const elapsed = Date.now() - this.lastRequestAt;
    const delay = Math.max(0, this.minRequestIntervalMs - elapsed);
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequestAt = Date.now();
    release();
  }
}
