import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListContractsInput = z.object({
  contactId: z.string().optional().describe("Optional contact ID to restrict contracts."),
  status: z.string().optional().describe("Optional contract status filter."),
  altId: z.string().optional().describe("Optional alternate object ID supported by the contracts API."),
});

const SendContractLinkInput = z.object({
  documentId: z.string().min(1).describe("The contract or document ID to send."),
  contactId: z.string().optional().describe("Optional contact ID receiving the contract link."),
  email: z.string().email().optional().describe("Optional recipient email address for the contract link."),
  phone: z.string().optional().describe("Optional recipient phone number for the contract link."),
  message: z.string().optional().describe("Optional custom message to include with the contract link."),
});

export function registerDocumentTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_contracts",
    "List GoHighLevel contracts or documents.",
    ListContractsInput.shape,
    async (params) =>
      withToolErrorHandling("list contracts", async () => {
        const result = await client.listContracts(params);
        const contracts = (result as { contracts?: unknown[] }).contracts ?? [];
        return formatToolResult(
          `Retrieved ${contracts.length} contract${contracts.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "send_contract_link",
    "Send a GoHighLevel contract link for signing.",
    SendContractLinkInput.shape,
    async (params) =>
      withToolErrorHandling("send a contract link", async () => {
        const result = await client.sendContractLink(params);
        return formatToolResult("Sent contract link successfully.", result);
      }),
  );
}
