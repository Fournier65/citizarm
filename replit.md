# CitiZarm - Civic Tech Platform

## Overview

CitiZarm is a French civic technology platform designed to strengthen direct democracy through digital tools. The application serves as a public-facing website with contact forms, newsletter subscriptions, and informational pages about the organization's mission to empower citizens in democratic participation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom design tokens, shadcn/ui component library
- **Animations**: Framer Motion for page transitions and interactions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: REST endpoints with type-safe contracts defined in `shared/routes.ts`
- **Validation**: Zod schemas for input validation, shared between client and server

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` defines tables for contact messages and newsletter subscribers
- **Migrations**: Drizzle Kit manages schema migrations in `./migrations`

### Project Structure
```
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components including shadcn/ui
│   │   ├── pages/        # Route pages (Home, Contact, Legal, 404)
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route handlers
│   ├── storage.ts    # Database access layer
│   └── db.ts         # Database connection
├── shared/           # Shared code between client/server
│   ├── schema.ts     # Drizzle table definitions
│   └── routes.ts     # API contract definitions
```

### Key Design Patterns
- **Type-Safe API Contracts**: The `shared/routes.ts` file defines API endpoints with their paths, methods, input schemas, and response types, ensuring type safety across the stack
- **Storage Abstraction**: Database operations are abstracted through an `IStorage` interface in `server/storage.ts`
- **Component Library**: Uses shadcn/ui (Radix UI primitives + Tailwind) for consistent, accessible UI components
- **Theme System**: CSS custom properties with light/dark mode support via ThemeProvider

## External Dependencies

### Database
- PostgreSQL (required via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe queries
- `connect-pg-simple` for session storage capability

### UI Framework
- Radix UI primitives (comprehensive set: dialogs, dropdowns, forms, etc.)
- Tailwind CSS with custom configuration
- Framer Motion for animations

### Development Tools
- Vite with React plugin
- Replit-specific plugins for development (cartographer, dev-banner, error overlay)
- ESBuild for production server bundling

### External Services
- Google Fonts (Outfit, Plus Jakarta Sans)
- Social media integration (Twitter/X via react-icons)