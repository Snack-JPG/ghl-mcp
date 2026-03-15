import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const SearchContactsInput = z.object({
  query: z.string().optional().describe("Search text for name, email, phone, or general contact matching."),
  tag: z.string().optional().describe("Optional tag name to filter contacts by."),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of contacts to return."),
  offset: z.number().int().min(0).default(0).describe("Pagination offset for the contact list."),
  filters: z.array(z.record(z.unknown())).optional().describe("Optional advanced search filters. When provided, the tool uses the advanced contact search endpoint."),
});

const GetContactInput = z.object({
  contactId: z.string().min(1).describe("The GoHighLevel contact ID to retrieve."),
});

const CreateContactInput = z.object({
  firstName: z.string().optional().describe("Contact first name."),
  lastName: z.string().optional().describe("Contact last name."),
  name: z.string().optional().describe("Full contact name if first and last names are not separated."),
  email: z.string().email().optional().describe("Primary email address."),
  phone: z.string().optional().describe("Primary phone number."),
  tags: z.array(z.string()).optional().describe("Tags to assign when the contact is created."),
  companyName: z.string().optional().describe("Company name associated with the contact."),
  website: z.string().optional().describe("Website associated with the contact."),
  source: z.string().optional().describe("Lead source for the contact."),
  dnd: z.boolean().optional().describe("Whether the contact should be marked as do-not-disturb."),
  customFields: z.array(z.record(z.unknown())).optional().describe("Custom field objects expected by the GoHighLevel API."),
});

const UpdateContactInput = z.object({
  contactId: z.string().min(1).describe("The GoHighLevel contact ID to update."),
  firstName: z.string().optional().describe("Updated first name."),
  lastName: z.string().optional().describe("Updated last name."),
  name: z.string().optional().describe("Updated full name."),
  email: z.string().email().optional().describe("Updated primary email address."),
  phone: z.string().optional().describe("Updated primary phone number."),
  tags: z.array(z.string()).optional().describe("Complete tag set or tag updates depending on API behavior."),
  companyName: z.string().optional().describe("Updated company name."),
  website: z.string().optional().describe("Updated website."),
  source: z.string().optional().describe("Updated lead source."),
  dnd: z.boolean().optional().describe("Updated do-not-disturb state."),
  customFields: z.array(z.record(z.unknown())).optional().describe("Updated custom field objects expected by the GoHighLevel API."),
});

const DeleteContactInput = z.object({
  contactId: z.string().min(1).describe("The GoHighLevel contact ID to delete."),
});

const UpdateContactTagsInput = z.object({
  contactId: z.string().min(1).describe("The GoHighLevel contact ID whose tags should be changed."),
  tags: z.array(z.string()).min(1).describe("One or more tag names to add or remove."),
});

const GetContactNotesInput = z.object({
  contactId: z.string().min(1).describe("The GoHighLevel contact ID whose notes should be listed."),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of notes to return."),
  offset: z.number().int().min(0).default(0).describe("Pagination offset for notes."),
});

const CreateContactNoteInput = z.object({
  contactId: z.string().min(1).describe("The GoHighLevel contact ID to attach the note to."),
  body: z.string().min(1).describe("The note text to create on the contact."),
  userId: z.string().optional().describe("Optional user ID to associate with the note author."),
});

export function registerContactTools(server: McpServer, client: GhlClient) {
  server.tool(
    "search_contacts",
    "Search for GoHighLevel contacts by name, email, phone, tag, or advanced filters.",
    SearchContactsInput.shape,
    async (params) =>
      withToolErrorHandling("search contacts", async () => {
      const result = params.filters?.length
        ? await client.advancedSearchContacts({
            filters: params.filters,
            limit: params.limit,
            offset: params.offset,
            query: params.query,
          })
        : await client.searchContacts(params);

      const contacts = (result as { contacts?: unknown[] }).contacts ?? [];
      return formatToolResult(
        `Found ${contacts.length} contact${contacts.length === 1 ? "" : "s"} matching the current filters.`,
        result,
      );
      }),
  );

  server.tool(
    "get_contact",
    "Get a single GoHighLevel contact with full details.",
    GetContactInput.shape,
    async ({ contactId }) =>
      withToolErrorHandling(`get contact ${contactId}`, async () => {
      const result = await client.getContact(contactId);
      return formatToolResult(`Retrieved contact ${contactId}.`, result);
      }),
  );

  server.tool(
    "create_contact",
    "Create a new GoHighLevel contact.",
    CreateContactInput.shape,
    async (params) =>
      withToolErrorHandling("create a contact", async () => {
      const result = await client.createContact(params);
      return formatToolResult("Created contact successfully.", result);
      }),
  );

  server.tool(
    "update_contact",
    "Update fields on an existing GoHighLevel contact.",
    UpdateContactInput.shape,
    async ({ contactId, ...updates }) =>
      withToolErrorHandling(`update contact ${contactId}`, async () => {
      const result = await client.updateContact(contactId, updates);
      return formatToolResult(`Updated contact ${contactId}.`, result);
      }),
  );

  server.tool(
    "delete_contact",
    "Delete a GoHighLevel contact.",
    DeleteContactInput.shape,
    async ({ contactId }) =>
      withToolErrorHandling(`delete contact ${contactId}`, async () => {
      const result = await client.deleteContact(contactId);
      return formatToolResult(`Deleted contact ${contactId}.`, result);
      }),
  );

  server.tool(
    "add_contact_tags",
    "Add one or more tags to a GoHighLevel contact.",
    UpdateContactTagsInput.shape,
    async ({ contactId, tags }) =>
      withToolErrorHandling(`add tags to contact ${contactId}`, async () => {
      const result = await client.addContactTags(contactId, tags);
      return formatToolResult(`Added ${tags.length} tag(s) to contact ${contactId}.`, result);
      }),
  );

  server.tool(
    "remove_contact_tags",
    "Remove one or more tags from a GoHighLevel contact.",
    UpdateContactTagsInput.shape,
    async ({ contactId, tags }) =>
      withToolErrorHandling(`remove tags from contact ${contactId}`, async () => {
      const result = await client.removeContactTags(contactId, tags);
      return formatToolResult(`Removed ${tags.length} tag(s) from contact ${contactId}.`, result);
      }),
  );

  server.tool(
    "get_contact_notes",
    "List notes attached to a GoHighLevel contact.",
    GetContactNotesInput.shape,
    async ({ contactId, limit, offset }) =>
      withToolErrorHandling(`list notes for contact ${contactId}`, async () => {
      const result = await client.getContactNotes(contactId, { limit, offset });
      const notes = result.notes ?? [];
      return formatToolResult(
        `Retrieved ${notes.length} note${notes.length === 1 ? "" : "s"} for contact ${contactId}.`,
        result,
      );
      }),
  );

  server.tool(
    "create_contact_note",
    "Create a note on a GoHighLevel contact.",
    CreateContactNoteInput.shape,
    async ({ contactId, ...body }) =>
      withToolErrorHandling(`create a note for contact ${contactId}`, async () => {
      const result = await client.createContactNote(contactId, body);
      return formatToolResult(`Created a note for contact ${contactId}.`, result);
      }),
  );
}
