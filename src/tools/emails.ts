import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListEmailTemplatesInput = z.object({
  campaignId: z.string().optional().describe("Optional campaign ID to restrict templates."),
  folderId: z.string().optional().describe("Optional folder ID to restrict templates."),
  search: z.string().optional().describe("Optional email template search text."),
});

const ListEmailSchedulesInput = z.object({
  campaignId: z.string().optional().describe("Optional campaign ID to restrict scheduled emails."),
  status: z.string().optional().describe("Optional schedule status filter."),
});

export function registerEmailTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_email_templates",
    "List GoHighLevel email builder templates.",
    ListEmailTemplatesInput.shape,
    async (params) =>
      withToolErrorHandling("list email templates", async () => {
        const result = await client.listEmailTemplates(params);
        const templates = (result as { templates?: unknown[] }).templates ?? [];
        return formatToolResult(
          `Retrieved ${templates.length} email template${templates.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "list_email_schedules",
    "List GoHighLevel scheduled emails.",
    ListEmailSchedulesInput.shape,
    async (params) =>
      withToolErrorHandling("list email schedules", async () => {
        const result = await client.listEmailSchedules(params);
        const schedules = (result as { schedules?: unknown[] }).schedules ?? [];
        return formatToolResult(
          `Retrieved ${schedules.length} email schedule${schedules.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );
}
