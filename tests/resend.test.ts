import { test } from "node:test";
import assert from "node:assert/strict";
import { sendContactNotification } from "../server/resend";

const contact = {
  name: "Exemple",
  email: "exemple@example.com",
  subject: "Question",
  message: "Bonjour, ceci est un test.",
};

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