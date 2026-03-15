import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListWorkflowsInput = z.object({
  status: z.string().optional().describe("Optional workflow status filter."),
});

const TriggerWorkflowInput = z.object({
  workflowId: z.string().min(1).describe("The GoHighLevel workflow ID to trigger."),
  contactId: z.string().min(1).describe("The contact ID that should enter the workflow."),
  eventData: z.record(z.unknown()).optional().describe("Optional event payload values passed into the workflow trigger."),
});

export function registerWorkflowTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_workflows",
    "List GoHighLevel workflows available in the configured location.",
    ListWorkflowsInput.shape,
    async (params) =>
      withToolErrorHandling("list workflows", async () => {
      const result = await client.listWorkflows(params);
      const workflows = result.workflows ?? [];
      return formatToolResult(
        `Retrieved ${workflows.length} workflow${workflows.length === 1 ? "" : "s"}.`,
        result,
      );
      }),
  );

  server.tool(
    "trigger_workflow",
    "Trigger a GoHighLevel workflow for a contact.",
    TriggerWorkflowInput.shape,
    async ({ workflowId, ...body }) =>
      withToolErrorHandling(`trigger workflow ${workflowId}`, async () => {
      const result = await client.triggerWorkflow(workflowId, body);
      return formatToolResult(`Triggered workflow ${workflowId}.`, result);
      }),
  );
}
