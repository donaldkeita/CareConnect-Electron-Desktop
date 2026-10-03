import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog, Field } from "../../src/renderer/components/Dialog";

describe("Dialog and Field", () => {
  it("renders dialog content and actions when open, then closes on request", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog
        open
        title="Test dialog"
        description="Dialog description"
        onClose={onClose}
        actions={<button type="button">Confirm</button>}
      >
        <p>Dialog content</p>
      </Dialog>,
    );

    expect(screen.getByRole("dialog", { name: "Test dialog" })).toHaveAttribute(
      "aria-describedby",
      "dialog-description",
    );
    expect(screen.getByText("Dialog content")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close Test dialog" }));
    expect(onClose).toHaveBeenCalledOnce();

    rerender(
      <Dialog
        open={false}
        title="Test dialog"
        onClose={onClose}
        actions={<button type="button">Confirm</button>}
      >
        <p>Dialog content</p>
      </Dialog>,
    );
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  });

  it("closes on Escape and submits its form", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <Dialog
        open
        title="Action dialog"
        onClose={onClose}
        onSubmit={onSubmit}
        actions={<button type="submit">Save</button>}
      >
        <Field label="Name" required error="Name is required">
          <input name="name" />
        </Field>
      </Dialog>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Name is required");
    fireEvent(
      screen.getByRole("dialog", { name: "Action dialog" }),
      new Event("cancel", { cancelable: true }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
  });
});
