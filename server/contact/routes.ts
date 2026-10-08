import type { Express, Request, Response } from "express";
import type { ContactMessage } from "@shared/schema";
import { verifyContactUnsubscribeToken } from "./unsubscribe";

export interface ContactRemovalStorage {
  getContactMessageById(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number, createdAtMilliseconds: number): Promise<boolean>;
}

function page(title: string, text: string, token?: string) {
  const form = token ? `<form method="post" action="/api/contact/unsubscribe?token=${encodeURIComponent(token)}">
    <input type="hidden" name="confirm" value="1"><button type="submit">Supprimer mon message</button></form>` : "";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} — CitiZarm</title>
    <style>body{margin:0;background:#eef6fa;font:16px Arial,sans-serif;color:#16465a}
    main{box-sizing:border-box;max-width:560px;margin:48px auto;padding:32px;background:white;border-radius:16px}
    img{display:block;width:96px;height:96px;margin:0 auto 28px}h1{font-size:28px}p{line-height:1.6}
    button{font:inherit;background:#21647b;color:white;border:0;border-radius:8px;padding:14px 24px;cursor:pointer}
    a{color:#21647b}button:focus-visible,a:focus-visible{outline:3px solid #16465a;outline-offset:4px}
    @media(max-width:600px){main{margin:16px;padding:24px}}</style></head><body><main>
    <img src="/email-logo.png" alt="CitiZarm"><h1>${title}</h1><p>${text}</p>${form}
    <p><a href="/">Retour au site CitiZarm</a></p></main></body></html>`;
}

export function registerContactUnsubscribeRoutes(app: Express, storage: ContactRemovalStorage) {
  async function resolve(req: Request, res: Response) {
    res.set({ "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" });
    if (typeof req.query.token !== "string") {
      res.status(400).type("html").send(page("Lien invalide", "Ce lien de désinscription est incomplet ou invalide."));
      return null;
    }
    const identity = verifyContactUnsubscribeToken(req.query.token);
    if (!identity) {
      res.status(400).type("html").send(page("Lien invalide", "Ce lien de désinscription est invalide."));
      return null;
    }
    const message = await storage.getContactMessageById(identity.id);
    if (message && message.createdAt?.getTime() !== identity.timestamp) {
      res.status(400).type("html").send(page("Lien invalide", "Ce lien ne correspond pas à ce message."));
      return null;
    }
    return { identity, message };
  }

  const success = (res: Response) => res.type("html").send(page(
    "Message supprimé",
    "L’enregistrement de votre message a été supprimé de la base de contacts CitiZarm. Vos autres messages et votre éventuel abonnement à la newsletter ne sont pas modifiés.",
  ));
  const unavailable = (res: Response) => {
    console.error("[Contact] Message removal temporarily unavailable");
    return res.status(503).type("html").send(page("Service temporairement indisponible", "La suppression n’a pas pu être confirmée. Réessayez plus tard ou contactez contact@citizarm.fr."));
  };

  app.get("/api/contact/unsubscribe", async (req, res) => {
    try {
      const resolved = await resolve(req, res);
      if (!resolved) return;
      if (!resolved.message) return success(res);
      res.type("html").send(page(
        "Se désinscrire du contact",
        "Cette action supprime définitivement l’enregistrement de ce message dans la base de contacts CitiZarm. Elle ne supprime pas les emails déjà envoyés ni les copies de sauvegarde. Confirmez la suppression pour continuer.",
        req.query.token as string,
      ));
    } catch {
      if (!res.headersSent) unavailable(res);
    }
  });

  app.post("/api/contact/unsubscribe", async (req, res) => {
    try {
      const resolved = await resolve(req, res);
      if (!resolved) return;
      const oneClick = req.body?.["List-Unsubscribe"] === "One-Click";
      if (!oneClick && req.body?.confirm !== "1") {
        return res.status(400).type("html").send(page("Confirmation requise", "Veuillez utiliser le bouton de confirmation."));
      }
      if (resolved.message) {
        const deleted = await storage.deleteContactMessage(resolved.identity.id, resolved.identity.timestamp);
        if (!deleted && await storage.getContactMessageById(resolved.identity.id)) return unavailable(res);
      }
      if (oneClick) return res.status(200).end();
      success(res);
    } catch {
      if (!res.headersSent) unavailable(res);
    }
  });
}
