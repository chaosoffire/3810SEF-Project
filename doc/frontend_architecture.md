# Frontend Architecture (Express)

This document explains the "frontend" logic served by Express. Note that this project uses a server-side rendering approach where Express serves HTML pages (via EJS or static files) and provides a dedicated router for page navigation.

## Router

### `public/frontend/router.ts`
**Role**: Page Navigation Router
- Defines routes for serving HTML pages to the browser.
- Uses `validateSession` middleware to ensure users are logged in for protected pages.
- Uses `checkRole` middleware to restrict access to admin-only pages.
- **Routes**:
    - `/`: Redirects to `/login` or `/menu` based on session.
    - `/login`: Serves the login page.
    - `/menu`: Main dashboard (protected).
    - `/my-book`: User's book collection (protected).
    - `/cart`: Shopping cart (protected).
    - `/description`: Book details (protected).
    - `/add-admin`: Admin creation page (protected, admin-only).

## Middleware

Middleware in `public/frontend/middleware` enforces security and session state for page requests.

### `validate-session.ts`
- **Function**: `validateSession`
- Checks for the presence and validity of the `x-session` cookie.
- If invalid or missing, redirects the user to `/page/login`.
- If valid, attaches user info to `req.user` and proceeds.

### `check-role.ts`
- **Function**: `checkRole(role)`
- Factory function that returns middleware to enforce role requirements.
- Checks if `req.user.role` matches the required role.
- If not authorized, returns a 403 Forbidden response.

### `check-admin.ts`
- **Function**: `checkAdmin`
- Specific middleware to ensure the user has the 'admin' role.
- Used for protecting routes like `/add-admin`.

## Interfaces

### `public/frontend/Interface/interface.ts`
- Defines TypeScript interfaces shared across the frontend logic.
- **`UserPayload`**: Structure of the decoded session token (username, role, etc.).
- **`Book`**: Structure of a book object as used in frontend views.
