import { test, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";
import type { Subscriber } from "../shared/schema";
import { renderNewsletterTemplate } from "../server/email/template";
import { buildNewsletterEmail, type NewsletterContent } from "../server/email/newsletter";
import { createUnsubscribeToken, getSubscriberIdFromToken, verifyUnsubscribeToken } from "../server/newsletter/unsubscribe";
import { registerUnsubscribeRoutes, type UnsubscribeStorage } from "../server/newsletter/routes";
import { sendNewsletterEmail } from "../server/newsletter/send";
import { storage } from "../server/storage";
import { registerRoutes } from "../server/routes";
import { createServer } from "node:http";

const testSecret = "test-only-unsubscribe-secret-not-for-production";
process.env.SESSION_SECRET = testSecret;

const subscriber: Subscriber = { id: 42, email: "test@example.com", isActive: true, createdAt: new Date(0) };
const content: NewsletterContent = {
  subject: "Actualités CitiZarm",
  title: "Bonjour & bienvenue",
  preheader: "La participation citoyenne",
  paragraphs: ["Premier paragraphe.", "Deuxième paragraphe."],
  ctaLabel: "Découvrir CitiZarm",
  ctaUrl: "https://citizarm.fr",
  siteUrl: "https://citizarm.fr",
};

test("HTML/text contain the logo, matching signed unsubscribe links and RFC 8058 headers", () => {
  const email = buildNewsletterEmail(subscriber, content);
  const url = email.headers["List-Unsubscribe"].slice(1, -1);
  assert.equal(email.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.ok(email.html.includes('alt="CitiZarm"'));
  assert.ok(email.html.includes("https://citizarm.fr/email-logo.png"));
  assert.ok(email.html.includes(url));
  assert.ok(email.text.includes(url));
  assert.ok(!url.includes(subscriber.email));
  assert.ok(email.html.includes('role="presentation"'));
  assert.ok(email.html.includes("max-width:600px"));
});

test("template escapes all content and attributes", () => {
  const template = renderNewsletterTemplate({
    ...content, title: '<script>alert("x")</script>', preheader: "<b>test</b>",
    paragraphs: ["<img src=x onerror=alert(1)>"], ctaLabel: "<b>Go</b>",
    ctaUrl: 'https://citizarm.fr/" onclick="bad',
    unsubscribeUrl: 'https://citizarm.fr/?token="bad',
    logoUrl: "https://citizarm.fr/email-logo.png",
  });
  assert.ok(!template.html.includes("<script>"));
  assert.ok(!template.html.includes("<img src=x"));
  assert.ok(template.html.includes("&lt;script&gt;"));
  assert.ok(template.html.includes("&quot; onclick=&quot;bad"));
});

test("tokens are bound to the subscriber and reject malformed or falsified values", () => {
  const token = createUnsubscribeToken(subscriber);
  assert.equal(getSubscriberIdFromToken(token), 42);
  assert.ok(verifyUnsubscribeToken(token, subscriber));
  assert.ok(!verifyUnsubscribeToken(token, { ...subscriber, email: "another@example.com" }));
  assert.ok(!verifyUnsubscribeToken(token.replace(/^42/, "43"), { ...subscriber, id: 43 }));
  assert.ok(!verifyUnsubscribeToken(token, subscriber, "another-secret"));
  assert.equal(getSubscriberIdFromToken("42.bad"), null);
  assert.equal(getSubscriberIdFromToken(["42", "bad"]), null);
  assert.equal(getSubscriberIdFromToken(`2147483648.${"x".repeat(43)}`), null);
});

test("inactive recipients, unsafe URLs, header injection and missing signing secret are refused", () => {
  assert.throws(() => buildNewsletterEmail({ ...subscriber, isActive: false }, content));
  assert.throws(() => buildNewsletterEmail(subscriber, { ...content, ctaUrl: "javascript:alert(1)" }));
  assert.throws(() => buildNewsletterEmail(subscriber, { ...content, siteUrl: "http://citizarm.fr" }));
  assert.throws(() => buildNewsletterEmail(subscriber, { ...content, subject: "Hello\r\nBcc:other@example.com" }));
  process.env.SESSION_SECRET = "";
  try { assert.throws(() => buildNewsletterEmail(subscriber, content), /SESSION_SECRET/); }
  finally { process.env.SESSION_SECRET = testSecret; }
});

async function start(t: TestContext, fail = false) {
  const current = { ...subscriber };
  let updates = 0;
  const fake: UnsubscribeStorage = {
    async getSubscriberById(id) { return id === current.id ? { ...current } : undefined; },
    async setSubscriberActive(id, active) {
      if (fail) throw new Error("simulated database failure");
      if (id !== current.id) return undefined;
      updates++;
      current.isActive = active;
      return { ...current };
    },
  };
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  registerUnsubscribeRoutes(app, fake);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections();
  }));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing test port");
  const url = `http://127.0.0.1:${address.port}/api/newsletter/unsubscribe?token=${createUnsubscribeToken(current)}`;
  return { current, url, updates: () => updates };
}

test("GET shows confirmation but link scanning never unsubscribes", async (t) => {
  const fixture = await start(t);
  const response = await fetch(fixture.url);
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes('method="post"'));
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(fixture.updates(), 0);
  assert.equal(fixture.current.isActive, true);
});

test("one-click POST updates the subscription immediately, returns empty 200 and is repeatable", async (t) => {
  const fixture = await start(t);
  for (let i = 0; i < 2; i++) {
    const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }) });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "");
  }
  assert.equal(fixture.current.isActive, false);
  const after = await fetch(fixture.url);
  assert.ok((await after.text()).includes("Désinscription confirmée"));
});

test("footer confirmation POST unsubscribes and displays success", async (t) => {
  const fixture = await start(t);
  const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ confirm: "1" }) });
  assert.equal(response.status, 200);
  assert.ok((await response.text()).includes("Désinscription confirmée"));
  assert.equal(fixture.current.isActive, false);
});

test("invalid links and unconfirmed POSTs cannot modify subscriptions", async (t) => {
  const fixture = await start(t);
  const invalid = await fetch(fixture.url.replace(/token=.*/, "token=42.invalid"), {
    method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }),
  });
  assert.equal(invalid.status, 400);
  const missingConfirmation = await fetch(fixture.url, { method: "POST" });
  assert.equal(missingConfirmation.status, 400);
  const unknown = await fetch(fixture.url.replace("token=42.", "token=43."));
  assert.equal(unknown.status, 400);
  assert.equal(fixture.updates(), 0);
});

test("database failure never displays false unsubscribe success", async (t) => {
  const fixture = await start(t, true);
  const response = await fetch(fixture.url, { method: "POST", body: new URLSearchParams({ "List-Unsubscribe": "One-Click" }) });
  assert.equal(response.status, 503);
  assert.equal(fixture.current.isActive, true);
});

test("sending rechecks active status and sends HTML/text and both headers through Resend", async (t) => {
  process.env.RESEND_API_KEY = "test-only-key";
  t.mock.method(storage, "getSubscriberById", async () => ({ ...subscriber }));
  let sent: Record<string, any> | undefined;
  t.mock.method(globalThis, "fetch", async (_url: unknown, options: RequestInit) => {
    sent = JSON.parse(options.body as string);
    return new Response(JSON.stringify({ id: "test-newsletter-id" }), { status: 200 });
  });
  assert.equal(await sendNewsletterEmail(42, content), "test-newsletter-id");
  assert.equal(sent?.to, subscriber.email);
  assert.equal(sent?.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.ok(sent?.html && sent?.text);
});

test("sending refuses inactive recipients before calling Resend", async (t) => {
  t.mock.method(storage, "getSubscriberById", async () => ({ ...subscriber, isActive: false }));
  const fetchMock = t.mock.method(globalThis, "fetch", async () => { throw new Error("Must not send"); });
  await assert.rejects(sendNewsletterEmail(42, content), /unsubscribed/);
  assert.equal(fetchMock.mock.calls.length, 0);
});

test("Resend rejection is an explicit sending failure, not a false success", async (t) => {
  t.mock.method(storage, "getSubscriberById", async () => ({ ...subscriber }));
  t.mock.method(globalThis, "fetch", async () =>
    new Response(JSON.stringify({ name: "validation_error", message: "Rejected" }), { status: 403 }));
  await assert.rejects(sendNewsletterEmail(42, content), /did not accept/);
});

test("a new voluntary subscription can reactivate an unsubscribed recipient", async (t) => {
  t.mock.method(storage, "getSubscriberByEmail", async () => ({ ...subscriber, isActive: false }));
  const activate = t.mock.method(storage, "setSubscriberActive", async () => ({ ...subscriber, isActive: true }));
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
  if (!address || typeof address === "string") throw new Error("Missing test port");
  const response = await fetch(`http://127.0.0.1:${address.port}/api/newsletter`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: subscriber.email }),
  });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).isActive, true);
  assert.deepEqual(activate.mock.calls[0].arguments, [42, true]);
});
