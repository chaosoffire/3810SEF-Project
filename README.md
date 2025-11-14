# Bookstore API Backend

TypeScript/Express backend for a bookstore platform with authenticated sessions, role-aware access control, and MongoDB persistence.

## Feature Highlights

- Auth lifecycle: registration, login, logout, password change, and session refresh via encrypted cookies.
- Role-based authorization with hard guardrails around admin creation and elevated routes.
- Book catalog CRUD with powerful filtering (search, sorting, pagination).
- Order tracking backed by aggregation logic that resolves net ownership per user.
- Automatic admin bootstrap during startup (fails closed if credentials are missing or invalid).

## Quick Start

```bash
git clone <repo-url>
git checkout bookstore-api-backend
npm install
cp .env.example .env
# populate the required secrets and admin bootstrap credentials
npm run build
npm start
```

The server listens on the port defined by `PORT` (default 3000) and serves versioned routes under `/api/<api_version>/`.

## Configuration

All configuration is provided through environment variables. The application will terminate at startup if any required value is missing or if it cannot create the bootstrap admin account.

| Variable | Description | Notes |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection URI | required |
| `MONGODB_DB_NAME` | Database name | defaults to random `test-xxxxxx` if absent |
| `PORT` | HTTP server port | defaults to 3000 |
| `NODE_ENV` | runtime environment | `development` by default |
| `API_VERSION_NO` | version string used in route prefix | required |
| `SESSION_SECRET` | secret used to derive AES-256-GCM session key | required |
| `SESSION_TIMEOUT` | session TTL in ms | defaults to 1800000 (30 minutes) |
| `TEST_PATH` | dynamic segment used to mount the test router | optional |
| `INIT_ADMIN_USERNAME` | username for the bootstrap admin account | required; 8-32 characters |
| `INIT_ADMIN_PASSWORD` | password for the bootstrap admin account | required; 12-64 characters |

> **Important:** Startup aborts if there is no admin in the database and the bootstrap credentials are missing, invalid, or refer to an existing non-admin user.

## Development Scripts

| Command | Purpose |
| --- | --- |
| `npm run clean` | Delete `dist/` |
| `npm run build:client` | Compile client scripts to `dist/public/client-script/` |
| `npm run watch:client` | Compile client scripts to `dist/public/client-script/` and watch for changes |
| `npm run build:ts` | Compile TypeScript to `dist/` |
| `npm run copy:assets` | Copy static assets to `dist/` |
| `npm run build` | Run `npm run build:ts`, `npm run copy:assets` and `npm run build:client` |
| `npm start` | Run the built JavaScript (after `npm run build`) |
| `npm run typecheck` | TypeScript project validation |
| `npm test` | Placeholder for future tests |

## API Reference

Detailed endpoint documentation, including request/response examples, is maintained in [`models/backend/API_DOC.md`](models/backend/API_DOC.md).

## Security Notes

- Passwords are hashed with bcrypt before storage; raw passwords are never persisted.
- Session tokens are sealed using AES-256-GCM and stored as HTTP-only cookies.
- Logout and password changes invalidate active sessions by tracking `lastLogoutAt` per user.
- Only authenticated admins can create other admins; bootstrap logic never auto-promotes an existing account.

## Troubleshooting

| Symptom | Remediation |
| --- | --- |
| Startup exits with bootstrap admin errors | Verify `INIT_ADMIN_*` values meet length requirements and target username does not already belong to a non-admin user. |
| `API version mismatch` responses | Ensure client requests use `/api/<API_VERSION_NO>/...` with the exact value from configuration. |
| `Session expired` or `Missing session` | Confirm cookies are being sent. Refresh tokens via `/user/refresh-cookie`. |
| Mongo connection failures | Validate `MONGODB_URI`, confirm MongoDB is running, and confirm network accessibility. |

## Contributing

1. Fork the repository and create a topic branch.
2. Commit changes with clear messages.
3. Open a pull request describing the motivation and testing performed.

## License

MIT
