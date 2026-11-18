import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import OrderPage from "@/pages/OrderPage";
import { renderWithRouter } from "@/test/renderWithRouter";
import { resetCartStore, useCartStore } from "@/features/cart/store/cart.store";
import { useToastStore } from "@/components/feedback/toast.store";
import { MENU_ITEMS } from "@/data/menu";
import * as formService from "@/services/form.service";

const latte = MENU_ITEMS[0]!;
const croissant = MENU_ITEMS.find((item) => item.id === "butter-croissant")!;

beforeEach(() => {
  resetCartStore();
  useToastStore.getState().clear();
});

function seedCart() {
  useCartStore.getState().addItem(latte, 2); // 1100
  useCartStore.getState().addItem(croissant, 1); // 380
}

describe("order page: empty basket", () => {
  it("blocks submission and explains why", async () => {
    renderWithRouter(<OrderPage />, { route: "/order" });

    expect(screen.getAllByText(/Your basket is empty/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Place request/i })).toBeDisabled();
  });

  it("shows the empty-basket message in the basket panel", () => {
    renderWithRouter(<OrderPage />, { route: "/order" });
    expect(screen.getAllByText(/Your basket is empty/i).length).toBeGreaterThan(0);
  });
});

describe("order page: validation", () => {
  beforeEach(seedCart);

  it("requires a first name", async () => {
    const user = userEvent.setup();
    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.click(screen.getByRole("button", { name: /Place request/i }));

    expect(await screen.findByText("Enter your first name")).toBeInTheDocument();
    expect(screen.getByLabelText(/First name/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("requires a phone number", async () => {
    const user = userEvent.setup();
    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    expect(await screen.findByText(/Enter a phone number/i)).toBeInTheDocument();
  });

  it("rejects an invalid phone number", async () => {
    const user = userEvent.setup();
    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "abc");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    expect(await screen.findByText("Enter a valid phone number")).toBeInTheDocument();
  });

  it("requires a delivery address when local delivery is chosen", async () => {
    const user = userEvent.setup();
    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");
    await user.selectOptions(screen.getByLabelText(/Order type/i), "Local delivery");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    expect(
      await screen.findByText("We need a delivery address for local delivery"),
    ).toBeInTheDocument();

    // Nothing was submitted.
    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("does not require an address for pickup", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.spyOn(formService, "submitForm");

    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");
    await user.selectOptions(screen.getByLabelText(/Order type/i), "Pickup from Morrow");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    expect(screen.queryByText(/need a delivery address/i)).not.toBeInTheDocument();
  }, 15000);
});

describe("order page: successful submission", () => {
  beforeEach(seedCart);

  it("submits a payload with ids, quantities, prices and totals", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.spyOn(formService, "submitForm");

    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");
    await user.type(screen.getByLabelText(/Anything else/i), "Oat milk please");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    await waitFor(() => expect(submitSpy).toHaveBeenCalledTimes(1));

    const [kind, payload] = submitSpy.mock.calls[0]!;
    expect(kind).toBe("order");

    const order = payload as unknown as {
      items: Array<{
        productId: string;
        quantity: number;
        unitPriceCents: number;
        lineTotalCents: number;
      }>;
      totals: { itemCount: number; subtotalCents: number; totalCents: number; currency: string };
      fulfilment: { orderType: string; address: string | null };
      customer: { firstName: string; phone: string };
    };

    expect(order.customer.firstName).toBe("Ada");
    expect(order.fulfilment.orderType).toBe("Pickup from Morrow");
    expect(order.fulfilment.address).toBeNull();

    expect(order.items).toHaveLength(2);
    expect(order.items[0]).toMatchObject({
      productId: latte.id,
      quantity: 2,
      unitPriceCents: 550,
      lineTotalCents: 1100,
    });
    expect(order.items[1]).toMatchObject({
      productId: croissant.id,
      quantity: 1,
      unitPriceCents: 380,
      lineTotalCents: 380,
    });

    expect(order.totals).toEqual({
      itemCount: 3,
      subtotalCents: 1480,
      totalCents: 1480,
      currency: "USD",
    });
  }, 15000);

  it("shows a success state and empties the basket", async () => {
    const user = userEvent.setup();
    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    expect(
      await screen.findByRole("heading", { name: /Your order request is in/i }),
    ).toBeInTheDocument();
    expect(useCartStore.getState().lines).toHaveLength(0);
  }, 15000);

  it("is honest that demo mode did not contact the business", async () => {
    const user = userEvent.setup();
    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    const note = await screen.findByText(/This build has no backend connected/i);
    expect(note).toBeInTheDocument();
    expect(note.textContent).toMatch(/Demo mode/);
    expect(note.textContent).toMatch(/were not sent to Morrow/);
  }, 15000);

  it("prevents duplicate submissions while in flight", async () => {
    const user = userEvent.setup();
    const submitSpy = vi.spyOn(formService, "submitForm");

    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");

    const submit = screen.getByRole("button", { name: /Place request/i });
    await user.click(submit);
    await user.click(submit);
    await user.click(submit);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Your order request is in/i }),
      ).toBeInTheDocument(),
    );
    expect(submitSpy).toHaveBeenCalledTimes(1);
  }, 20000);
});

describe("order page: service failure", () => {
  beforeEach(seedCart);

  it("surfaces an error, keeps the basket, and toasts", async () => {
    const user = userEvent.setup();
    vi.spyOn(formService, "submitForm").mockResolvedValueOnce({
      ok: false,
      error: { code: "network", message: "We couldn’t reach the kitchen." },
    });

    renderWithRouter(<OrderPage />, { route: "/order" });

    await user.type(screen.getByLabelText(/First name/i), "Ada");
    await user.type(screen.getByLabelText(/^Email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/Phone/i), "+234 801 234 5678");
    await user.click(screen.getByRole("button", { name: /Place request/i }));

    expect(await screen.findByText("We couldn’t reach the kitchen.")).toBeInTheDocument();
    expect(screen.getByText(/That didn’t go through/i)).toBeInTheDocument();

    // The basket must survive a failed submission.
    expect(useCartStore.getState().lines).toHaveLength(2);
    expect(useToastStore.getState().toasts[0]?.variant).toBe("error");
  }, 15000);
});
