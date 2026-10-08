import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import express from "express";
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";
import type { InsertContactMessage } from "../shared/schema";

const realFetch = globalThis.fetch.bind(globalThis);
const contact = { name: "Exemple", email: "visitor@example.com", subject: "Question", message: "Bonjour, ceci est un test." };
process.env.SESSION_SECRET = "test-only-contact-secret-not-for-production";

async function start(t: TestContext, failSave = false, failReceipt = false) {
  let saved = 0;
  const sent: Record<string, any>[] = [];
  t.mock.method(storage, "createContactMessage", async (data: InsertContactMessage) => {
    if (failSave) throw new Error("simulated database failure");
    saved++;
    return { ...data, id: 1, createdAt: new Date(0) };
  });
  process.env.RESEND_API_KEY = "test-only-key";
  t.mock.method(globalThis, "fetch", async (_url: unknown, options: RequestInit) => {
    assert.equal(saved, 1, "the message must be saved before any email is sent");
    const payload = JSON.parse(options.body as string);
    sent.push(payload);
    const failed = failReceipt && payload.to === contact.email;
    return failed ? new Response(JSON.stringify({ name: "validation_error", message: "Rejected" }), { status: 403 })
      : new Response(JSON.stringify({ id: "test-id" }), { status: 200 });
  });
  const app = express();
  app.use(express.json());
  const server = createServer(app);
  await registerRoutes(server, app);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections();
  }));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing port");
  return { url: `http://127.0.0.1:${address.port}/api/contact`, sent, saved: () => saved };
}

test("contact is saved first, then both branded emails are sent and reported separately", async (t) => {
  const fixture = await start(t);
  const response = await realFetch(fixture.url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact),
  });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.notificationSent, true);
  assert.equal(result.acknowledgementSent, true);
  assert.equal(fixture.saved(), 1);
  assert.deepEqual(fixture.sent.map(email => email.to).sort(), ["contact@citizarm.fr", contact.email].sort());
});

test("receipt failure keeps the saved contact and internal notification success", async (t) => {
  const fixture = await start(t, false, true);
  const response = await realFetch(fixture.url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact),
  });
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.equal(result.notificationSent, true);
  assert.equal(result.acknowledgementSent, false);
  assert.equal(fixture.saved(), 1);
});

test("database failure sends neither an internal notification nor a false receipt", async (t) => {
  const fixture = await start(t, true);
  const response = await realFetch(fixture.url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact),
  });
  assert.equal(response.status, 500);
  assert.equal(fixture.sent.length, 0);
});

test("invalid recipient is rejected before saving and sending", async (t) => {
  const fixture = await start(t);
  const response = await realFetch(fixture.url, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...contact, email: "invalid" }),
  });
  assert.equal(response.status, 400);
  assert.equal(fixture.saved(), 0);
  assert.equal(fixture.sent.length, 0);
});
