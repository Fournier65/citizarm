import { storage } from "../storage";
import { getResendClient } from "../resend";
import { buildNewsletterEmail, type NewsletterContent } from "../email/newsletter";

/** Server-side use only: never expose an unauthenticated newsletter-send route. */
export async function sendNewsletterEmail(subscriberId: number, content: NewsletterContent): Promise<string> {
  // Read the current status immediately before sending, not an exported/stale list.
  const subscriber = await storage.getSubscriberById(subscriberId);
  if (!subscriber || subscriber.isActive !== true) {
    throw new Error("Newsletter recipient is missing or unsubscribed");
  }
  const email = buildNewsletterEmail(subscriber, content);
  const { client, fromEmail } = getResendClient();
  const result = await client.emails.send({
    from: `CitiZarm <${fromEmail}>`,
    ...email,
  });
  if (result.error || !result.data?.id) {
    throw new Error("Resend did not accept the newsletter email");
  }
  return result.data.id;
}
