# GoHighLevel MCP Server

## What You're Building

An MCP (Model Context Protocol) server that wraps the GoHighLevel (GHL) API v2, exposing GHL operations as MCP tools. This lets any MCP-compatible AI agent (Claude Code, Cursor, Codex, OpenClaw, VS Code) interact with GoHighLevel CRM data.

**Think of it as:** The HubSpot MCP server, but for GoHighLevel.

## Tech Stack

- **TypeScript** (strict mode)
- **@modelcontextprotocol/sdk** v1.x (stable — NOT v2 which is pre-alpha)
- **zod** for input validation
- **node-fetch** or built-in fetch for API calls
- **stdio transport** (standard MCP pattern for CLI usage)

## Package Info

- **Name:** `@snackjpg/ghl-mcp`
- **Binary:** `ghl-mcp`
- **Entry:** `src/index.ts`
- **Build:** TypeScript → `dist/`
- **License:** MIT

## GoHighLevel API v2 Reference

**Base URL:** `https://services.leadconnectorhq.com`

**Auth:** Bearer token in Authorization header
```
Authorization: Bearer {GHL_API_TOKEN}
Content-Type: application/json
Version: 2021-07-28
```

The token comes from either:
1. A Private Integration token (simpler, for single-location)
2. OAuth 2.0 access token (for marketplace apps, multi-location)

For this MCP server, support both via environment variables:
- `GHL_API_TOKEN` — Bearer token (private integration or OAuth access token)
- `GHL_LOCATION_ID` — Location/sub-account ID (required for most endpoints)

### API Endpoints to Implement

#### Contacts (Priority: HIGH)
- `GET /contacts/{contactId}` — Get contact by ID
- `GET /contacts/` — List/search contacts (query params: query, locationId, limit, offset)
- `POST /contacts/` — Create contact
- `PUT /contacts/{contactId}` — Update contact
- `DELETE /contacts/{contactId}` — Delete contact
- `POST /contacts/search` — Search contacts (advanced, with filters)
- `GET /contacts/{contactId}/tasks` — Get contact's tasks
- `POST /contacts/{contactId}/tags` — Add tags to contact
- `DELETE /contacts/{contactId}/tags` — Remove tags from contact
- `GET /contacts/{contactId}/notes` — Get contact notes
- `POST /contacts/{contactId}/notes` — Create note on contact

#### Opportunities / Pipeline (Priority: HIGH)
- `GET /opportunities/search` — Search opportunities
- `GET /opportunities/{opportunityId}` — Get opportunity
- `POST /opportunities/` — Create opportunity
- `PUT /opportunities/{opportunityId}` — Update opportunity
- `DELETE /opportunities/{opportunityId}` — Delete opportunity
- `PUT /opportunities/{opportunityId}/status` — Update opportunity status
- `GET /opportunities/pipelines` — List pipelines
- `GET /opportunities/pipelines/{pipelineId}` — Get pipeline stages

#### Conversations (Priority: HIGH)
- `GET /conversations/{conversationId}` — Get conversation
- `POST /conversations/` — Create conversation
- `PUT /conversations/{conversationId}` — Update conversation
- `GET /conversations/search` — Search conversations
- `POST /conversations/messages` — Send message (SMS, email, etc.)
- `GET /conversations/{conversationId}/messages` — Get messages in conversation

#### Calendars (Priority: MEDIUM)
- `GET /calendars/` — List calendars
- `GET /calendars/{calendarId}` — Get calendar
- `GET /calendars/events` — List events
- `POST /calendars/events` — Create event/appointment
- `PUT /calendars/events/{eventId}` — Update event
- `GET /calendars/events/slots` — Get available time slots

#### Workflows (Priority: MEDIUM)
- `GET /workflows/` — List workflows
- `POST /workflows/{workflowId}/trigger` — Trigger a workflow for a contact

#### Users (Priority: LOW)
- `GET /users/` — List users in location
- `GET /users/{userId}` — Get user details

#### Payments (Priority: LOW)
- `GET /payments/orders` — List orders
- `GET /payments/subscriptions` — List subscriptions
- `GET /payments/transactions` — List transactions

### Common Request Patterns

All list endpoints support:
- `locationId` (required) — from GHL_LOCATION_ID env var
- `limit` — page size (default 20, max 100)
- `offset` or `startAfterId` — pagination
- Response format: `{ contacts: [...], meta: { total, currentPage, nextPage } }`

### Error Responses
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "Bad Request"
}
```

Common status codes: 400 (validation), 401 (auth), 404 (not found), 422 (unprocessable), 429 (rate limit)

## MCP Tools to Expose

### Contacts
1. **search_contacts** — Search/list contacts by name, email, phone, or tag
2. **get_contact** — Get a single contact with full details
3. **create_contact** — Create a new contact
4. **update_contact** — Update contact fields
5. **delete_contact** — Delete a contact
6. **add_contact_tags** — Add tags to a contact
7. **remove_contact_tags** — Remove tags from a contact
8. **get_contact_notes** — Get notes for a contact
9. **create_contact_note** — Add a note to a contact

### Opportunities
10. **search_opportunities** — Search deals in pipeline
11. **get_opportunity** — Get opportunity details
12. **create_opportunity** — Create new opportunity
13. **update_opportunity** — Update opportunity (stage, value, etc.)
14. **delete_opportunity** — Delete opportunity
15. **update_opportunity_status** — Change status (open/won/lost/abandoned)
16. **list_pipelines** — List all pipelines and their stages

### Conversations
17. **search_conversations** — Search conversations
18. **get_conversation** — Get conversation details
19. **get_conversation_messages** — Get messages in a conversation
20. **send_message** — Send SMS, email, or other message to a contact
21. **create_conversation** — Start a new conversation

### Calendars
22. **list_calendars** — List all calendars
23. **list_events** — List calendar events
24. **create_event** — Create appointment/event
25. **get_available_slots** — Get free time slots for booking

### Workflows
26. **list_workflows** — List available workflows
27. **trigger_workflow** — Trigger a workflow for a contact

### Users
28. **list_users** — List team members
29. **get_user** — Get user details

## Architecture

```
src/
├── index.ts              # Entry point — create MCP server, register tools, start stdio
├── client.ts             # GHL API client class (handles auth, base URL, request/response)
├── tools/
│   ├── contacts.ts       # Contact tool definitions + handlers
│   ├── opportunities.ts  # Opportunity/pipeline tool definitions + handlers
│   ├── conversations.ts  # Conversation/messaging tool definitions + handlers
│   ├── calendars.ts      # Calendar tool definitions + handlers
│   ├── workflows.ts      # Workflow tool definitions + handlers
│   └── users.ts          # User tool definitions + handlers
└── types.ts              # Shared TypeScript types
```

## Tool Definition Pattern

Each tool should follow this pattern:

```typescript
import { z } from "zod";

// Define input schema with Zod
const SearchContactsInput = z.object({
  query: z.string().optional().describe("Search by name, email, or phone"),
  tag: z.string().optional().describe("Filter by tag name"),
  limit: z.number().min(1).max(100).default(20).describe("Results per page"),
  offset: z.number().default(0).describe("Pagination offset"),
});

// Register tool on server
server.tool(
  "search_contacts",
  "Search for contacts in GoHighLevel by name, email, phone, or tag",
  SearchContactsInput.shape,
  async (params) => {
    const result = await ghlClient.searchContacts(params);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  }
);
```

## Important Implementation Notes

1. **Always include locationId** — Most GHL endpoints require it. Read from `GHL_LOCATION_ID` env var and inject automatically.

2. **Rate limiting** — GHL allows ~100 requests per minute. Add basic rate limiting (delay between rapid calls).

3. **Error handling** — Catch API errors and return human-readable MCP error responses, not raw stack traces.

4. **Pagination** — For list/search tools, support limit and offset params. Return total count in response.

5. **The Version header** — GHL requires `Version: 2021-07-28` header on all requests.

6. **Input descriptions** — Every Zod field must have `.describe()` so the AI agent knows what each param does.

7. **Response formatting** — Return structured JSON in tool responses. Include useful context (e.g., "Found 12 contacts matching 'smith'").

8. **README** — Write a clear README with: what it is, installation, config (env vars), usage with Claude Code/Cursor/Codex, list of all tools, examples.

## Build & Run

```bash
npm install
npm run build          # tsc → dist/
npm run dev            # tsx watch mode
node dist/index.js     # production

# Test with MCP inspector
npx @modelcontextprotocol/inspector node dist/index.js
```

## Usage in Claude Code

```bash
claude mcp add ghl-mcp -- node /path/to/ghl-mcp/dist/index.js
# or after npm publish:
claude mcp add ghl-mcp -- npx -y @snackjpg/ghl-mcp
```

## Config for MCP clients

```json
{
  "mcpServers": {
    "gohighlevel": {
      "command": "npx",
      "args": ["-y", "@snackjpg/ghl-mcp"],
      "env": {
        "GHL_API_TOKEN": "your-token-here",
        "GHL_LOCATION_ID": "your-location-id"
      }
    }
  }
}
```

## Quality Bar

- All tools must have proper Zod schemas with descriptions
- All API errors must be caught and returned as readable messages
- TypeScript strict mode, no `any` types
- README must be comprehensive enough for someone to install and use in 2 minutes
- Include a `tools.md` listing every tool with its params for quick reference
