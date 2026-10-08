import { test } from "node:test";
import assert from "node:assert/strict";
import { sendContactNotification, sendContactAcknowledgement, sendContactEmails } from "../server/resend";
import { buildContactAcknowledgement, buildContactNotification } from "../server/email/contact";

const contact = {
  id: 17,
  createdAt: new Date(0),
  name: "Exemple",
  email: "exemple@example.com",
  subject: "Question",
  message: "Bonjour, ceci est un test.",
};
process.env.SESSION_SECRET = "test-only-contact-secret-not-for-production";

test("Resend accepts the contact notification", async (t) => {
  process.env.RESEND_API_KEY = "test-only-key";
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ id: "test-email-id" }), { status: 200 }),
  );

  assert.equal(await sendContactNotification(contact), true);
});

test("Resend API errors are reported as failed notifications", async (t) => {
  process.env.RESEND_API_KEY = "test-only-key";
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ name: "validation_error", message: "Domain is not verified" }), { status: 403 }),
  );

  assert.equal(await sendContactNotification(contact), false);
});

test("a missing API key is reported as a failed notification", async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal(await sendContactNotification(contact), false);
});

test("internal notification uses the shared branded HTML/text template and visitor Reply-To", () => {
  const email = buildContactNotification({ ...contact, name: '<b>Visiteur</b>', message: '<script>alert(1)</script>\nDeuxième ligne' });
  assert.equal(email.to, "contact@citizarm.fr");
  assert.equal(email.replyTo, contact.email);
  assert.ok(email.html.includes("https://citizarm.fr/email-logo.png"));
  assert.ok(email.html.includes("&lt;b&gt;Visiteur&lt;/b&gt;"));
  assert.ok(email.html.includes("&lt;script&gt;alert(1)&lt;/script&gt;<br>Deuxième ligne"));
  assert.ok(email.html.includes(`mailto:${contact.email}`));
  assert.ok(email.text.includes("<script>alert(1)</script>\nDeuxième ligne"));
  assert.ok(!email.html.includes("Se désinscrire"));
  assert.ok(!email.html.includes("vous avez choisi de suivre"));
});

test("receipt is addressed to the visitor without reflecting their content or implying a subscription", () => {
  const email = buildContactAcknowledgement({ ...contact, message: "https://malicious.example", subject: "Untrusted subject" }, "https://citizarm.fr/api/contact/unsubscribe?token=EXAMPLE");
  assert.equal(email.to, contact.email);
  assert.equal(email.replyTo, "contact@citizarm.fr");
  assert.ok(email.html.includes("Nous avons bien reçu votre message"));
  assert.ok(email.text.includes("Votre message a bien été enregistré"));
  assert.ok(email.html.includes("email-logo.png"));
  assert.ok(!email.html.includes("malicious.example"));
  assert.ok(!email.html.includes("Untrusted subject"));
  assert.ok(email.html.includes("Se désinscrire et supprimer mon message"));
  assert.ok(email.text.includes("/api/contact/unsubscribe"));
  assert.ok(!email.html.includes("Se désinscrire de la newsletter"));
});

test("notification subject cannot inject mail headers", () => {
  const email = buildContactNotification({ ...contact, name: "Name\r\nInjected", subject: "Subject\r\nBcc: other@example.com" });
  assert.ok(!/[\r\n]/.test(email.subject));
});

test("receipt uses contact-deletion headers and a signed footer URL, not newsletter unsubscribe", async (t) => {
  process.env.RESEND_API_KEY = "test-only-key";
  let sent: Record<string, any> | undefined;
  t.mock.method(globalThis, "fetch", async (_url: unknown, options: RequestInit) => {
    sent = JSON.parse(options.body as string);
    return new Response(JSON.stringify({ id: "test-receipt-id" }), { status: 200 });
  });
  assert.equal(await sendContactAcknowledgement(contact), true);
  assert.equal(sent?.to, contact.email);
  assert.equal(sent?.reply_to, "contact@citizarm.fr");
  assert.ok(sent?.html.includes("email-logo.png"));
  assert.ok(sent?.text);
  assert.equal(sent?.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  const url = sent?.headers["List-Unsubscribe"].slice(1, -1);
  assert.ok(url.includes("/api/contact/unsubscribe?token="));
  assert.ok(sent?.html.includes(url));
  assert.ok(sent?.text.includes(url));
  assert.ok(!url.includes(contact.email));
});

for (const [notificationSent, acknowledgementSent] of [[true, true], [true, false], [false, true], [false, false]]) {
  test(`independent outcomes: notification=${notificationSent}, receipt=${acknowledgementSent}`, async (t) => {
    process.env.RESEND_API_KEY = "test-only-key";
    let requests = 0;
    t.mock.method(globalThis, "fetch", async (_url: unknown, options: RequestInit) => {
      requests++;
      const payload = JSON.parse(options.body as string);
      const accepted = payload.to === "contact@citizarm.fr" ? notificationSent : acknowledgementSent;
      return accepted ? new Response(JSON.stringify({ id: "test-id" }), { status: 200 })
        : new Response(JSON.stringify({ name: "validation_error", message: "Rejected" }), { status: 403 });
    });
    assert.deepEqual(await sendContactEmails(contact), { notificationSent, acknowledgementSent });
    assert.equal(requests, 2);
  });
}

test("invalid visitor address does not send a receipt", async (t) => {
  const mock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Must not send"); });
  assert.equal(await sendContactAcknowledgement({ ...contact, email: "invalid" }), false);
  assert.equal(mock.mock.calls.length, 0);
});