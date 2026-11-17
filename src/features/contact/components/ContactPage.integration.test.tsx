import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ContactPage from "@/pages/ContactPage";
import HomePage from "@/pages/HomePage";
import { renderWithRouter } from "@/test/renderWithRouter";
import { useToastStore } from "@/components/feedback/toast.store";
import * as formService from "@/services/form.service";
import { FAQ_ENTRIES } from "@/data/faq";

beforeEach(() => {
  useToastStore.getState().clear();
});

describe("FAQ accordion", () => {
  it("renders every FAQ entry as an accessible disclosure", () => {
    renderWithRouter(<ContactPage />, { route: "/contact" });

    for (const entry of FAQ_ENTRIES) {
      const trigger = screen.getByRole("button", { name: entry.question });
      expect(trigger).toHaveAttribute("aria-expanded");
      expect(trigger).toHaveAttribute("aria-controls");
    }
  });

  it("starts with the first item open", () => {
    renderWithRouter(<ContactPage />, { route: "/contact" });
    expect(screen.getByRole("button", { name: FAQ_ENTRIES[0]!.question })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("opens a closed item and closes the previously open one", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContactPage />, { route: "/contact" });

    const second = screen.getByRole("button", { name: FAQ_ENTRIES[1]!.question });
    await user.click(second);

    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: FAQ_ENTRIES[0]!.question })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("toggles the same item closed", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContactPage />, { route: "/contact" });

    const first = screen.getByRole("button", { name: FAQ_ENTRIES[0]!.question });
    await user.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
  });

  it("is operable by keyboard", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContactPage />, { route: "/contact" });

    const second = screen.getByRole("button", { name: FAQ_ENTRIES[1]!.question });
    second.focus();
    await user.keyboard("{Enter}");

    expect(second).toHaveAttribute("aria-expanded", "true");
  });
});

describe("contact enquiry form", () => {
  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContactPage />, { route: "/contact" });

    await user.click(screen.getByRole("button", { name: /Send enquiry/i }));

    expect(await screen.findByText("Enter your name")).toBeInTheDocument();
    expect(await screen.findByText("Enter your email address")).toBeInTheDocument();
  });

  it("validates the email format", async () => {
    const user = userEvent.setup();
    renderWithRouter(<ContactPage />, { route: "/contact" });

    await user.type(screen.getByLabelText(/^Name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@");
    await user.click(screen.getByRole("button", { name: /Send enquiry/i }));

    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
  });

  it("submits valid input and shows a receipt", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.spyOn(formService, "submitForm");

    renderWithRouter(<ContactPage />, { route: "/contact" });

    await user.type(screen.getByLabelText(/^Name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.selectOptions(screen.getByLabelText(/Topic/i), "Wholesale coffee");
    await user.type(
      screen.getByLabelText(/Message/i),
      "We would like to stock your beans in our shop.",
    );
    await user.click(screen.getByRole("button", { name: /Send enquiry/i }));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    expect(submitSpy.mock.calls[0]?.[0]).toBe("contact");

    expect(await screen.findByText(/Your enquiry has been captured/i)).toBeInTheDocument();
    expect(useToastStore.getState().toasts[0]?.variant).toBe("success");
  });
});

describe("newsletter form", () => {
  it("validates an empty email", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomePage />, { route: "/" });

    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(await screen.findByText("Enter your email address")).toBeInTheDocument();
  });

  it("validates a malformed email", async () => {
    const user = userEvent.setup();
    renderWithRouter(<HomePage />, { route: "/" });

    await user.type(screen.getByLabelText("Email address"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(await screen.findByText(/Enter a valid email address/i)).toBeInTheDocument();
  });

  it("submits and shows success feedback", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.spyOn(formService, "submitForm");

    renderWithRouter(<HomePage />, { route: "/" });

    await user.type(screen.getByLabelText("Email address"), "you@email.com");
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));
    expect(submitSpy.mock.calls[0]?.[0]).toBe("newsletter");

    expect(await screen.findByText(/You’re on the list/i)).toBeInTheDocument();
    const messages = useToastStore.getState().toasts.map((toast) => toast.message);
    expect(messages.some((message) => message.includes("You’re on the list"))).toBe(true);
  });

  it("is labelled for assistive technology", () => {
    renderWithRouter(<HomePage />, { route: "/" });
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "email");
  });
});
