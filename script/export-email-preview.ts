import { mkdir, readFile, writeFile } from "node:fs/promises";
import { renderNewsletterPreview } from "../server/email/preview";
import { renderNewsletterTemplate } from "../server/email/template";
import { buildContactAcknowledgement, buildContactNotification } from "../server/email/contact";

await mkdir("downloads", { recursive: true });
await mkdir("emails", { recursive: true });
const logo = await readFile("client/public/email-logo.png");
const preview = renderNewsletterPreview(`data:image/png;base64,${logo.toString("base64")}`);
await writeFile("downloads/citizarm-email-apercu.html", preview.html);
await writeFile("downloads/citizarm-email-apercu.txt", preview.text);
// Portable HTML template for tools using {{variables}}. Outgoing email uses a
// public PNG, not a base64 image (which many email clients do not display).
const template = renderNewsletterTemplate({
  title: "{{title}}",
  preheader: "{{preheader}}",
  paragraphs: ["{{paragraph1}}", "{{paragraph2}}", "{{paragraph3}}"],
  ctaLabel: "{{ctaLabel}}",
  ctaUrl: "{{ctaUrl}}",
  unsubscribeUrl: "{{unsubscribeUrl}}",
  logoUrl: "https://citizarm.fr/email-logo.png",
  siteUrl: "https://citizarm.fr",
});
await writeFile("emails/citizarm-template.html", template.html);
const contact = {
  name: "Visiteur de démonstration",
  email: "visiteur@example.com",
  subject: "Découvrir les projets CitiZarm",
  message: "Bonjour,\nJe souhaite en savoir plus sur les initiatives CitiZarm.\nMerci pour votre retour.",
};
for (const [name, email] of [
  ["notification", buildContactNotification(contact)],
  ["accuse-reception", buildContactAcknowledgement(contact, "#desinscription-contact-exemple")],
] as const) {
  await writeFile(`downloads/citizarm-contact-${name}-apercu.html`,
    email.html.replaceAll("https://citizarm.fr/email-logo.png", `data:image/png;base64,${logo.toString("base64")}`));
}
console.log("Modèle HTML et aperçu autonome générés. Aucun email envoyé.");
