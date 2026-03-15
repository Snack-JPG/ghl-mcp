import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListUsersInput = z.object({
  role: z.string().optional().describe("Optional role filter."),
});

const GetUserInput = z.object({
  userId: z.string().min(1).describe("The GoHighLevel user ID to retrieve."),
});

export function registerUserTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_users",
    "List users or team members in the configured GoHighLevel location.",
    ListUsersInput.shape,
    async (params) =>
      withToolErrorHandling("list users", async () => {
      const result = await client.listUsers(params);
      const users = result.users ?? [];
      return formatToolResult(
        `Retrieved ${users.length} user${users.length === 1 ? "" : "s"}.`,
        result,
      );
      }),
  );

  server.tool(
    "get_user",
    "Get a single GoHighLevel user by ID.",
    GetUserInput.shape,
    async ({ userId }) =>
      withToolErrorHandling(`get user ${userId}`, async () => {
      const result = await client.getUser(userId);
      return formatToolResult(`Retrieved user ${userId}.`, result);
      }),
  );
}
