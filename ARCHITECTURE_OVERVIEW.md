# Architecture Overview & Changelog

_Last updated: 2025-04-25_

---

## Application Overview

**Credit Card Tracker** is a web application for tracking credit card transactions, managing cards, and visualizing spending analytics. It features a modern UI, secure authentication, and persistent storage using a relational database.

---

## High-Level Architecture

### 1. Front-End (UI/UX)
- **Framework**: React (Next.js, TypeScript)
- **UI Components**: Modular, reusable components in `components/` (dialogs, lists, navigation, analytics, etc.)
- **Pages & Layouts**: Route-based pages and layouts in `app/` (e.g., `app/cards/page.tsx`, `app/transactions/page.tsx`)
- **Styling**: Tailwind CSS (`styles/`, `tailwind.config.js`)
- **State Management**: React Query (`components/react-query-provider.tsx`), Context Providers (`components/providers/`)
- **User Interactions**: Dialogs, forms, analytics, navigation, etc.

### 2. Back-End & APIs
- **API Routes**: (If present, typically in `pages/api/` or via Next.js API handlers)
- **Business Logic**: Utility and business logic in `lib/` (e.g., `lib/currency.ts`, `lib/storage.ts`)
- **Database**: Supabase (managed PostgreSQL, authentication, and API) (`lib/supabaseClient.ts`)
- **Authentication**: Supabase client (`lib/supabaseClient.ts`), Auth providers (`components/providers/auth-provider.tsx`)

### 3. Integrations & External Services
- **Supabase**: Authentication and possibly data storage (`lib/supabaseClient.ts`)
- **Tailwind CSS**: For rapid UI development

### 4. Data Flow & State Management
- **React Context/Providers**: For global state (auth, theme)
- **React Query**: For server state and API data fetching/caching


---

## File Structure & Key Components

```
app/                  # Main app pages and layouts
  cards/              # Card management pages
  login/              # Login page
  settings/           # User settings page
  transactions/       # Transaction management pages
  layout.tsx          # Root layout
  page.tsx            # Root landing page
components/           # Reusable UI components
  add-card-dialog.tsx
  add-transaction-dialog.tsx
  dashboard-analytics.tsx
  ...
  ui/                 # Shared UI primitives (buttons, dialogs, etc.)
hooks/                # Custom React hooks
lib/                  # Utility functions, Supabase client, currency helpers

types/                # TypeScript types and overrides
styles/               # Global styles (Tailwind)
public/               # Static assets
```

---

## Main Functionalities
- **User Authentication** (Supabase)
- **Credit Card Management** (add, edit, delete cards)
- **Transaction Management** (add, edit, delete transactions)
- **Categories Management** (add, edit, delete categories)
- **Analytics Dashboard**
  - Visualize spending
  - Recent transactions
  - Overview of cards added
  - Overview of statement cycle spending
  - Spending by category
- **Settings**
  - User preferences
  - Categories management
  - Log out button
- **Error Handling** (error boundaries)

---

## Changelog

### 2025-04-25 (Initial Overview)
- Created initial architecture overview and mapped main components.
- Documented key file structure and main functionalities.

### 2025-04-25 (Supabase Migration)
- Removed all Prisma-related elements from the documentation and architecture overview.
- Updated database and backend sections to reflect Supabase as the database and authentication provider.

---

## How to Update
- For each major change, add a new dated entry to the Changelog above.
- Update relevant sections if architecture or file structure changes.
- Reference commit hashes or PR links if possible for traceability.

---

_This document is intended to remain current and informative for all stakeholders. Please update regularly as the application evolves._
