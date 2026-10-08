import { db } from "./db";
import {
  contactMessages,
  newsletterSubscribers,
  type InsertContactMessage,
  type ContactMessage,
  type InsertSubscriber,
  type Subscriber
} from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";

export interface IStorage {
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessageById(id: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number, createdAtMilliseconds: number): Promise<boolean>;
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getSubscriberById(id: number): Promise<Subscriber | undefined>;
  setSubscriberActive(id: number, active: boolean): Promise<Subscriber | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async getContactMessageById(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async deleteContactMessage(id: number, createdAtMilliseconds: number): Promise<boolean> {
    // PostgreSQL timestamps may contain microseconds; JS Date keeps milliseconds.
    // Match the token's creation identity at the same precision, not only the ID.
    const deleted = await db.delete(contactMessages).where(and(
      eq(contactMessages.id, id),
      sql`floor(extract(epoch from ${contactMessages.createdAt}) * 1000) = ${createdAtMilliseconds}`,
    )).returning({ id: contactMessages.id });
    return deleted.length > 0;
  }

  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const [newSubscriber] = await db.insert(newsletterSubscribers).values(subscriber).returning();
    return newSubscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return subscriber;
  }

  async getSubscriberById(id: number): Promise<Subscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return subscriber;
  }

  async setSubscriberActive(id: number, active: boolean): Promise<Subscriber | undefined> {
    const [subscriber] = await db.update(newsletterSubscribers).set({ isActive: active })
      .where(eq(newsletterSubscribers.id, id)).returning();
    return subscriber;
  }
}

export const storage = new DatabaseStorage();
