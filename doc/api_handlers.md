[Back](../README.md#-documentation-hub)
# API Handlers and Services

This document details the implementation of the backend API, including routers, request handlers, and business logic services.

## Overview

The API is structured into modules (User, Book, Auth) located in `models/backend/api`. Each module typically contains:
- `router.ts`: Express router definitions.
- `handler/`: Request handler functions (controllers).
- `service/`: Business logic and middleware.

## Authentication Module (`models/backend/api/auth`)

### Handlers
- **`handler/register.ts`**: Handles user registration. Validates input and calls `registerUser` service.
- **`handler/login.ts`**: Authenticates users using Passport (`local` strategy) and sets the session cookie.
- **`handler/logout.ts`**: Clears the session cookie and updates `lastLogoutAt` in the database.
- **`handler/change-password.ts`**: Verifies old password and updates to the new one.
- **`handler/refresh.ts`**: Extends the session cookie's lifespan.

### Services & Middleware
- **`passport/passport.ts`**: Configures Passport.js with `LocalStrategy` for username/password authentication.
- **`service/cookie.middleware.ts`**: `authCookieMiddleware`. Decrypts and validates the `x-session` cookie. Attaches user info to `req.runtime`.
- **`service/roles.middleware.ts`**:
    - `ensureAdmin`: Middleware that blocks non-admin users.
    - `requireAdminForAdminCreation`: Middleware ensuring only admins can create new admin accounts.
- **`service/session.ts`**: Utilities for encrypting/decrypting session tokens (AES-256-GCM).
- **`service/handle.validation.error.ts`**: Middleware to check `express-validator` results and return 400 if errors exist.

## User Module (`models/backend/api/user`)

### Router (`router.ts`)
Defines endpoints for user operations:
- `/register`, `/login`, `/logout`, `/change-password` (delegates to Auth handlers).
- `/ownbooks`: Get books owned by the user.
- `/orders`: Get or create orders.

### Handlers
- **`handler/ownbooks.ts`**: Fetches the list of books owned by the current user.
- **`handler/orders.ts`**:
    - `ordersHandler`: Lists orders or creates a new order (buy/refund).
    - `orderDetailHandler`: Returns details of a specific order.

### Services
- **`service/getUserOwnBooks.ts`**: Logic to aggregate a user's orders and determine net ownership of books (accounting for refunds).

## Book Module (`models/backend/api/book`)

### Router (`router.ts`)
Defines endpoints for book operations:
- `GET /`: List/Search books.
- `POST /`: Create book (Admin).
- `GET /:id`: Get book details.
- `PUT /:id`: Update book (Admin).
- `DELETE /:id`: Delete book (Admin).

### Handlers
- **`handler/root.ts`**: `rootHandler`. Handles listing books with complex filtering (search, sort, pagination) and creating new books.
- **`handler/id.ts`**:
    - `getBookByIdHandler`: Fetch single book.
    - `updateBookHandler`: Modify existing book.
    - `deleteBookHandler`: Remove a book.

## Test Module (`models/backend/api/test`)

### Router (`router.ts`)
- Mounted only if `TEST_PATH` is configured.
- Provides utilities for integration testing (creating/deleting test users).
