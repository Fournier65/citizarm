import { z } from "zod";
import { renderEmailTemplate } from "./template";
import type { InsertContactMessage } from "@shared/schema";
import type { ContactMessage } from "@shared/schema";

export type ContactEmailData = Pick<InsertContactMessage, "name" | "email" | "subject" | "message">;
export type StoredContactEmailData = ContactEmailData & Pick<ContactMessage, "id" | "createdAt">;

const SITE_URL = "https://citizarm.fr";
const baseTemplate = {
  siteUrl: SITE_URL,
  logoUrl: `${SITE_URL}/email-logo.png`,
  categoryLabel: "Contact CitiZarm",
  closingText: "L’équipe CitiZarm",
};

export function buildContactNotification(data: ContactEmailData) {
  const email = z.string().email().parse(data.email);
  const subject = data.subject.replace(/[\r\n]+/g, " ");
  const rendered = renderEmailTemplate({
    ...baseTemplate,
    title: "Nouveau message de contact",
    preheader: "Un visiteur vous a contacté depuis le site CitiZarm.",
    paragraphs: [
      `Nom : ${data.name}`,
      `Email : ${email}`,
      `Sujet : ${data.subject}`,
      "Message :",
      data.message,
    ],
    ctaLabel: "Répondre au visiteur",
    ctaUrl: `mailto:${email}?subject=${encodeURIComponent(`Re : ${subject}`)}`,
    footerText: "Notification interne du formulaire de contact CitiZarm.",
  });
  return {
    to: "contact@citizarm.fr",
    replyTo: email,
    subject: `${data.name.replace(/[\r\n]+/g, " ")} - [Contact] ${subject}`,
    ...rendered,
  };
}

export function buildContactAcknowledgement(data: ContactEmailData, unsubscribeUrl: string) {
  const email = z.string().email().parse(data.email);
  // Do not echo user-provided links/content in an automated email to an
  // unverified address: the receipt must not become a phishing relay.
  const rendered = renderEmailTemplate({
    ...baseTemplate,
    title: "Nous avons bien reçu votre message",
    preheader: "Votre prise de contact avec CitiZarm a bien été enregistrée.",
    paragraphs: [
      "Bonjour,",
      "Merci d’avoir contacté CitiZarm. Votre message a bien été enregistré.",
      "Notre équipe prendra connaissance de votre demande et vous répondra dès que possible.",
      "Si vous souhaitez compléter votre demande, vous pouvez répondre directement à cet email.",
    ],
    ctaLabel: "Visiter CitiZarm",
    ctaUrl: SITE_URL,
    footerText: "Cet accusé de réception fait suite à l’utilisation du formulaire de contact CitiZarm. Il ne vous inscrit pas à la newsletter.",
    unsubscribeUrl,
    unsubscribeLabel: "Se désinscrire et supprimer mon message",
  });
  return {
    to: email,
    replyTo: "contact@citizarm.fr",
    subject: "CitiZarm — Nous avons bien reçu votre message",
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
    ...rendered,
  };
}
