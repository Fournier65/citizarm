import type { Subscriber } from "@shared/schema";
import { renderNewsletterTemplate } from "./template";
import { createUnsubscribeUrl } from "../newsletter/unsubscribe";

export interface NewsletterContent {
  subject: string;
  title: string;
  preheader: string;
  paragraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
  /** Public HTTPS origin where the unsubscribe endpoint is deployed. */
  siteUrl: string;
}

function httpsUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("Newsletter links must use HTTPS without embedded credentials");
  }
  return url;
}

export function buildNewsletterEmail(subscriber: Subscriber, content: NewsletterContent) {
  if (subscriber.isActive !== true) throw new Error("Cannot email an inactive subscriber");
  if (!content.subject.trim() || /[\r\n]/.test(content.subject)) throw new Error("Invalid email subject");
  if (!content.title.trim() || !content.paragraphs.length) throw new Error("Newsletter content is empty");
  const site = httpsUrl(content.siteUrl);
  if (site.pathname !== "/" || site.search || site.hash) {
    throw new Error("siteUrl must be the public HTTPS origin of CitiZarm");
  }
  const ctaUrl = httpsUrl(content.ctaUrl).toString();
  const unsubscribeUrl = createUnsubscribeUrl(subscriber, site.origin);
  const rendered = renderNewsletterTemplate({
    ...content,
    siteUrl: site.origin,
    ctaUrl,
    logoUrl: new URL("/email-logo.png?v=20261009", site.origin).toString(),
    unsubscribeUrl,
  });
  return {
    to: subscriber.email,
    subject: content.subject,
    ...rendered,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
