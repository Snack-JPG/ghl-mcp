# GoHighLevel MCP Server

`ghl-mcp` is a Model Context Protocol server for GoHighLevel API v2. It exposes contacts, opportunities, conversations, calendars, workflows, users, invoices, payments, social, forms, funnels, tasks, products, emails, campaigns, and documents as MCP tools over stdio so Claude Code, Cursor, Codex, OpenClaw, VS Code, and other MCP clients can work directly with GoHighLevel CRM data.

## Features

- 50 MCP tools covering high-value GoHighLevel CRM, billing, marketing, and operations workflows
- Built on `@modelcontextprotocol/sdk` v1.x
- Strict TypeScript configuration
- Zod-validated tool inputs with descriptions on every field
- Automatic `locationId` injection from environment variables
- Basic request pacing to stay under GoHighLevel rate limits
- Human-readable tool error payloads instead of raw stack traces

## Requirements

- Node.js 18+
- A GoHighLevel API token
- A GoHighLevel location ID

## Installation

### Local development

```bash
npm install
npm run build
node dist/index.js
```

### Run with `npx`

```bash
npx -y ghl-mcp
```

## Configuration

Set these environment variables in the MCP client configuration:

- `GHL_API_TOKEN`: Private Integration token or OAuth access token
- `GHL_LOCATION_ID`: GoHighLevel location or sub-account ID

The server sends these headers on every request:

```http
Authorization: Bearer {GHL_API_TOKEN}
Content-Type: application/json
Version: 2021-07-28
```

## MCP Client Setup

### Claude Code

> **Note:** `claude mcp add` registers a local server name — it doesn't download from a registry. The part after `--` is the actual command that runs the server.

```bash
# After npm publish (recommended):
claude mcp add gohighlevel --scope user \
  --env GHL_API_TOKEN="your-token" \
  --env GHL_LOCATION_ID="your-location-id" \
  -- npx -y ghl-mcp

# Local development (before publishing):
claude mcp add gohighlevel --scope user \
  --env GHL_API_TOKEN="your-token" \
  --env GHL_LOCATION_ID="your-location-id" \
  -- node /absolute/path/to/ghl-mcp/dist/index.js
```

### Cursor / VS Code / Codex style config

```json
{
  "mcpServers": {
    "gohighlevel": {
      "command": "npx",
      "args": ["-y", "ghl-mcp"],
      "env": {
        "GHL_API_TOKEN": "your-token-here",
        "GHL_LOCATION_ID": "your-location-id"
      }
    }
  }
}
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## Tool List

### Contacts

- `search_contacts`: Search contacts by text, tag, pagination, or advanced filters
- `get_contact`: Retrieve one contact by ID
- `create_contact`: Create a contact
- `update_contact`: Update contact fields
- `delete_contact`: Delete a contact
- `add_contact_tags`: Add tags to a contact
- `remove_contact_tags`: Remove tags from a contact
- `get_contact_notes`: List notes for a contact
- `create_contact_note`: Create a note on a contact

### Opportunities

- `search_opportunities`: Search deals by query, pipeline, stage, status, contact, or owner
- `get_opportunity`: Retrieve one opportunity by ID
- `create_opportunity`: Create an opportunity
- `update_opportunity`: Update opportunity fields
- `delete_opportunity`: Delete an opportunity
- `update_opportunity_status`: Change status to `open`, `won`, `lost`, or `abandoned`
- `list_pipelines`: List pipelines and fetch their stages

### Conversations

- `search_conversations`: Search conversations
- `get_conversation`: Retrieve one conversation by ID
- `get_conversation_messages`: List messages in a conversation
- `send_message`: Send SMS, email, WhatsApp, or similar messages
- `create_conversation`: Start a new conversation

### Calendars

- `list_calendars`: List calendars
- `list_events`: List events or appointments
- `create_event`: Create an event
- `get_available_slots`: Retrieve available booking slots

### Workflows

- `list_workflows`: List workflows
- `trigger_workflow`: Trigger a workflow for a contact

### Users

- `list_users`: List users in the configured location
- `get_user`: Retrieve one user by ID

### Invoices And Payments

- `list_invoices`: List invoices
- `create_invoice`: Create an invoice
- `list_transactions`: List payment transactions
- `list_orders`: List payment orders
- `list_subscriptions`: List subscriptions

### Social

- `list_social_posts`: List social posts
- `create_social_post`: Create or schedule a social post
- `list_social_accounts`: List connected social accounts
- `get_social_stats`: Retrieve social statistics

### Forms And Funnels

- `list_forms`: List forms
- `list_funnels`: List funnels
- `list_funnel_pages`: List funnel pages

### Tasks

- `list_tasks`: List tasks for a contact
- `create_task`: Create a task for a contact

### Products

- `list_products`: List products
- `list_product_prices`: List prices for a product

### Emails

- `list_email_templates`: List email templates
- `list_email_schedules`: List scheduled emails

### Campaigns

- `list_campaigns`: List campaigns

### Documents

- `list_contracts`: List contracts or documents
- `send_contract_link`: Send a contract link for signing

## Development

```bash
npm run dev
```

Build output goes to `dist/`.

## Architecture

```text
src/
├── index.ts
├── client.ts
├── types.ts
└── tools/
    ├── calendars.ts
    ├── campaigns.ts
    ├── contacts.ts
    ├── conversations.ts
    ├── documents.ts
    ├── emails.ts
    ├── forms.ts
    ├── invoices.ts
    ├── opportunities.ts
    ├── products.ts
    ├── social.ts
    ├── tasks.ts
    ├── users.ts
    └── workflows.ts
```

## Implementation Notes

- Most endpoints require `locationId`. This server injects it automatically into request query strings and JSON bodies unless a value is already provided.
- The client applies a minimum delay between requests to reduce the chance of hitting GoHighLevel's rate limits.
- Tool responses are returned as JSON text blocks with a short summary and the raw API payload.
- Pipeline listing fetches pipeline stage details for each returned pipeline so agents get usable stage metadata in one call.

## Example Workflows

### Find a contact and add a note

1. Call `search_contacts` with `query: "jane@company.com"`
2. Call `get_contact` with the selected `contactId`
3. Call `create_contact_note` with the `contactId` and note text

### Create and advance an opportunity

1. Call `list_pipelines` to find the target pipeline and stage IDs
2. Call `create_opportunity` with `contactId`, `pipelineId`, `pipelineStageId`, and `name`
3. Call `update_opportunity` or `update_opportunity_status` as the deal progresses

### Book an appointment

1. Call `get_available_slots` with a `calendarId` and date range
2. Call `create_event` with the selected time slot and optional `contactId`

## Publishing

```bash
npm publish --access public
```

The published package installs the `ghl-mcp` binary from `dist/index.js`.
