import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListCampaignsInput = z.object({
  status: z.string().optional().describe("Optional campaign status filter."),
  search: z.string().optional().describe("Optional campaign search text."),
});

export function registerCampaignTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_campaigns",
    "List GoHighLevel campaigns for the configured location.",
    ListCampaignsInput.shape,
    async (params) =>
      withToolErrorHandling("list campaigns", async () => {
        const result = await client.listCampaigns(params);
        const campaigns = (result as { campaigns?: unknown[] }).campaigns ?? [];
        return formatToolResult(
          `Retrieved ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );
}
