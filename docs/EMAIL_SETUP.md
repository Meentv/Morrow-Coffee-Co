# Connecting the mail (EmailJS)

Every form on this site — order, kitchen enquiry, contact, newsletter, and the
new bean-order flow — sends through **EmailJS**. That means real email, delivered
to your inbox, with no server to deploy.

Until the three identifiers below exist, the app runs in **demo mode**: it says so
in the UI and never claims a message was sent.

---

## 1. Create the EmailJS account and service

1. Sign up at <https://www.emailjs.com> (the free tier covers 200 emails/month
   and is enough to launch).
2. **Email Services → Add New Service** and connect the inbox you want enquiries
   to arrive in (Gmail, Outlook, or a custom SMTP). Note the **Service ID** — it
   looks like `service_abc1234`.

## 2. Create one template for all the forms

The site sends a single template and tells you which form it came from via the
`form_type` variable. Create **one** template (Email Templates → New Template)
and paste this into the **Body**:

```text
New {{form_label}} — {{reference}}

From:    {{reply_name}} <{{reply_to}}>
Sent:    {{submitted_at}}
Page:    {{page_url}}

--------------------------------------------

{{message}}
```

Set the **Subject** to:

```text
[{{form_label}}] {{reference}}
```

Set the **Reply-To** field to:

```text
{{reply_to}}
```

> Setting Reply-To is what makes "reply" in your inbox go to the _customer_
> instead of to yourself. Every form passes `reply_to`, so this is safe.

Note the **Template ID** — it looks like `template_xyz987`.

## 3. Get the public key

**Account → General → API Keys → Public Key.** It looks like `dQw4w9WgXcQ…`.

This key is designed to be public — EmailJS expects it in the browser. It cannot
send mail on its own: sends are restricted to the domains you allow-list in
**Account → General → Allowed origins**. Add your production domain there, or the
sends will be rejected with a 422.

## 4. Add the values

Create `.env.local` (already git-ignored) for development:

```bash
VITE_EMAILJS_SERVICE_ID=service_abc1234
VITE_EMAILJS_TEMPLATE_ID=template_xyz987
VITE_EMAILJS_PUBLIC_KEY=dQw4w9WgXcQ...
```

Then add the same three variables in your host's dashboard:

- **Vercel** → Project → Settings → Environment Variables
- **Netlify** → Site configuration → Environment variables

Redeploy. `isDemoMode()` now returns `false`, and the forms send for real.

## 4b. Where the email lands

The template's **To email** field is what actually decides the recipient, and it
is set in the EmailJS dashboard — not in this repo. Set it to:

```
alameenahmed588@gmail.com
```

Separately, every submission now also sends a `{{to_email}}` variable carrying the
same address (from `VITE_CONTACT_EMAIL`, defaulting to
`DEFAULT_TO_EMAIL` in `src/services/form.service.ts`). If you'd rather keep the
address in one place, point the dashboard's To field at `{{to_email}}` and change
it here instead. **If the two disagree, the dashboard wins** — that is EmailJS's
behaviour, not a bug.

## 5. Variables the template receives

Flat and stable, so the template above keeps working as forms change:

| Variable       | Meaning                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `form_type`    | Machine name: `order`, `kitchen`, `contact`, `newsletter`, `bean-order`                            |
| `form_label`   | Human name, e.g. "Café order"                                                                      |
| `reference`    | Generated reference, e.g. `MOR-7F3A1C09`                                                           |
| `submitted_at` | ISO timestamp                                                                                      |
| `page_url`     | The page the visitor was on                                                                        |
| `reply_to`     | Customer's email (use as Reply-To)                                                                 |
| `reply_name`   | Customer's name, when they gave one                                                                |
| `message`      | Every submitted field, one per line — the readable body                                            |
| _(plus)_       | Each field is **also** available individually, e.g. `{{firstName}}`, `{{email}}`, `{{totalCents}}` |

Nested values (like the order's item list) arrive as pretty-printed JSON inside
`{{message}}` and as a JSON string in their own variable, never as
`[object Object]`.

## 6. What is verified, and what is not

**Verified in this repository** (`src/services/form.service.test.ts`, 8 tests):

- With no keys: demo mode, the EmailJS SDK is never called, and the UI is told
  `mode: "demo"`.
- With only some keys: still demo mode — a partial environment never silently
  becomes a live send.
- With all three keys: `emailjs.send` is called with the right service, template
  and public key, `reply_to` reaches the template, and the result is
  `mode: "live"`.
- On rejection: a real failure is returned — network, rate-limit and
  misconfiguration are distinguished, and none of them returns success.

**Not verified here:** an actual email landing in a real inbox. That needs your
account, and it is the one step only you can confirm. Send one test submission
after configuring and check the inbox before announcing the site is live.

## 7. Order notifications

There is no payment processing. An "order" is a request: the customer submits
the basket, you get the email, you confirm and take payment on collection or by
reply. This is stated plainly on the checkout page rather than implying a card
was charged.
