import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListInvoicesInput = z.object({
  status: z.string().optional().describe("Optional invoice status filter."),
  contactId: z.string().optional().describe("Optional contact ID to restrict invoices."),
  altId: z.string().optional().describe("Optional alternate object ID supported by the invoice API."),
});

const CreateInvoiceInput = z.object({
  contactId: z.string().min(1).describe("The contact ID the invoice belongs to."),
  title: z.string().min(1).describe("Invoice title or label."),
  amount: z.number().optional().describe("Invoice amount if the API accepts a direct amount field."),
  currency: z.string().optional().describe("Optional ISO currency code for the invoice."),
  dueDate: z.string().optional().describe("Optional invoice due date in ISO-8601 format."),
  issueDate: z.string().optional().describe("Optional invoice issue date in ISO-8601 format."),
  items: z.array(z.record(z.unknown())).optional().describe("Optional line items in the GoHighLevel invoice payload format."),
  liveMode: z.boolean().optional().describe("Whether the invoice should be created in live mode when supported."),
  metadata: z.record(z.unknown()).optional().describe("Optional metadata values to attach to the invoice."),
});

const ListTransactionsInput = z.object({
  contactId: z.string().optional().describe("Optional contact ID to restrict payment transactions."),
  subscriptionId: z.string().optional().describe("Optional subscription ID to restrict transactions."),
  orderId: z.string().optional().describe("Optional order ID to restrict transactions."),
  altId: z.string().optional().describe("Optional alternate object ID supported by the payments API."),
});

const ListOrdersInput = z.object({
  contactId: z.string().optional().describe("Optional contact ID to restrict orders."),
  status: z.string().optional().describe("Optional order status filter."),
  altId: z.string().optional().describe("Optional alternate object ID supported by the payments API."),
});

const ListSubscriptionsInput = z.object({
  contactId: z.string().optional().describe("Optional contact ID to restrict subscriptions."),
  status: z.string().optional().describe("Optional subscription status filter."),
  altId: z.string().optional().describe("Optional alternate object ID supported by the payments API."),
});

export function registerInvoiceTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_invoices",
    "List GoHighLevel invoices for the configured location.",
    ListInvoicesInput.shape,
    async (params) =>
      withToolErrorHandling("list invoices", async () => {
        const result = await client.listInvoices(params);
        const invoices = (result as { invoices?: unknown[] }).invoices ?? [];
        return formatToolResult(
          `Retrieved ${invoices.length} invoice${invoices.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "create_invoice",
    "Create a GoHighLevel invoice.",
    CreateInvoiceInput.shape,
    async (params) =>
      withToolErrorHandling("create an invoice", async () => {
        const result = await client.createInvoice(params);
        return formatToolResult("Created invoice successfully.", result);
      }),
  );

  server.tool(
    "list_transactions",
    "List GoHighLevel payment transactions.",
    ListTransactionsInput.shape,
    async (params) =>
      withToolErrorHandling("list transactions", async () => {
        const result = await client.listTransactions(params);
        const transactions = (result as { transactions?: unknown[] }).transactions ?? [];
        return formatToolResult(
          `Retrieved ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "list_orders",
    "List GoHighLevel payment orders.",
    ListOrdersInput.shape,
    async (params) =>
      withToolErrorHandling("list orders", async () => {
        const result = await client.listOrders(params);
        const orders = (result as { orders?: unknown[] }).orders ?? [];
        return formatToolResult(
          `Retrieved ${orders.length} order${orders.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "list_subscriptions",
    "List GoHighLevel subscriptions.",
    ListSubscriptionsInput.shape,
    async (params) =>
      withToolErrorHandling("list subscriptions", async () => {
        const result = await client.listSubscriptions(params);
        const subscriptions = (result as { subscriptions?: unknown[] }).subscriptions ?? [];
        return formatToolResult(
          `Retrieved ${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );
}
