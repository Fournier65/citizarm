import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import type { ContactMessage } from "../shared/schema";
import { createContactUnsubscribeToken, verifyContactUnsubscribeToken } from "../server/contact/unsubscribe";
import { registerContactUnsubscribeRoutes, type ContactRemovalStorage } from "../server/contact/routes";
import { createUnsubscribeToken } from "../server/newsletter/unsubscribe";

const secret = "test-only-contact-secret-not-for-production";
process.env.SESSION_SECRET = secret;
const message: ContactMessage = {
  id: 17, name: "Test", email: "visitor@example.com", subject: "Question", message: "Test message", createdAt: new Date(1700000000123),
};

test("contact capability is signed, creation-bound, and distinct from newsletter tokens", () => {
  const token = createContactUnsubscribeToken(message);
  assert.deepEqual(verifyContactUnsubscribeToken(token), { id: 17, timestamp: message.createdAt!.getTime() });
  assert.equal(verifyContactUnsubscribeToken(token.replace(/^17/, "18")), null);
  assert.equal(verifyContactUnsubscribeToken(token, "other-secret"), null);
  assert.equal(verifyContactUnsubscribeToken(createUnsubscribeToken({ id: 17, email: message.email })), null);
  assert.equal(verifyContactUnsubscribeToken(["invalid"]), null);
  assert.throws(() => createContactUnsubscribeToken({ id: 17, createdAt: null }));
});

async function start(t: TestContext, fail = false) {
  const records = new Map([
    [message.id, { ...message }],
    [18, { ...message, id: 18 }],
  ]);
  const newsletter = { email: message.email, isActive: true };
  const deletes: number[] = [];
  const fake: ContactRemovalStorage = {
    async getContactMessageById(id) { return records.get(id); },
    async deleteContactMessage(id, timestamp) {
      if (fail) throw new Error("simulated database failure");
      const record = records.get(id);
      if (!record || record.createdAt?.getTime() !== timestamp) return false;
      deletes.push(id);
      return records.delete(id);
    },
  };
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  registerContactUnsubscribeRoutes(app, fake);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve) => {
    server.close(() => resolve()); server.closeAllConnections();
  }));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test port");
  return {
    records, newsletter, deletes,
    url: `http://127.0.0.1:${address.port}/api/contact/unsubscribe?token=${createContactUnsubscribeToken(message)}`,
  };
}

test("GET is scanner-safe and explains permanent deletion", async (t) => {
  const fixture = await start(t);
  const response = await fetch(fixture.url);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('method="post"'));
  assert.ok(html.includes("supprime définitivement"));
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(fixture.records.size, 2);
  assert.deepEqual(fixture.deletes, []);
});

test("confirmation deletes only the linked contact row, even with another message from the same email", async (t) => {
  const fixture = await start(t);
  const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ confirm: "1" }) });
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes("Message supprimé"));
  assert.equal(fixture.records.has(17), false);
  assert.equal(fixture.records.has(18), true);
  assert.equal(fixture.newsletter.isActive, true);
  assert.deepEqual(fixture.deletes, [17]);
});

test("RFC 8058 one-click deletes the record and repeated requests return empty 200", async (t) => {
  const fixture = await start(t);
  for (let i = 0; i < 2; i++) {
    const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }) });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "");
  }
  assert.deepEqual(fixture.deletes, [17]);
  const after = await fetch(fixture.url);
  assert.ok((await after.text()).includes("Message supprimé"));
});

test("a modified ID, malformed token or unconfirmed POST never deletes anything", async (t) => {
  const fixture = await start(t);
  const options = { method: "POST", body: new URLSearchParams({ confirm: "1" }) };
  assert.equal((await fetch(fixture.url.replace("token=17.", "token=18."), options)).status, 400);
  assert.equal((await fetch(fixture.url.replace(/token=.*/, "token=invalid"), options)).status, 400);
  assert.equal((await fetch(fixture.url, { method: "POST" })).status, 400);
  assert.equal(fixture.records.size, 2);
});

test("a valid old token cannot delete a new contact that reused the same ID", async (t) => {
  const fixture = await start(t);
  fixture.records.set(17, { ...message, createdAt: new Date(1700000000999) });
  const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ confirm: "1" }) });
  assert.equal(response.status, 400);
  assert.equal(fixture.records.size, 2);
});

test("database failure returns 503 without claiming the row was deleted", async (t) => {
  const fixture = await start(t, true);
  const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }) });
  assert.equal(response.status, 503);
  assert.equal(fixture.records.size, 2);
});
