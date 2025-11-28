[Back](README.md)
## API Reference

All endpoints are prefixed with `/api/<API_VERSION_NO>/`. Replace `<API_VERSION_NO>` with the value configured in the environment (default `v1`). Unless stated otherwise, requests and responses use JSON and require the `Content-Type: application/json` header for bodies.

Authentication is handled through the `x-session` HTTP-only cookie set by the login endpoint. Include this cookie in subsequent requests that require authentication.

## Table of Contents

- [Authentication](#authentication)
    - [Register User](#register-user)
    - [Login](#login)
    - [Logout](#logout)
    - [Change Password](#change-password)
    - [Refresh Session Cookie](#refresh-session-cookie)
    - [Check Admin Status](#check-admin-status)
- [Books](#books)
    - [List or Search Books](#list-or-search-books)
    - [Get Book by ID](#get-book-by-id)
    - [Create Book (Admin Only)](#create-book-admin-only)
    - [Update Book (Admin Only)](#update-book-admin-only)
    - [Delete Book (Admin Only)](#delete-book-admin-only)
- [Orders and Ownership](#orders-and-ownership)
    - [List Owned Books](#list-owned-books)
    - [List Orders](#list-orders)
    - [Get Order Details](#get-order-details)
    - [Create Order](#create-order)
    - [Delete Order (Admin Only)](#delete-order-admin-only)
- [Session Test Utilities](#session-test-utilities)
- [Health](#health)

### Authentication

#### Register User

- **URL**: `POST /api/<API_VERSION_NO>/user/register`
- **Auth**: optional (admins can pass `admin: true`)
- **Body**

```json
{
	"username": "reader123",
	"password": "LongSecurePass123!",
	"admin": false
}
```

- **Notes**:  
1. `admin` defaults to `false`. When set to `true`, the caller must already be authenticated as an admin.
2. username must be 8-32 characters long, the first character must be a letter, and can only contain letters, numbers, and underscores.
3. password must be 12-64 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character.
- **Responses**
	- `201 Created` `{ "success": true }`
	- `403 Forbidden` when a non-admin attempts to create an admin
	- `409 Conflict` if the username is already taken

#### Login

- **URL**: `POST /api/<API_VERSION_NO>/user/login`
- **Auth**: none
- **Body**

```json
{
	"username": "reader123",
	"password": "LongSecurePass123!"
}
```

- **Responses**
	- `200 OK` with `{ "success": true, "username": "reader123" }` and sets `x-session` cookie
	- `401 Unauthorized` for invalid credentials

#### Logout

- **URL**: `POST /api/<API_VERSION_NO>/user/logout`
- **Auth**: session cookie
- **Responses**
	- `200 OK` `{ "success": true }`
	- `401 Unauthorized` when no valid session is present

#### Change Password

- **URL**: `PUT /api/<API_VERSION_NO>/user/change-password`
- **Auth**: session cookie
- **Body**

```json
{
	"oldPassword": "LongSecurePass123!",
	"newPassword": "FreshSecurePass456!"
}
```

- **Responses**
	- `200 OK` `{ "success": true }`
	- `400 Bad Request` on validation failure or incorrect old password

#### Refresh Session Cookie

- **URL**: `POST /api/<API_VERSION_NO>/user/refresh-cookie`
- **Auth**: session cookie
- **Responses**
	- `200 OK` `{ "success": true }` with renewed cookie lifetime

#### Check Admin Status

- **URL**: `GET /api/<API_VERSION_NO>/user/isAdmin`
- **Auth**: session cookie
- **Responses**
	- `200 OK` `{ "success": true, "isAdmin": true }`

### Books

#### List or Search Books

- **URL**: `GET /api/<API_VERSION_NO>/book`
- **Auth**: session cookie
- **Query Parameters**
	- `title`, `author`, `description`: partial matches (case-insensitive)
	- `genres`: comma-delimited list requiring all genres
	- `bookid`: comma-delimited list of IDs
	- `minPrice`, `maxPrice`: numeric filters
	- `start`, `limit`: pagination (numbers)
	- `sortBy`: `title`, `price`, `publishedYear`
	- `sortOrder`: `asc` or `desc`
- **Example**

```
GET /api/v1/book?title=foundation&sortBy=price&sortOrder=asc&limit=5
```

- **Response**

```json
{
	"success": true,
	"data": [
		{
			"_id": "65f0c1cf2f45b7aa9157b201",
			"title": "Foundation",
			"author": "Isaac Asimov",
			"price": 12.99,
			"genres": ["Science Fiction"],
			"publishedYear": "1951"
		}
	]
}
```

#### Get Book by ID

- **URL**: `GET /api/<API_VERSION_NO>/book/:id`
- **Auth**: session cookie
- **Responses**
	- `200 OK` `{ "success": true, "data": { ...book } }`
	- `404 Not Found` if the book does not exist

#### Create Book (Admin Only)

- **URL**: `POST /api/<API_VERSION_NO>/book`
- **Auth**: admin session
- **Body**

```json
{
	"title": "New Novel",
	"author": "Author Name",
	"description": "Synopsis...",
	"genres": ["Mystery", "Thriller"],
	"publishedYear": "2025",
	"price": 21.5,
	"coverImage": "base64-encoded-image"
}
```

- **Responses**
	- `201 Created` with `{ "success": true, "message": "Book created successfully", "data": { ... } }`
	- `409 Conflict` if a book with the same title exists

#### Update Book (Admin Only)

- **URL**: `PUT /api/<API_VERSION_NO>/book/:id`
- **Auth**: admin session
- **Body**: any subset of book fields
- **Responses**
	- `200 OK` with updated book payload
	- `404 Not Found` for missing book

#### Delete Book (Admin Only)

- **URL**: `DELETE /api/<API_VERSION_NO>/book/:id`
- **Auth**: admin session
- **Responses**
	- `200 OK` `{ "success": true, "message": "Book <id> deleted successfully" }`

### Orders and Ownership

#### List Owned Books

- **URL**: `GET /api/<API_VERSION_NO>/user/ownbooks`
- **Auth**: session cookie
- **Response**

```json
{
	"success": true,
	"books": ["65f0c1cf2f45b7aa9157b201", "65f0c1cf2f45b7aa9157b202"]
}
```

#### List Orders

- **URL**: `GET /api/<API_VERSION_NO>/user/orders`
- **Auth**: session cookie
- **Response**

```json
{
	"success": true,
	"orders": ["65f0c43c2f45b7aa9157b210", "65f0c45a2f45b7aa9157b211"]
}
```

#### Get Order Details

- **URL**: `GET /api/<API_VERSION_NO>/user/orders/:id`
- **Auth**: session cookie (admin can view any order; non-admins are limited to their own orders)
- **Response**

```json
{
	"success": true,
	"order": {
		"id": "65f0c43c2f45b7aa9157b210",
		"type": "buy",
		"books": [
			"65f0c1cf2f45b7aa9157b201",
			"65f0c1cf2f45b7aa9157b202"
		],
		"createdAt": "2024-03-12T18:45:00.123Z",
		"updatedAt": "2024-03-12T18:45:00.123Z"
	}
}
```

- **Errors**
	- `404 Not Found` when the order does not exist or does not belong to the caller

#### Create Order

- **URL**: `POST /api/<API_VERSION_NO>/user/orders`
- **Auth**: session cookie
- **Body**

```json
{
	"type": "buy",
	"bookIds": ["65f0c1cf2f45b7aa9157b201", "65f0c1cf2f45b7aa9157b202"]
}
```

- **Notes**
	- `type` accepts `buy` or `refund`
	- Duplicate IDs are ignored; all IDs must be valid ObjectIds
	- Refunds require the user to currently own the book; buys fail if the user already owns it
- **Responses**
	- `200 OK` `{ "success": true, "message": "Buy order created successfully" }`
	- `400 Bad Request` with details for invalid IDs, already-owned, or not-owned books

#### Delete Order (Admin Only)

- **URL**: `DELETE /api/<API_VERSION_NO>/user/orders/:id`
- **Auth**: admin session
- **Responses**
	- `200 OK` `{ "success": true, "message": "Order <id> deleted" }`

### Session Test Utilities

When `TEST_PATH` is set (for example `test/dev`), test helpers are mounted at `/api/<API_VERSION_NO>/test/<TEST_PATH>`. These endpoints assist with managing test users and should not be exposed in production.

#### Create Test User

- **URL**: `POST /api/<API_VERSION_NO>/test/<TEST_PATH>/users`
- **Body**

```json
{
	"username": "testaccount1",
	"password": "TestPassword123!"
}
```

#### List Test Users

- **URL**: `GET /api/<API_VERSION_NO>/test/<TEST_PATH>/users`

#### Update Test User Password

- **URL**: `PUT /api/<API_VERSION_NO>/test/<TEST_PATH>/users/:username`
- **Body**

```json
{
	"password": "NewTestPassword456!"
}
```

#### Delete Test User

- **URL**: `DELETE /api/<API_VERSION_NO>/test/<TEST_PATH>/users/:username`

### Health

- **URL**: `GET /api/<API_VERSION_NO>/health`
- **Auth**: none
- **Response**
`200 OK`
```json
{
	"ok": true,
	"version": "v1"
}
```

---

For a Postman collection or scripted examples, adapt the payloads above with the correct host, port, and version prefix. Ensure cookies are preserved between requests to interact with authenticated routes.
