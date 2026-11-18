import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The transport is the one place that can lie to a customer ("we sent it"),
 * so it is tested for both branches: unconfigured (demo) and configured (real
 * EmailJS send). The EmailJS SDK is mocked so no network is touched.
 */
const sendMock = vi.fn();

vi.mock("@emailjs/browser", () => ({
  default: { send: (...args: unknown[]) => sendMock(...args) },
}));

/**
 * Load a fresh copy of the service with the given env in place.
 *
 * `vi.stubEnv` is used rather than assigning `import.meta.env` directly: a
 * manual save/restore leaks values between tests (a partially-configured test
 * inherited the previous test's keys and reported live mode). Empty string
 * stands in for "not set", because the service trims and treats it as absent.
 */
async function loadService(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return { mod: await import("./form.service") };
}

const UNSET = {
  VITE_EMAILJS_SERVICE_ID: "",
  VITE_EMAILJS_TEMPLATE_ID: "",
  VITE_EMAILJS_PUBLIC_KEY: "",
};

const KEYS = {
  VITE_EMAILJS_SERVICE_ID: "service_test",
  VITE_EMAILJS_TEMPLATE_ID: "template_test",
  VITE_EMAILJS_PUBLIC_KEY: "public_test",
};

describe("form.service — demo mode (no EmailJS keys)", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("reports demo mode and never calls the SDK", async () => {
    const loaded = await loadService(UNSET);
    sendMock.mockClear();

    expect(loaded.mod.isDemoMode()).toBe(true);

    const result = await loaded.mod.submitForm("contact", { name: "Ada", message: "Hi" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mode).toBe("demo");
      expect(result.data.reference).toMatch(/^ENQ-/);
    }
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("treats a partially configured environment as demo, not live", async () => {
    const loaded = await loadService({
      VITE_EMAILJS_SERVICE_ID: "service_test",
      VITE_EMAILJS_TEMPLATE_ID: "",
      VITE_EMAILJS_PUBLIC_KEY: "public_test",
    });

    expect(loaded.mod.isDemoMode()).toBe(true);
    const result = await loaded.mod.submitForm("newsletter", { email: "a@b.com" });
    expect(result.ok && result.data.mode).toBe("demo");
  });
});

describe("form.service — live mode (EmailJS configured)", () => {
  beforeEach(() => {
    sendMock.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());

  it("is not demo mode once all three identifiers are present", async () => {
    const loaded = await loadService(KEYS);
    expect(loaded.mod.isDemoMode()).toBe(false);
  });

  it("sends through EmailJS and reports live mode", async () => {
    const loaded = await loadService(KEYS);
    sendMock.mockResolvedValue({ status: 200, text: "OK" });

    const result = await loaded.mod.submitForm(
      "order",
      { firstName: "Ada", email: "ada@example.com", totalCents: 1480 },
      { replyTo: "ada@example.com", replyName: "Ada" },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mode).toBe("live");
      expect(result.data.reference).toMatch(/^MOR-/);
    }

    expect(sendMock).toHaveBeenCalledTimes(1);
    const [serviceId, templateId, params, options] = sendMock.mock.calls[0]!;
    expect(serviceId).toBe(KEYS.VITE_EMAILJS_SERVICE_ID);
    expect(templateId).toBe(KEYS.VITE_EMAILJS_TEMPLATE_ID);
    expect(options).toEqual({ publicKey: KEYS.VITE_EMAILJS_PUBLIC_KEY });

    // The reply address must reach the template, or replies go nowhere.
    expect(params.reply_to).toBe("ada@example.com");
    expect(params.reply_name).toBe("Ada");
    expect(params.form_type).toBe("order");
    expect(params.form_label).toBe("Café order");
    expect(params.reference).toMatch(/^MOR-/);
  });

  it("passes nested values as readable text, never [object Object]", async () => {
    const loaded = await loadService(KEYS);
    sendMock.mockResolvedValue({ status: 200, text: "OK" });

    await loaded.mod.submitForm("order", {
      firstName: "Ada",
      items: [{ id: "latte", quantity: 2 }],
    });

    const params = sendMock.mock.calls[0]![2] as Record<string, string>;
    expect(params.items).toContain("latte");
    expect(params.items).not.toContain("[object Object]");
    expect(params.message).toContain("firstName: Ada");
  });

  it("returns a failure — never a fake success — when EmailJS rejects", async () => {
    const loaded = await loadService(KEYS);
    sendMock.mockRejectedValue({ status: 500, text: "boom" });

    const result = await loaded.mod.submitForm("contact", { name: "Ada" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("network");
      expect(result.error.message).toMatch(/try again/i);
    }
  });

  it("surfaces a rate limit distinctly", async () => {
    const loaded = await loadService(KEYS);
    sendMock.mockRejectedValue({ status: 429, text: "Too many" });

    const result = await loaded.mod.submitForm("contact", { name: "Ada" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/too many/i);
    }
  });

  it("flags a template misconfiguration as unconfigured, not the visitor's fault", async () => {
    const loaded = await loadService(KEYS);
    sendMock.mockRejectedValue({ status: 422, text: "template invalid" });

    const result = await loaded.mod.submitForm("kitchen", { name: "Ada" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("unconfigured");
      expect(result.error.message).not.toMatch(/your details/i);
    }
  });
});
