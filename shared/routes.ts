import { z } from 'zod';
import { insertContactSchema, insertSubscriberSchema, contactMessages, newsletterSubscribers } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  contact: {
    create: {
      method: 'POST' as const,
      path: '/api/contact',
      input: insertContactSchema,
      responses: {
        201: z.custom<typeof contactMessages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  newsletter: {
    subscribe: {
      method: 'POST' as const,
      path: '/api/newsletter',
      input: insertSubscriberSchema,
      responses: {
        201: z.custom<typeof newsletterSubscribers.$inferSelect>(),
        400: errorSchemas.validation,
        409: errorSchemas.conflict, // For duplicate emails
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type ContactInput = z.infer<typeof api.contact.create.input>;
export type NewsletterInput = z.infer<typeof api.newsletter.subscribe.input>;
