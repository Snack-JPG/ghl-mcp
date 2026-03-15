import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const SearchConversationsInput = z.object({
  query: z.string().optional().describe("Search text for matching conversations."),
  contactId: z.string().optional().describe("Optional contact ID to restrict conversations."),
  assignedTo: z.string().optional().describe("Optional user ID assigned to the conversation."),
  status: z.string().optional().describe("Optional status filter such as open, unread, or closed."),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of conversations to return."),
  offset: z.number().int().min(0).default(0).describe("Pagination offset for conversations."),
});

const GetConversationInput = z.object({
  conversationId: z.string().min(1).describe("The GoHighLevel conversation ID to retrieve."),
});

const GetConversationMessagesInput = z.object({
  conversationId: z.string().min(1).describe("The conversation ID whose messages should be listed."),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of messages to return."),
  offset: z.number().int().min(0).default(0).describe("Pagination offset for messages."),
});

const SendMessageInput = z.object({
  contactId: z.string().optional().describe("The contact ID to message. Supply this or a conversation ID."),
  conversationId: z.string().optional().describe("Existing conversation ID for the message thread."),
  type: z.string().min(1).describe("Message channel type such as SMS, Email, WhatsApp, or LiveChat."),
  message: z.string().min(1).describe("Message body content to send."),
  subject: z.string().optional().describe("Optional subject line, typically for email messages."),
  emailTo: z.string().email().optional().describe("Optional recipient email address when sending email."),
  html: z.string().optional().describe("Optional HTML version of the message body."),
  attachments: z.array(z.record(z.unknown())).optional().describe("Optional attachment payloads expected by the GoHighLevel API."),
});

const CreateConversationInput = z.object({
  contactId: z.string().min(1).describe("The contact ID to start the conversation with."),
  channel: z.string().min(1).describe("Conversation channel such as SMS, Email, WhatsApp, or LiveChat."),
  message: z.string().optional().describe("Optional initial message body for the conversation."),
  assignedTo: z.string().optional().describe("Optional user ID to assign the conversation to."),
});

export function registerConversationTools(server: McpServer, client: GhlClient) {
  server.tool(
    "search_conversations",
    "Search GoHighLevel conversations.",
    SearchConversationsInput.shape,
    async (params) =>
      withToolErrorHandling("search conversations", async () => {
      const result = await client.searchConversations(params);
      const conversations = (result as { conversations?: unknown[] }).conversations ?? [];
      return formatToolResult(
        `Found ${conversations.length} conversation${conversations.length === 1 ? "" : "s"} matching the current filters.`,
        result,
      );
      }),
  );

  server.tool(
    "get_conversation",
    "Get a single GoHighLevel conversation by ID.",
    GetConversationInput.shape,
    async ({ conversationId }) =>
      withToolErrorHandling(`get conversation ${conversationId}`, async () => {
      const result = await client.getConversation(conversationId);
      return formatToolResult(`Retrieved conversation ${conversationId}.`, result);
      }),
  );

  server.tool(
    "get_conversation_messages",
    "List messages in a GoHighLevel conversation.",
    GetConversationMessagesInput.shape,
    async ({ conversationId, limit, offset }) =>
      withToolErrorHandling(`list messages for conversation ${conversationId}`, async () => {
      const result = await client.getConversationMessages(conversationId, { limit, offset });
      const messages = result.messages ?? [];
      return formatToolResult(
        `Retrieved ${messages.length} message${messages.length === 1 ? "" : "s"} from conversation ${conversationId}.`,
        result,
      );
      }),
  );

  server.tool(
    "send_message",
    "Send an SMS, email, or other GoHighLevel conversation message.",
    SendMessageInput.shape,
    async (params) =>
      withToolErrorHandling("send a message", async () => {
      const result = await client.sendMessage(params);
      return formatToolResult("Sent message successfully.", result);
      }),
  );

  server.tool(
    "create_conversation",
    "Start a new GoHighLevel conversation.",
    CreateConversationInput.shape,
    async (params) =>
      withToolErrorHandling("create a conversation", async () => {
      const result = await client.createConversation(params);
      return formatToolResult("Created conversation successfully.", result);
      }),
  );
}
