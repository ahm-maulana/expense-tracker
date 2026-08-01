# Architecture

## Overview

This project is a full-stack monorepo built with Turborepo. It contains a Next.js frontend, an Express.js backend, and shared packages for reusable code.

---

# Tech Stack

## Frontend

| Technology   | Purpose         |
| ------------ | --------------- |
| Next.js      | React framework |
| React        | UI library      |
| TypeScript   | Type safety     |
| Tailwind CSS | Styling         |
| shadcn/ui    | UI components   |

---

## Backend

| Technology | Purpose                     |
| ---------- | --------------------------- |
| Express.js | REST API                    |
| TypeScript | Type safety                 |
| Prisma ORM | Database access             |
| Sqlite     | Database                    |
| JWT        | Authentication              |
| Zod        | Request/response validation |

---

## Shared Packages

| Package             | Purpose                             |
| ------------------- | ----------------------------------- |
| `api-contracts`     | Shared Zod schemas, DTOs, API types |
| `typescript-config` | Shared TypeScript configuration     |
| `eslint-config`     | Shared ESLint configuration         |

---

## Testing

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Vitest     | Unit testing            |
| Supertest  | API integration testing |

---

## API Documentation

- OpenAPI Specification
- Stored in `apps/api/openapi`

---

## Repository Structure

```text
apps/
├── api/
│   ├── src/
│   ├── tests/
│   └── openapi/
│
└── web/

packages/
├── api-contracts/
├── eslint-config/
└── typescript-config/

docs/
├── VISION.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── BACKLOG.md
└── sprints/
```

---

# Application Layers

## Frontend

```text
Pages
    ↓
Components
    ↓
Hooks
    ↓
API Client
```

Responsibilities:

- Render UI
- Manage client-side state
- Call backend APIs
- Validate forms
- Handle user interactions

---

## Backend

```text
Routes
    ↓
Controllers
    ↓
Services
    ↓
Repositories
    ↓
Prisma
    ↓
Database
```

Responsibilities:

- Handle HTTP requests
- Execute business logic
- Access the database
- Return API responses

---

## Shared

Shared packages contain reusable code used by both frontend and backend.

Examples:

- Zod schemas
- DTOs
- API response types
- Validation helpers

---

# Authentication

Authentication uses:

- JWT Access Token
- Refresh Token
- HTTP-only Cookie

Flow:

1. User logs in.
2. Backend returns an access token.
3. Refresh token is stored in an HTTP-only cookie.
4. Frontend includes the access token in API requests.
5. When the access token expires, the frontend requests a new one using the refresh token.
6. Backend validates the refresh token and issues a new access token.

---

# API Design

- RESTful API
- JSON request/response format
- Zod validation
- OpenAPI specification
- Standard HTTP status codes
- Consistent error response format

---

# Database

ORM:

- Prisma

Database:

- SQLite

Design principles:

- Normalize data where appropriate
- Use foreign keys for relationships
- Soft delete only when required
- Store timestamps (`createdAt`, `updatedAt`) on entities

---

# Testing Strategy

## Backend

- Unit tests
- Integration tests

## Frontend

- Component tests

## End-to-End

- Optional, added when core features are stable

---

# Coding Standards

## Naming

- PascalCase for React components
- camelCase for variables and functions
- kebab-case for files and folders (except React components if a different convention is adopted consistently)

---

## Type Safety

- Prefer TypeScript types over `any`
- Validate external input with Zod
- Share API contracts through `packages/api-contracts`

---

## Git Workflow

```text
main
│
develop
│
feature/*
```

Feature development flow:

1. Create a feature branch from `develop`.
2. Implement the feature.
3. Write tests.
4. Update OpenAPI if the API changes.
5. Merge into `develop`.
6. Merge `develop` into `main` for releases.

---

# Documentation

| Document            | Purpose                              |
| ------------------- | ------------------------------------ |
| `vision.md`         | Product vision, MVP, future features |
| `roadmap.md`        | Planned releases and milestones      |
| `backlog.md`        | All unfinished work                  |
| `sprints/`          | Sprint planning and review           |
| `apps/api/openapi/` | API specification                    |

---

# Deployment (Planned)

| Component | Target                            |
| --------- | --------------------------------- |
| Frontend  | Vercel                            |
| Backend   | Railway (or similar Node.js host) |
| Database  | Supabase                          |
