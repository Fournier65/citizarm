-- Initial schema for the external OVH database.
-- Run once, explicitly, only when both application tables are absent.
CREATE TABLE public.newsletter_subscribers (
  id serial PRIMARY KEY,
  email text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id serial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamp DEFAULT now()
);