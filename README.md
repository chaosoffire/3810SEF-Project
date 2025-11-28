# Bookstore Platform

A full-stack TypeScript application featuring a secure REST API backend, server-side rendered frontend (Express + EJS), and a MongoDB database.

## 📚 Documentation Hub

The documentation is split into detailed guides for each part of the system:

- **[Backend Architecture](doc/backend_architecture.md)**: Explains the server setup, configuration (`ConfigManager`), database connection (`MongoDBManager`), and data models.
- **[API Handlers & Services](doc/api_handlers.md)**: Details the implementation of API routes, controllers, and business logic services.
- **[Frontend Architecture](doc/frontend_architecture.md)**: Covers the Express frontend router, session middleware, and shared interfaces.
- **[Client-Side Scripts](doc/client_scripts.md)**: Explains the TypeScript logic running in the browser for each page (Login, Menu, Cart, etc.).
- **[API Reference](doc/API_DOC.md)**: The public API specification with endpoints, request/response examples, and error codes.

## Feature Highlights

- **Authentication**: Secure login/registration with hashed passwords and AES-256-GCM encrypted session cookies.
- **Role-Based Access Control**: Strict separation between 'user' and 'admin' roles.
- **Book Management**: Admin-only CRUD operations for the book catalog.
- **Shopping Cart & Orders**: Users can browse books, add to cart, and place orders.
- **Search & Filtering**: Advanced filtering by title, author, genre, price, and more.

## Quick Start

1.  **Clone & Install**
    ```bash
    git clone <repo-url>
    npm install
    ```

2.  **Configure**
    Copy `.env.example` to `.env` and set the required variables:
    ```bash
    cp .env.example .env
    ```
    *Ensure `INIT_ADMIN_USERNAME` and `INIT_ADMIN_PASSWORD` are set to bootstrap the first admin account.*

3.  **Build & Run**
    ```bash
    npm run build
    npm start
    ```
    The server typically listens on port 3000 (http://localhost:3000).

## Development Scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Compiles both backend and frontend TypeScript. |
| `npm start` | Runs the compiled application. |
| `npm run build:client` | Compiles only client-side scripts. |
| `npm run watch:client` | Watches client scripts for changes. |
| `npm run typecheck` | Runs TypeScript validation. |

## License

MIT
