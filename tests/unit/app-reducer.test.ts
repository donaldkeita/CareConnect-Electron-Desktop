import { describe, expect, it } from "vitest";
import { appReducer, initialState } from "../../src/renderer/app-state";

describe("CareConnect application state", () => {
  it("adds and reschedules an appointment", () => {
    const appointment = { id: 99, doctor: "Dr. Test", specialty: "Primary Care", date: "Oct 10 at 9:00 AM", location: "To be confirmed", type: "In person" as const, status: "Upcoming" as const };
    const added = appReducer(initialState, { type: "add-appointment", appointment });
    expect(added.appointments.at(-1)).toEqual(appointment);
    const updated = appReducer(added, { type: "update-appointment", appointment: { ...appointment, date: "Oct 11 at 2:00 PM" } });
    expect(updated.appointments.find((item) => item.id === 99)?.date).toBe("Oct 11 at 2:00 PM");
  });

  it("moves a cancelled appointment out of upcoming state", () => {
    const cancelled = appReducer(initialState, { type: "cancel-appointment", id: 1 });
    expect(cancelled.appointments.find((item) => item.id === 1)?.status).toBe("Cancelled");
  });

  it("adds a medication and navigates back to medications", () => {
    const medication = { id: 99, name: "Test medication", dose: "5 mg", schedule: "Once daily · 8:00 AM", prescriber: "Dr. Sarah Chen", refill: "Not scheduled", status: "On track" as const };
    const result = appReducer(initialState, { type: "add-medication", medication });
    expect(result.medications.at(-1)).toEqual(medication);
    expect(result.page).toBe("medications");
  });

  it("marks and unmarks an individual medication dose", () => {
    const doseKey = "2026-10-10|08:00";
    const taken = appReducer(initialState, { type: "toggle-medication-dose", id: 1, doseKey });
    expect(taken.medications.find((item) => item.id === 1)?.takenDoses).toContain(doseKey);
    const undone = appReducer(taken, { type: "toggle-medication-dose", id: 1, doseKey });
    expect(undone.medications.find((item) => item.id === 1)?.takenDoses).not.toContain(doseKey);
  });

  it("marks selected messages read and appends replies", () => {
    const read = appReducer(initialState, { type: "select-message", id: 1 });
    expect(read.messages.find((item) => item.id === 1)?.unread).toBe(false);
    const replied = appReducer(read, { type: "reply-message", id: 1, body: "Thank you" });
    expect(replied.messages.find((item) => item.id === 1)?.body).toContain("Jordan: Thank you");
  });

  it("marks notifications read", () => {
    const result = appReducer(initialState, { type: "read-notification", id: 1 });
    expect(result.notifications.find((item) => item.id === 1)?.read).toBe(true);
  });
});
