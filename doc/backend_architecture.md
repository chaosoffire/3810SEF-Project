[Back](README.md)
# Backend Architecture

This document explains the core components of the backend infrastructure, including the server entry point, configuration management, and database connectivity.

## Core Files

### `server.ts`
**Role**: Application Entry Point
- Initializes the Express application.
- Sets up global middleware (Helmet, Compression, Morgan, CookieParser).
- Configures the view engine (EJS) and static asset serving.
- Connects to the database via `initDatabase()`.
- Mounts the main `backendRouter` and `pageRouter`.
- Starts the HTTP server on the configured `PORT`.

### `models/config/config.manager.ts`
**Role**: Configuration Management
- **Class**: `ConfigManager` (Singleton)
- Loads environment variables from `.env` (or creates it from `.env.example`).
- Provides a centralized `get(key)` method to access configuration values.
- Ensures critical secrets and settings are available to the application.

### `models/backend/database/mongodb.manager.ts`
**Role**: Database Connection Manager
- **Class**: `MongoDBManager` (Singleton)
- Manages the connection to the MongoDB instance using Mongoose.
- Handles connection timeouts and retries.
- Provides `getModel()` to retrieve or create Mongoose models dynamically.
- Uses `MONGODB_URI` and `MONGODB_DB_NAME` from configuration.

### `models/backend/init/init.db.ts`
**Role**: Database Initialization
- **Function**: `initDatabase()`
- Waits for the MongoDB connection to be ready.
- **Function**: `ensureInitialAdminUser()`
    - Checks if an admin user exists.
    - If not, attempts to create a bootstrap admin using `INIT_ADMIN_USERNAME` and `INIT_ADMIN_PASSWORD` from config.
    - Fails securely if credentials are invalid or if the username is taken by a non-admin.

## Data Models

The application uses Mongoose schemas to define data structures.

### `models/backend/database/model/schema/userSchema.ts`
- Defines the `User` document structure.
- Fields: `username`, `password` (hashed), `role` ('admin' | 'user'), `lastLogoutAt`.

### `models/backend/database/model/schema/bookSchema.ts`
- Defines the `Book` document structure.
- Fields: `title`, `author`, `description`, `genres`, `publishedYear`, `price`, `coverImage`.

### `models/backend/database/model/schema/orderSchema.ts`
- Defines the `Order` document structure.
- Fields: `user` (ref), `books` (ref array), `type` ('buy' | 'refund'), `createdAt`.

## Repositories

Repositories abstract database operations.

- **`models/backend/database/model/user/user.repository.ts`**: User CRUD, password management, role checks.
- **`models/backend/database/model/book/book.repository.ts`**: Book CRUD, search filtering, pagination.
- **`models/backend/database/model/order/order.repository.ts`**: Order creation, retrieval, and deletion.
