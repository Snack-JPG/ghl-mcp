import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListSocialPostsInput = z.object({
  accountId: z.string().optional().describe("Optional social account ID to restrict posts."),
  status: z.string().optional().describe("Optional social post status filter."),
  startDate: z.string().optional().describe("Optional lower date bound in ISO-8601 format."),
  endDate: z.string().optional().describe("Optional upper date bound in ISO-8601 format."),
});

const CreateSocialPostInput = z.object({
  accountIds: z.array(z.string()).min(1).describe("One or more connected social account IDs to publish or schedule to."),
  text: z.string().min(1).describe("The post caption or text content."),
  scheduledAt: z.string().optional().describe("Optional ISO-8601 datetime to schedule the post instead of publishing immediately."),
  mediaUrls: z.array(z.string()).optional().describe("Optional media asset URLs to attach to the post."),
  title: z.string().optional().describe("Optional post title if the API supports it."),
});

const ListSocialAccountsInput = z.object({
  platform: z.string().optional().describe("Optional platform filter such as facebook, instagram, or linkedin."),
});

const GetSocialStatsInput = z.object({
  accountId: z.string().optional().describe("Optional social account ID to restrict statistics."),
  startDate: z.string().optional().describe("Optional statistics range start in ISO-8601 format."),
  endDate: z.string().optional().describe("Optional statistics range end in ISO-8601 format."),
  platform: z.string().optional().describe("Optional platform filter."),
});

export function registerSocialTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_social_posts",
    "List GoHighLevel social posts for the configured location.",
    ListSocialPostsInput.shape,
    async (params) =>
      withToolErrorHandling("list social posts", async () => {
        const result = await client.listSocialPosts(params);
        const posts = (result as { posts?: unknown[] }).posts ?? [];
        return formatToolResult(
          `Retrieved ${posts.length} social post${posts.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "create_social_post",
    "Create or schedule a GoHighLevel social post.",
    CreateSocialPostInput.shape,
    async (params) =>
      withToolErrorHandling("create a social post", async () => {
        const result = await client.createSocialPost(params);
        return formatToolResult("Created social post successfully.", result);
      }),
  );

  server.tool(
    "list_social_accounts",
    "List connected GoHighLevel social accounts.",
    ListSocialAccountsInput.shape,
    async (params) =>
      withToolErrorHandling("list social accounts", async () => {
        const result = await client.listSocialAccounts(params);
        const accounts = (result as { accounts?: unknown[] }).accounts ?? [];
        return formatToolResult(
          `Retrieved ${accounts.length} social account${accounts.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "get_social_stats",
    "Get GoHighLevel social account or post statistics.",
    GetSocialStatsInput.shape,
    async (params) =>
      withToolErrorHandling("get social statistics", async () => {
        const result = await client.getSocialStats(params);
        return formatToolResult("Retrieved social statistics.", result);
      }),
  );
}
