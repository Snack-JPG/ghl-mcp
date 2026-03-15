import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListTasksInput = z.object({
  contactId: z.string().min(1).describe("The contact ID whose tasks should be listed."),
  status: z.string().optional().describe("Optional task status filter."),
});

const CreateTaskInput = z.object({
  contactId: z.string().min(1).describe("The contact ID the task should be attached to."),
  title: z.string().min(1).describe("Task title."),
  body: z.string().optional().describe("Optional task description or notes."),
  dueDate: z.string().describe("Due date or datetime in ISO-8601 format (e.g. 2026-03-20T10:00:00.000Z)."),
  completed: z.boolean().default(false).describe("Initial completion state."),
  assignedTo: z.string().optional().describe("Optional user ID to assign the task to."),
});

export function registerTaskTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_tasks",
    "List GoHighLevel tasks for a contact.",
    ListTasksInput.shape,
    async ({ contactId, ...query }) =>
      withToolErrorHandling(`list tasks for contact ${contactId}`, async () => {
        const result = await client.listTasks(contactId, query);
        const tasks = (result as { tasks?: unknown[] }).tasks ?? [];
        return formatToolResult(
          `Retrieved ${tasks.length} task${tasks.length === 1 ? "" : "s"} for contact ${contactId}.`,
          result,
        );
      }),
  );

  server.tool(
    "create_task",
    "Create a GoHighLevel task for a contact.",
    CreateTaskInput.shape,
    async ({ contactId, ...body }) =>
      withToolErrorHandling(`create a task for contact ${contactId}`, async () => {
        const result = await client.createTask(contactId, body);
        return formatToolResult(`Created task for contact ${contactId}.`, result);
      }),
  );
}
