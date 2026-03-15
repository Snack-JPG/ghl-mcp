import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListFormsInput = z.object({
  name: z.string().optional().describe("Optional form name filter."),
});

const ListFunnelsInput = z.object({
  name: z.string().optional().describe("Optional funnel name filter."),
});

const ListFunnelPagesInput = z.object({
  funnelId: z.string().optional().describe("Optional funnel ID to restrict the returned pages."),
  name: z.string().optional().describe("Optional funnel page name filter."),
});

export function registerFormTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_forms",
    "List GoHighLevel forms for the configured location.",
    ListFormsInput.shape,
    async (params) =>
      withToolErrorHandling("list forms", async () => {
        const result = await client.listForms(params);
        const forms = (result as { forms?: unknown[] }).forms ?? [];
        return formatToolResult(
          `Retrieved ${forms.length} form${forms.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "list_funnels",
    "List GoHighLevel funnels for the configured location.",
    ListFunnelsInput.shape,
    async (params) =>
      withToolErrorHandling("list funnels", async () => {
        const result = await client.listFunnels(params);
        const funnels = (result as { funnels?: unknown[] }).funnels ?? [];
        return formatToolResult(
          `Retrieved ${funnels.length} funnel${funnels.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "list_funnel_pages",
    "List GoHighLevel funnel pages.",
    ListFunnelPagesInput.shape,
    async (params) =>
      withToolErrorHandling("list funnel pages", async () => {
        const result = await client.listFunnelPages(params);
        const pages = (result as { pages?: unknown[] }).pages ?? [];
        return formatToolResult(
          `Retrieved ${pages.length} funnel page${pages.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );
}
