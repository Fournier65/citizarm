import { Resend } from 'resend';
import { buildContactAcknowledgement, buildContactNotification, type ContactEmailData, type StoredContactEmailData } from "./email/contact";
import { createContactUnsubscribeUrl } from "./contact/unsubscribe";

const FROM_EMAIL = 'contact@citizarm.fr';

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  
  return {
    client: new Resend(apiKey),
    fromEmail: FROM_EMAIL
  };
}

async function sendContactEmail(kind: "notification" | "acknowledgement",
  build: () => ReturnType<typeof buildContactNotification> | ReturnType<typeof buildContactAcknowledgement>) {
  try {
    const email = build();
    const { client, fromEmail } = getResendClient();
    
    const result = await client.emails.send({
      from: `CitiZarm <${fromEmail}>`,
      ...email,
    });
    
    if (result.error || !result.data?.id) {
      console.error(`[Resend] Contact ${kind} rejected`);
      return false;
    }

    console.log(`[Resend] Contact ${kind} accepted`);
    return true;
  } catch {
    console.error(`[Resend] Contact ${kind} failed`);
    return false;
  }
}

export function sendContactNotification(data: ContactEmailData) {
  return sendContactEmail("notification", () => buildContactNotification(data));
}

export function sendContactAcknowledgement(data: StoredContactEmailData) {
  return sendContactEmail("acknowledgement", () =>
    buildContactAcknowledgement(data, createContactUnsubscribeUrl(data, "https://citizarm.fr")));
}

export async function sendContactEmails(data: StoredContactEmailData) {
  // Each send handles its own failure. A stored message still gets a receipt
  // even if the internal notification fails, and vice versa.
  const [notificationSent, acknowledgementSent] = await Promise.all([
    sendContactNotification(data),
    sendContactAcknowledgement(data),
  ]);
  return { notificationSent, acknowledgementSent };
}
