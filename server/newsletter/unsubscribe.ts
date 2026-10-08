import { createHmac, timingSafeEqual } from "node:crypto";
import type { Subscriber } from "@shared/schema";

export function getUnsubscribeSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("Email unsubscribe requires a stable SESSION_SECRET of at least 32 characters");
  }
  return secret;
}

function signature(subscriber: Pick<Subscriber, "id" | "email">, secret: string) {
  return createHmac("sha256", secret)
    .update(`citizarm-newsletter-unsubscribe:v1:${subscriber.id}:${subscriber.email}`)
    .digest("base64url");
}

export function createUnsubscribeToken(
  subscriber: Pick<Subscriber, "id" | "email">,
  secret = getUnsubscribeSecret(),
): string {
  return `${subscriber.id}.${signature(subscriber, secret)}`;
}

export function getSubscriberIdFromToken(token: unknown): number | null {
  if (typeof token !== "string" || !/^[1-9]\d{0,9}\.[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const id = Number(token.split(".")[0]);
  return Number.isSafeInteger(id) && id <= 2147483647 ? id : null;
}

export function verifyUnsubscribeToken(
  token: string,
  subscriber: Pick<Subscriber, "id" | "email">,
  secret = getUnsubscribeSecret(),
): boolean {
  if (getSubscriberIdFromToken(token) !== subscriber.id) return false;
  const supplied = Buffer.from(token.split(".")[1]);
  const expected = Buffer.from(signature(subscriber, secret));
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function createUnsubscribeUrl(subscriber: Pick<Subscriber, "id" | "email">, siteUrl: string): string {
  const url = new URL("/api/newsletter/unsubscribe", siteUrl);
  url.searchParams.set("token", createUnsubscribeToken(subscriber));
  return url.toString();
}
