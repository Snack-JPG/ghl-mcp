import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const SearchOpportunitiesInput = z.object({
  query: z.string().optional().describe("Search text for deal name or related fields."),
  pipelineId: z.string().optional().describe("Optional pipeline ID to restrict results."),
  pipelineStageId: z.string().optional().describe("Optional pipeline stage ID to restrict results."),
  status: z.string().optional().describe("Optional opportunity status filter such as open, won, lost, or abandoned."),
  contactId: z.string().optional().describe("Optional contact ID to restrict opportunities to one contact."),
  assignedTo: z.string().optional().describe("Optional assigned user ID."),
});

const GetOpportunityInput = z.object({
  opportunityId: z.string().min(1).describe("The GoHighLevel opportunity ID to retrieve."),
});

const CreateOpportunityInput = z.object({
  contactId: z.string().min(1).describe("The contact ID this opportunity belongs to."),
  pipelineId: z.string().min(1).describe("The pipeline ID where the opportunity should be created."),
  pipelineStageId: z.string().min(1).describe("The stage ID where the opportunity should be placed."),
  name: z.string().min(1).describe("The opportunity or deal name."),
  monetaryValue: z.number().optional().describe("The monetary value of the opportunity."),
  status: z.string().optional().describe("Initial status such as open, won, lost, or abandoned."),
  assignedTo: z.string().optional().describe("User ID to assign the opportunity to."),
  source: z.string().optional().describe("Lead source or deal source."),
});

const UpdateOpportunityInput = z.object({
  opportunityId: z.string().min(1).describe("The GoHighLevel opportunity ID to update."),
  contactId: z.string().optional().describe("Updated contact ID for the opportunity."),
  pipelineId: z.string().optional().describe("Updated pipeline ID."),
  pipelineStageId: z.string().optional().describe("Updated stage ID within the pipeline."),
  name: z.string().optional().describe("Updated deal name."),
  monetaryValue: z.number().optional().describe("Updated monetary value."),
  status: z.string().optional().describe("Updated status."),
  assignedTo: z.string().optional().describe("Updated assigned user ID."),
  source: z.string().optional().describe("Updated source."),
});

const DeleteOpportunityInput = z.object({
  opportunityId: z.string().min(1).describe("The GoHighLevel opportunity ID to delete."),
});

const UpdateOpportunityStatusInput = z.object({
  opportunityId: z.string().min(1).describe("The GoHighLevel opportunity ID whose status should be changed."),
  status: z.enum(["open", "won", "lost", "abandoned"]).describe("The new opportunity status."),
});

const ListPipelinesInput = z.object({
});

export function registerOpportunityTools(server: McpServer, client: GhlClient) {
  server.tool(
    "search_opportunities",
    "Search GoHighLevel opportunities in a pipeline.",
    SearchOpportunitiesInput.shape,
    async (params) =>
      withToolErrorHandling("search opportunities", async () => {
      const result = await client.searchOpportunities(params);
      const opportunities = (result as { opportunities?: unknown[] }).opportunities ?? [];
      return formatToolResult(
        `Found ${opportunities.length} opportunit${opportunities.length === 1 ? "y" : "ies"} matching the current filters.`,
        result,
      );
      }),
  );

  server.tool(
    "get_opportunity",
    "Get a single GoHighLevel opportunity by ID.",
    GetOpportunityInput.shape,
    async ({ opportunityId }) =>
      withToolErrorHandling(`get opportunity ${opportunityId}`, async () => {
      const result = await client.getOpportunity(opportunityId);
      return formatToolResult(`Retrieved opportunity ${opportunityId}.`, result);
      }),
  );

  server.tool(
    "create_opportunity",
    "Create a new GoHighLevel opportunity.",
    CreateOpportunityInput.shape,
    async (params) =>
      withToolErrorHandling("create an opportunity", async () => {
      const result = await client.createOpportunity(params);
      return formatToolResult("Created opportunity successfully.", result);
      }),
  );

  server.tool(
    "update_opportunity",
    "Update an existing GoHighLevel opportunity.",
    UpdateOpportunityInput.shape,
    async ({ opportunityId, ...updates }) =>
      withToolErrorHandling(`update opportunity ${opportunityId}`, async () => {
      const result = await client.updateOpportunity(opportunityId, updates);
      return formatToolResult(`Updated opportunity ${opportunityId}.`, result);
      }),
  );

  server.tool(
    "delete_opportunity",
    "Delete a GoHighLevel opportunity.",
    DeleteOpportunityInput.shape,
    async ({ opportunityId }) =>
      withToolErrorHandling(`delete opportunity ${opportunityId}`, async () => {
      const result = await client.deleteOpportunity(opportunityId);
      return formatToolResult(`Deleted opportunity ${opportunityId}.`, result);
      }),
  );

  server.tool(
    "update_opportunity_status",
    "Change the status of a GoHighLevel opportunity.",
    UpdateOpportunityStatusInput.shape,
    async ({ opportunityId, status }) =>
      withToolErrorHandling(`update opportunity ${opportunityId} status`, async () => {
      const result = await client.updateOpportunityStatus(opportunityId, { status });
      return formatToolResult(`Updated opportunity ${opportunityId} status to ${status}.`, result);
      }),
  );

  server.tool(
    "list_pipelines",
    "List GoHighLevel pipelines and include their stages.",
    ListPipelinesInput.shape,
    async (_params) =>
      withToolErrorHandling("list pipelines", async () => {
      const result = await client.listPipelines({});
      const pipelines = (result as { pipelines?: unknown[] }).pipelines ?? [];
      return formatToolResult(
        `Retrieved ${pipelines.length} pipeline${pipelines.length === 1 ? "" : "s"} with stages.`,
        result,
      );
      }),
  );
}
