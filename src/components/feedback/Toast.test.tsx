import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToastViewport } from "./Toast";
import { toast, useToastStore } from "./toast.store";

beforeEach(() => {
  useToastStore.getState().clear();
  vi.useRealTimers();
});

describe("toast notifications", () => {
  it("renders a success notification in a polite live region", () => {
    render(<ToastViewport />);
    act(() => {
      toast.success("Added to basket");
    });

    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Added to basket")).toBeInTheDocument();
  });

  it("supports error and info variants", () => {
    render(<ToastViewport />);
    act(() => {
      toast.error("Something failed");
    });
    expect(screen.getByText("Something failed")).toBeInTheDocument();

    act(() => {
      toast.info("Just so you know");
    });
    expect(screen.getByText("Just so you know")).toBeInTheDocument();
  });

  it("can be dismissed with its close button", async () => {
    const user = userEvent.setup();
    render(<ToastViewport />);

    act(() => {
      toast.success("Dismiss me");
    });

    await user.click(screen.getByRole("button", { name: /Dismiss notification/i }));

    // AnimatePresence keeps the node mounted until its exit animation ends.
    await waitFor(() => expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument());
  });

  it("auto-dismisses after its duration", () => {
    vi.useFakeTimers();
    render(<ToastViewport />);

    act(() => {
      toast.success("Short lived", 1000);
    });
    expect(screen.getByText("Short lived")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(useToastStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it("collapses duplicate messages instead of stacking them", () => {
    render(<ToastViewport />);
    act(() => {
      toast.success("Same message");
      toast.success("Same message");
    });

    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it("caps the visible stack so a burst cannot cover the page", () => {
    render(<ToastViewport />);
    act(() => {
      toast.info("one");
      toast.info("two");
      toast.info("three");
      toast.info("four");
    });

    expect(useToastStore.getState().toasts.length).toBeLessThanOrEqual(3);
  });
});
