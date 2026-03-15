import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListProductsInput = z.object({
  altId: z.string().optional().describe("Optional alternate object ID supported by the products API."),
  search: z.string().optional().describe("Optional product search text."),
});

const ListProductPricesInput = z.object({
  productId: z.string().min(1).describe("The product ID whose prices should be listed."),
  currency: z.string().optional().describe("Optional ISO currency code to restrict returned prices."),
});

export function registerProductTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_products",
    "List GoHighLevel products for the configured location.",
    ListProductsInput.shape,
    async (params) =>
      withToolErrorHandling("list products", async () => {
        const result = await client.listProducts(params);
        const products = (result as { products?: unknown[] }).products ?? [];
        return formatToolResult(
          `Retrieved ${products.length} product${products.length === 1 ? "" : "s"}.`,
          result,
        );
      }),
  );

  server.tool(
    "list_product_prices",
    "List GoHighLevel prices for a product.",
    ListProductPricesInput.shape,
    async ({ productId, ...query }) =>
      withToolErrorHandling(`list prices for product ${productId}`, async () => {
        const result = await client.listProductPrices(productId, query);
        const prices = (result as { prices?: unknown[] }).prices ?? [];
        return formatToolResult(
          `Retrieved ${prices.length} price${prices.length === 1 ? "" : "s"} for product ${productId}.`,
          result,
        );
      }),
  );
}
