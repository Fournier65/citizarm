import type { Express, Request, Response } from "express";
import type { Subscriber } from "@shared/schema";
import { getSubscriberIdFromToken, verifyUnsubscribeToken } from "./unsubscribe";

export interface UnsubscribeStorage {
  getSubscriberById(id: number): Promise<Subscriber | undefined>;
  setSubscriberActive(id: number, active: boolean): Promise<Subscriber | undefined>;
}

function page(title: string, message: string, token?: string) {
  // token is accepted only after strict syntax and signature validation.
  const form = token ? `<form method="post" action="/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}">
    <input type="hidden" name="confirm" value="1">
    <button type="submit">Me désinscrire</button></form>` : "";
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1"><title>${title} — CitiZarm</title>
    <style>body{margin:0;background:#eef6fa;font:16px Arial,sans-serif;color:#16465a}
    main{box-sizing:border-box;max-width:560px;margin:48px auto;padding:32px;background:white;border-radius:16px}
    img{display:block;width:96px;height:96px;margin:0 auto 28px}h1{font-size:28px}
    p{line-height:1.6}button{font:inherit;background:#21647b;color:white;border:0;border-radius:8px;padding:14px 24px;cursor:pointer}
    a{color:#21647b}button:focus-visible,a:focus-visible{outline:3px solid #16465a;outline-offset:4px}
    @media(max-width:600px){main{margin:16px;padding:24px}}</style></head>
    <body><main><img src="/email-logo.png" alt="CitiZarm"><h1>${title}</h1><p>${message}</p>
    ${form}<p><a href="/">Retour au site CitiZarm</a></p></main></body></html>`;
}

export function registerUnsubscribeRoutes(app: Express, storage: UnsubscribeStorage) {
  async function resolve(req: Request, res: Response): Promise<Subscriber | undefined> {
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    });
    const token = req.query.token;
    const id = getSubscriberIdFromToken(token);
    if (!id) {
      res.status(400).type("html").send(page("Lien invalide", "Ce lien de désinscription est incomplet ou invalide."));
      return;
    }
    const subscriber = await storage.getSubscriberById(id);
    if (!subscriber || !verifyUnsubscribeToken(token as string, subscriber)) {
      res.status(400).type("html").send(page("Lien invalide", "Ce lien de désinscription est invalide."));
      return;
    }
    return subscriber;
  }

  function unavailable(res: Response) {
    // Do not log tokens, email addresses, or credentials.
    console.error("[Newsletter] Unsubscribe temporarily unavailable");
    return res.status(503).type("html").send(page(
      "Service temporairement indisponible",
      "Veuillez réessayer plus tard ou nous contacter à contact@citizarm.fr.",
    ));
  }

  app.get("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const subscriber = await resolve(req, res);
      if (!subscriber) return;
      if (subscriber.isActive === false) {
        return res.type("html").send(page("Désinscription confirmée", "Vous ne recevrez plus la newsletter CitiZarm."));
      }
      // GET must not unsubscribe: link scanners can follow links automatically.
      res.type("html").send(page(
        "Se désinscrire de la newsletter",
        "Confirmez votre choix pour ne plus recevoir la newsletter CitiZarm.",
        req.query.token as string,
      ));
    } catch {
      if (!res.headersSent) unavailable(res);
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const subscriber = await resolve(req, res);
      if (!subscriber) return;
      const oneClick = req.body?.["List-Unsubscribe"] === "One-Click";
      if (!oneClick && req.body?.confirm !== "1") {
        return res.status(400).type("html").send(page("Confirmation requise", "Veuillez utiliser le bouton de confirmation."));
      }
      const updated = await storage.setSubscriberActive(subscriber.id, false);
      if (!updated) return unavailable(res);
      // RFC 8058 POST is idempotent, needs no login, and returns a blank 200.
      if (oneClick) return res.status(200).end();
      res.type("html").send(page("Désinscription confirmée", "Vous ne recevrez plus la newsletter CitiZarm."));
    } catch {
      if (!res.headersSent) unavailable(res);
    }
  });
}
