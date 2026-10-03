import { render, screen, within } from "@testing-library/react";
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

  it("navigates to a selected search result", async () => {
    const user = userEvent.setup();
    render(<App />);
    const search = screen.getByRole("searchbox", { name: /Search CareConnect/ });

    await user.type(search, "Metformin");
    const results = screen.getByRole("listbox");
    await user.click(within(results).getByRole("option", { name: /Metformin/ }));

    expect(screen.getByRole("heading", { name: "Medications" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Metformin/ })).toBeInTheDocument();
    expect(search).toHaveValue("");
  });

  it("opens help and closes it with its action", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByRole("dialog", { name: "CareConnect help" })).toBeInTheDocument();
    expect(screen.getByText("Focus search")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates from a notification and marks it read", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await user.click(screen.getByRole("button", { name: /Two unread messages/ }));

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

  it("requests an appointment and shows the new visit", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "New appointment" }));
    const dialog = screen.getByRole("dialog", { name: "Request an appointment" });
    await user.selectOptions(within(dialog).getByLabelText("Provider *"), "Dr. Priya Nair");
    await user.type(within(dialog).getByLabelText("Preferred date *"), "2026-10-10");
    await user.selectOptions(within(dialog).getByLabelText("Preferred time *"), "09:00");
    await user.click(within(dialog).getByRole("button", { name: "Submit request" }));

    expect(screen.getByText("Appointment request submitted.")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Dr. Priya Nair" })).toHaveLength(2);
  });

  it("shows appointment details and confirms cancellation", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Appointments" }));
    await user.click(screen.getByRole("button", { name: "More options for Dr. Sarah Chen" }));
    await user.click(screen.getByRole("button", { name: "View details" }));
    expect(screen.getByRole("dialog", { name: "Appointment details" })).toHaveTextContent("Primary Care");
    await user.click(screen.getByRole("button", { name: "Done" }));

    await user.click(screen.getByRole("button", { name: "More options for Dr. Sarah Chen" }));
    await user.click(screen.getByRole("button", { name: "Cancel appointment" }));
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
    await user.click(screen.getByRole("button", { name: "Add time" }));
    expect(screen.getByText("8:00 PM")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Save medication" })[0]);

    expect(screen.getByText("Test medication was added.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Medications" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Test medication/ })).toBeInTheDocument();
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
