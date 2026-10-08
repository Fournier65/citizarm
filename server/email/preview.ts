import { renderNewsletterTemplate } from "./template";

export function renderNewsletterPreview(logoUrl: string) {
  return renderNewsletterTemplate({
    title: "La démocratie se construit ensemble",
    preheader: "Découvrez le modèle de newsletter CitiZarm.",
    paragraphs: [
      "Bonjour,",
      "CitiZarm développe des outils numériques pour renforcer la participation citoyenne et la démocratie directe.",
      "Ce modèle accueille vos actualités, vos projets et vos invitations à participer. Son contenu sera personnalisé pour chaque édition.",
      "Ceci est un aperçu : aucun email n’est envoyé. Le lien de désinscription ci-dessous est illustratif ; chaque email envoyé comporte son propre lien sécurisé.",
    ],
    ctaLabel: "Découvrir CitiZarm",
    ctaUrl: "https://citizarm.fr",
    unsubscribeUrl: "#desinscription-exemple",
    siteUrl: "https://citizarm.fr",
    logoUrl,
  });
}
