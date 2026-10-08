import { createHmac, timingSafeEqual } from "node:crypto";
import type { ContactMessage } from "@shared/schema";
import { getUnsubscribeSecret } from "../newsletter/unsubscribe";

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`citizarm-contact-delete:v1:${payload}`).digest("base64url");
}

export function createContactUnsubscribeToken(
  message: Pick<ContactMessage, "id" | "createdAt">,
  secret = getUnsubscribeSecret(),
) {
  const timestamp = message.createdAt?.getTime();
  if (!Number.isInteger(message.id) || message.id < 1 || message.id > 2147483647 ||
      timestamp === undefined || !Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new Error("A saved contact message with a creation date is required");
  }
  const payload = `${message.id}.${timestamp}`;
  return `${payload}.${signature(payload, secret)}`;
}

export function verifyContactUnsubscribeToken(token: unknown, secret = getUnsubscribeSecret()) {
  if (typeof token !== "string") return null;
  const match = /^([1-9]\d{0,9})\.(\d{1,16})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!match) return null;
  const id = Number(match[1]);
  const timestamp = Number(match[2]);
  if (id > 2147483647 || !Number.isSafeInteger(timestamp) || timestamp > 8640000000000000) return null;
  const expected = Buffer.from(signature(`${match[1]}.${match[2]}`, secret));
  const supplied = Buffer.from(match[3]);
  if (!timingSafeEqual(expected, supplied)) return null;
  return { id, timestamp };
}

export function createContactUnsubscribeUrl(message: Pick<ContactMessage, "id" | "createdAt">, siteUrl: string) {
  const url = new URL("/api/contact/unsubscribe", siteUrl);
  url.searchParams.set("token", createContactUnsubscribeToken(message));
  return url.toString();
}
