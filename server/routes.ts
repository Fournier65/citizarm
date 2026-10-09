import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { sendContactEmails } from "./resend";
import { registerUnsubscribeRoutes } from "./newsletter/routes";
import { renderNewsletterPreview } from "./email/preview";
import { buildContactAcknowledgement, buildContactNotification } from "./email/contact";
import { registerContactUnsubscribeRoutes } from "./contact/routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerUnsubscribeRoutes(app, storage);
  registerContactUnsubscribeRoutes(app, storage);
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/newsletter/template-preview", (_req, res) => {
      res.set("Cache-Control", "no-store").type("html")
        .send(renderNewsletterPreview("/email-logo.png?v=20261009").html);
    });
    app.get("/api/contact/email-preview", (req, res) => {
      const data = {
        name: "Visiteur de démonstration",
        email: "visiteur@example.com",
        subject: "Découvrir les projets CitiZarm",
        message: "Bonjour,\nJe souhaite en savoir plus sur les initiatives CitiZarm.\nMerci pour votre retour.",
      };
      const email = req.query.type === "notification"
        ? buildContactNotification(data) : buildContactAcknowledgement(data, "#desinscription-contact-exemple");
      res.set("Cache-Control", "no-store").type("html")
        .send(email.html.replaceAll("https://citizarm.fr/email-logo.png", "/email-logo.png"));
    });
  }

  // Contact Form
  app.post(api.contact.create.path, async (req, res) => {
    try {
      const input = api.contact.create.input.parse(req.body);
      const message = await storage.createContactMessage(input);
      
      const emailStatus = await sendContactEmails(message);
      
      res.status(201).json({ ...message, ...emailStatus });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("[Contact] Could not store the contact request");
      return res.status(500).json({ message: "Unable to save contact message" });
    }
  });

  // Newsletter Subscription
  app.post(api.newsletter.subscribe.path, async (req, res) => {
    try {
      const input = api.newsletter.subscribe.input.parse(req.body);
      
      const existing = await storage.getSubscriberByEmail(input.email);
      if (existing) {
        if (existing.isActive === false) {
          const subscriber = await storage.setSubscriberActive(existing.id, true);
          if (!subscriber) return res.status(503).json({ message: "Subscription temporarily unavailable" });
          return res.status(201).json(subscriber);
        }
        return res.status(409).json({ message: "Email already subscribed" });
      }

      const subscriber = await storage.createSubscriber(input);
      res.status(201).json(subscriber);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
