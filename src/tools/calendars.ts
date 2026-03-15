import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { GhlClient } from "../client.js";
import { formatToolResult, withToolErrorHandling } from "../types.js";

const ListCalendarsInput = z.object({
  limit: z.number().int().min(1).max(100).default(100).describe("Maximum number of calendars to return."),
  offset: z.number().int().min(0).default(0).describe("Pagination offset for calendars."),
  groupId: z.string().optional().describe("Optional calendar group ID to filter by."),
});

const ListEventsInput = z.object({
  calendarId: z.string().optional().describe("Optional calendar ID to restrict events."),
  startTime: z.string().optional().describe("Optional ISO-8601 lower bound for event start time."),
  endTime: z.string().optional().describe("Optional ISO-8601 upper bound for event end time."),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of events to return."),
  offset: z.number().int().min(0).default(0).describe("Pagination offset for events."),
});

const CreateEventInput = z.object({
  calendarId: z.string().min(1).describe("The calendar ID where the event should be created."),
  contactId: z.string().optional().describe("Optional contact ID associated with the booking."),
  title: z.string().min(1).describe("The event title."),
  startTime: z.string().min(1).describe("Event start time in ISO-8601 format."),
  endTime: z.string().min(1).describe("Event end time in ISO-8601 format."),
  appointmentStatus: z.string().optional().describe("Optional appointment status."),
  address: z.string().optional().describe("Optional event address."),
  notes: z.string().optional().describe("Optional notes or booking details."),
});

const GetAvailableSlotsInput = z.object({
  calendarId: z.string().min(1).describe("The calendar ID to check for booking availability."),
  startDate: z.string().min(1).describe("Start date or datetime in ISO-8601 format."),
  endDate: z.string().min(1).describe("End date or datetime in ISO-8601 format."),
  timezone: z.string().optional().describe("IANA timezone name for slot calculations."),
});

export function registerCalendarTools(server: McpServer, client: GhlClient) {
  server.tool(
    "list_calendars",
    "List GoHighLevel calendars for the configured location.",
    ListCalendarsInput.shape,
    async (params) =>
      withToolErrorHandling("list calendars", async () => {
      const result = await client.listCalendars(params);
      const calendars = (result as { calendars?: unknown[] }).calendars ?? [];
      return formatToolResult(
        `Retrieved ${calendars.length} calendar${calendars.length === 1 ? "" : "s"}.`,
        result,
      );
      }),
  );

  server.tool(
    "list_events",
    "List GoHighLevel calendar events or appointments.",
    ListEventsInput.shape,
    async (params) =>
      withToolErrorHandling("list calendar events", async () => {
      const result = await client.listEvents(params);
      const events = (result as { events?: unknown[] }).events ?? [];
      return formatToolResult(
        `Retrieved ${events.length} calendar event${events.length === 1 ? "" : "s"}.`,
        result,
      );
      }),
  );

  server.tool(
    "create_event",
    "Create a GoHighLevel appointment or calendar event.",
    CreateEventInput.shape,
    async (params) =>
      withToolErrorHandling("create a calendar event", async () => {
      const result = await client.createEvent(params);
      return formatToolResult("Created event successfully.", result);
      }),
  );

  server.tool(
    "get_available_slots",
    "Get available GoHighLevel booking slots for a calendar.",
    GetAvailableSlotsInput.shape,
    async (params) =>
      withToolErrorHandling("get available slots", async () => {
      const result = await client.getAvailableSlots(params);
      const slots = (result as { slots?: unknown[] }).slots ?? [];
      return formatToolResult(
        `Retrieved ${slots.length} available slot${slots.length === 1 ? "" : "s"}.`,
        result,
      );
      }),
  );
}
