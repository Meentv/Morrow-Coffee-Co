import { expect, test } from "@playwright/test";

/**
 * End-to-end order flow (the smoke test required by the brief).
 *
 * Runs against the production build with the mock service layer — no real
 * payment processing and no external API.
 */
test.describe("order flow", () => {
  test("browse the menu, add an item, change quantity, and place an order", async ({ page }) => {
    // 1. Open the website.
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Good mornings");

    // 2. Navigate to the menu.
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Menu" }).click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Take your");

    // 3. Find a product (search is part of finding it).
    await page.getByRole("searchbox", { name: "Search the menu" }).fill("latte");
    const latteCard = page.getByRole("article").filter({ hasText: "Honey Oat Latte" });
    await expect(latteCard).toBeVisible();

    // 4. Add it to the cart.
    await latteCard.getByRole("button", { name: /Add Honey Oat Latte to basket/i }).click();
    await expect(page.getByRole("link", { name: /basket, 1 item/i })).toBeVisible();

    // 5. Increase its quantity from the basket panel.
    const basket = page.getByRole("complementary");
    await basket.getByRole("button", { name: /Increase quantity of Honey Oat Latte/i }).click();
    await expect(basket.getByText("$11.00")).toBeVisible();

    // Cart survives a navigation (persisted, not just in memory).
    await page.reload();
    await expect(page.getByRole("link", { name: /basket, 2 items/i })).toBeVisible();

    // 6. Navigate to checkout.
    await page.getByRole("button", { name: /Continue order/i }).click();
    await expect(page).toHaveURL(/\/order$/);

    // 7. Complete the order form.
    await page.getByLabel(/First name/i).fill("Ada");
    await page.getByLabel(/^Phone/i).fill("+234 801 234 5678");

    // Delivery must demand an address before it will submit.
    await page.getByLabel(/Order type/i).selectOption("Local delivery");
    await page.getByRole("button", { name: /Place request/i }).click();
    await expect(page.getByText(/need a delivery address/i)).toBeVisible();

    await page.getByLabel(/Delivery address/i).fill("18 Test Street, Ibadan");

    // 8. Submit the order.
    await page.getByRole("button", { name: /Place request/i }).click();

    // 9. Verify the expected success state.
    await expect(
      page.getByRole("heading", { name: /Your order request is in/i }),
    ).toBeVisible();
    await expect(page.getByText(/Demo mode/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /basket is empty/i })).toBeVisible();
  });

  test("refuses to check out with an empty basket", async ({ page }) => {
    await page.goto("/menu");
    await page.getByRole("button", { name: /Continue order/i }).click();

    await expect(page.getByText(/Your basket is empty — add something first/i)).toBeVisible();
    await expect(page).toHaveURL(/\/menu$/);
  });
});

test.describe("navigation and content", () => {
  test("every page loads with a unique title and one h1", async ({ page }) => {
    const pages = [
      { path: "/", title: /Good coffee, made human/i },
      { path: "/menu", title: /Menu/i },
      { path: "/kitchen", title: /Kitchen/i },
      { path: "/order", title: /Order/i },
      { path: "/contact", title: /Contact/i },
    ];

    for (const entry of pages) {
      await page.goto(entry.path);
      await expect(page).toHaveTitle(entry.title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    }
  });

  test("mobile navigation opens, closes with Escape, and is keyboard reachable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const trigger = page.getByRole("button", { name: /Open navigation menu/i });
    await trigger.click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("deep link with ?cat= filters the menu", async ({ page }) => {
    await page.goto("/menu?cat=bakery");
    await expect(page.getByRole("button", { name: "Bakery" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("article")).toHaveCount(3);
  });

  test("no page overflows horizontally on a small phone", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });

    for (const path of ["/", "/menu", "/kitchen", "/order", "/contact"]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(1);
    }
  });
});

test.describe("forms", () => {
  test("newsletter validates and confirms", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText(/Enter a valid email address/i)).toBeVisible();

    await page.getByLabel("Email address").fill("you@email.com");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText(/You’re on the list/i)).toBeVisible();
  });

  test("kitchen enquiry submits", async ({ page }) => {
    await page.goto("/kitchen");

    await page.getByLabel(/Your name/i).fill("Ada");
    await page.getByLabel(/Email or phone/i).fill("ada@example.com");
    await page
      .getByLabel(/Tell us about it/i)
      .fill("A launch party for 40 people next month, coffee bar plus small plates.");
    await page.getByRole("button", { name: /Send kitchen request/i }).click();

    await expect(page.getByText(/Your kitchen request has been captured/i)).toBeVisible();
  });
});
