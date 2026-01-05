import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertContactSchema = createInsertSchema(contactMessages).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({ 
  id: true, 
  createdAt: true,
  isActive: true 
});

// === EXPLICIT API CONTRACT TYPES ===
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactSchema>;

export type Subscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertSubscriber = z.infer<typeof insertSubscriberSchema>;
