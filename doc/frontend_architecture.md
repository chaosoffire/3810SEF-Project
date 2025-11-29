[Back](../README.md#-documentation-hub)
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

## Frontend API Handlers (`public/frontend/api/`)

These files act as intermediaries between the frontend router and the backend API, often handling form data processing, file uploads, and API calls.

### Admin (`api/admin/`)
- **`add-book.ts`**: Handles the book creation form submission. Validates the cover image (aspect ratio, dimensions) and sends a `POST` request to the backend.
- **`delete-book.ts`**: Sends a `DELETE` request to remove a book.
- **`update-book.ts`**: Handles book updates, including optional image replacement.

### Auth (`api/auth/`)
- **`sign-in.ts`**: Sends credentials to the backend login API. On success, sets the session cookie and redirects to the home page.
- **`sign-up.ts`**: Handles user registration.
- **`sign-out.ts`**: Clears the session cookie and redirects to the login page.
- **`get-role.ts`**: Utility to check the user's role from the request context.
- **`refresh-cookie.ts`**: Calls the backend to extend the session lifetime.
- **`reset-password.ts`**: Handles the password reset flow.

### General (`api/general/`)
- **`render-content.ts`**: Fetches book data and renders the main content view (`content.ejs`).
- **`show-book.ts`**: Fetches a specific book's details for display.

### User (`api/user/`)
- **`checkout.ts`**: Processes the shopping cart checkout. Sends a `POST` request to create an order.
- **`get-owned-book.ts`**: Fetches the list of books owned by the user.
- **`book-content.ts`**: Renders the detailed view of a book.

## Utilities

### `public/frontend/multer.ts`
- Configures `multer` for handling file uploads (used for book covers).
- Sets file size limits (10MB) and uses memory storage.
