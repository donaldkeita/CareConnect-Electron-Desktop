import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/renderer/App";

describe("CareConnect app", () => {
  it("renders the overview and its care summaries", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Good morning, Jordan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3Upcoming appointments/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2Missed doses today/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2Unread messages/ })).toBeInTheDocument();
  });

  it("switches appointment views between upcoming and past", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Appointments" }));
    expect(screen.getByRole("heading", { name: "Appointments" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dr. Marcus Webb" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Past" }));
    expect(screen.getByRole("heading", { name: "Dr. Sarah Chen" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Dr. Marcus Webb" })).not.toBeInTheDocument();
  });

  it("supports arrow-key navigation for appointment tabs", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Appointments" }));
    const upcoming = screen.getByRole("tab", { name: /Upcoming/ });
    upcoming.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Past" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Past" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", "appointments-past-tab");
  });

  it("navigates to a selected search result", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("combobox", { name: /Search CareConnect/ });

    await user.type(search, "Metformin");
    const results = screen.getByRole("listbox");
    await user.click(within(results).getByRole("option", { name: /Metformin/ }));

    expect(screen.getByRole("heading", { name: "Medications" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Metformin/ })).toBeInTheDocument();
    expect(search).toHaveValue("");
  });

  it("navigates search results as an accessible combobox", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("combobox", { name: /Search CareConnect/ });
    await user.type(search, "Metformin");
    expect(search).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox", { name: "Search results" })).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    expect(search).toHaveAttribute("aria-activedescendant", "search-option-m2");
    expect(screen.getByRole("option", { name: /Metformin/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("heading", { name: "Medications" })).toBeInTheDocument();
  });

  it("opens help and closes it with its action", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByRole("dialog", { name: "CareConnect help" })).toBeInTheDocument();
    expect(screen.getByText("Focus search")).toBeInTheDocument();
    expect(screen.getByText("Open the File menu")).toBeInTheDocument();
    expect(screen.getByText("Open the Edit menu")).toBeInTheDocument();
    expect(screen.getByText("Open the View menu")).toBeInTheDocument();
    expect(screen.getByText("Open the Window menu")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates from a notification and marks it read", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await user.click(screen.getByRole("menuitem", { name: /Two unread messages/ }));

    expect(screen.getByRole("heading", { name: "Messages" })).toBeInTheDocument();
    expect(screen.getByText("2 unread messages from your care team.")).toBeInTheDocument();
  });

  it("sends a new secure message and displays it in the message list", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(within(screen.getByRole("banner")).getByRole("button", { name: "New message" }));
    const dialog = screen.getByRole("dialog", { name: "New message" });
    await user.selectOptions(within(dialog).getByLabelText("To *"), "Dr. Marcus Webb");
    await user.type(within(dialog).getByLabelText("Subject *"), "Follow-up question");
    await user.type(within(dialog).getByLabelText("Message *"), "Could you clarify my care plan?");
    await user.click(within(dialog).getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Message sent.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Follow-up question/ })).toBeInTheDocument();
  });

  it("replies to a selected message and updates its conversation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /^Messages/ }));
    await user.click(screen.getByRole("button", { name: "Reply" }));
    const dialog = screen.getByRole("dialog", { name: "Reply to Dr. Sarah Chen" });
    await user.type(within(dialog).getByLabelText("Message *"), "Thanks for the update.");
    await user.click(within(dialog).getByRole("button", { name: "Send message" }));

    expect(screen.getByText("Reply sent.")).toBeInTheDocument();
    expect(screen.getByText("Jordan: Thanks for the update.")).toBeInTheDocument();
  });

  it("exposes selected and unread message states", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Messages/ }));
    const selected = screen.getByRole("button", { name: /Dr. Sarah Chen.*Unread/ });
    expect(selected).toHaveAttribute("aria-pressed", "true");
    const next = screen.getByRole("button", { name: /Northside Medical Center.*Unread/ });
    await user.click(next);
    expect(next).toHaveAttribute("aria-pressed", "true");
    expect(selected).toHaveAttribute("aria-pressed", "false");
  });

  it("exposes the current page for every sidebar destination", async () => {
    const user = userEvent.setup();
    render(<App />);
    const healthRecords = screen.getByRole("button", { name: "Health records" });
    await user.click(healthRecords);
    expect(healthRecords).toHaveAttribute("aria-current", "page");
    const preferences = screen.getByRole("button", { name: "Preferences" });
    await user.click(preferences);
    expect(preferences).toHaveAttribute("aria-current", "page");
  });

  it("requests an appointment and shows the new visit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "New appointment" }));
    const dialog = screen.getByRole("dialog", { name: "Request an appointment" });
    expect(within(dialog).getByLabelText("Preferred date *")).toHaveAttribute("aria-describedby", "appointment-date-hint");
    expect(within(dialog).getByLabelText("Preferred time *")).toHaveAttribute("aria-describedby", "appointment-date-hint");
    await user.selectOptions(within(dialog).getByLabelText("Provider *"), "Dr. Priya Nair");
    await user.type(within(dialog).getByLabelText("Preferred date *"), "2026-10-10");
    await user.selectOptions(within(dialog).getByLabelText("Preferred time *"), "09:00");
    await user.click(within(dialog).getByRole("button", { name: "Submit request" }));

    expect(screen.getByText("Appointment request submitted.")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Dr. Priya Nair" })).toHaveLength(2);
  });

  it("immediately rejects a past date entered with the date control", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "New appointment" }));
    const date = screen.getByLabelText("Preferred date *") as HTMLInputElement;
    expect(fireEvent.keyDown(date, { key: "ArrowDown" })).toBe(false);
    expect(screen.getByText(/Years before \d{4} are not available/)).toBeInTheDocument();
    fireEvent.input(date, { target: { value: "2025-10-10" } });
    expect(date.value).not.toBe("2025-10-10");
    expect(date.value).toBe(date.min);
    expect(screen.getByText("Past appointment dates are not available.")).toBeInTheDocument();
  });

  it("shows appointment details and confirms cancellation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Appointments" }));
    await user.click(screen.getByRole("button", { name: "More options for Dr. Sarah Chen" }));
    await user.click(screen.getByRole("menuitem", { name: "View details" }));
    expect(screen.getByRole("dialog", { name: "Appointment details" })).toHaveTextContent("Primary Care");
    await user.click(screen.getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("button", { name: "More options for Dr. Sarah Chen" }));
    await user.click(screen.getByRole("menuitem", { name: "Cancel appointment" }));
    await user.click(screen.getByRole("button", { name: /^Cancel appointment$/ }));

    expect(screen.getByText("Appointment cancelled.")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Past" }));
    expect(screen.getAllByText("Cancelled").length).toBeGreaterThan(0);
  });

  it("adds medication with a reminder and displays the saved medication", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add medication" }));
    await user.type(screen.getByPlaceholderText("e.g. Lisinopril"), "Test medication");
    await user.type(screen.getByLabelText(/Dosage/), "5");
    await user.selectOptions(screen.getByRole("combobox", { name: "Reminder time 1" }), "08:30");
    await user.click(screen.getByRole("button", { name: "Add time" }));
    const addedReminder = screen.getByRole("combobox", { name: "Reminder time 2" });
    expect(addedReminder).toBeInTheDocument();
    await waitFor(() => expect(addedReminder).toHaveFocus());
    await user.click(screen.getAllByRole("button", { name: "Save medication" })[0]);

    expect(screen.getByText("Test medication was added.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Medications" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Test medication/ })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Once daily · 8:30 AM/ })).toBeInTheDocument();
  });

  it("marks an individual medication dose as taken and can undo it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /^Medications/ }));
    const action = screen.getAllByRole("button", { name: "Mark 8:00 AM taken" })[0];
    await user.click(action);
    expect(screen.getByRole("button", { name: "Taken · 8:00 AM" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Taken · 8:00 AM" }));
    expect(screen.getAllByRole("button", { name: "Mark 8:00 AM taken" })[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("opens and traverses the notification menu with the keyboard", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Notifications" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("menuitem")[0]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getAllByRole("menuitem")[1]).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("restores focus to a modal opener", async () => {
    const user = userEvent.setup();
    render(<App />);
    const opener = screen.getByRole("button", { name: "Help" });
    await user.click(opener);
    fireEvent(screen.getByRole("dialog", { name: "CareConnect help" }), new Event("cancel", { cancelable: true }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Help" })).toHaveFocus());
  });

  it("confirms discarding unsaved medication changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add medication" }));
    await user.type(screen.getByPlaceholderText("e.g. Lisinopril"), "Unsaved medication");
    await user.click(screen.getAllByRole("button", { name: /^Cancel$/ })[0]);
    await user.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(screen.getByRole("heading", { name: "Medications" })).toBeInTheDocument();
    expect(screen.queryByText("Unsaved medication")).not.toBeInTheDocument();
  });

  it("resets demo data from preferences", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Preferences" }));
    await user.click(screen.getByRole("button", { name: "Reset demo data" }));
    const resetDialog = screen.getByRole("dialog", { name: "Reset demo data?" });
    await user.click(within(resetDialog).getByRole("button", { name: "Reset demo data" }));

    expect(screen.getByText("Demo data reset.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Good morning, Jordan" })).toBeInTheDocument();
  });
});
