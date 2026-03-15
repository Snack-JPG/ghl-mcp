#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { GhlClient } from "./client.js";
import { registerCalendarTools } from "./tools/calendars.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerOpportunityTools } from "./tools/opportunities.js";
import { registerUserTools } from "./tools/users.js";
import { registerWorkflowTools } from "./tools/workflows.js";

const server = new McpServer({
  name: "@snackjpg/ghl-mcp",
  version: "1.0.0",
});

const client = new GhlClient();

registerContactTools(server, client);
registerOpportunityTools(server, client);
registerConversationTools(server, client);
registerCalendarTools(server, client);
registerWorkflowTools(server, client);
registerUserTools(server, client);

process.on("uncaughtException", (error) => {
  console.error("[ghl-mcp] Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[ghl-mcp] Unhandled rejection:", reason);
  process.exit(1);
});

const transport = new StdioServerTransport();

await server.connect(transport);
