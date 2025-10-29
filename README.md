# Bookstore API

A server-side application for managing a bookstore with user authentication, book management, and order processing.

## 🚀 Features

- **User Authentication**: Register, login, logout, change password
- **Book Management**: CRUD operations for books with search capabilities
- **Order Management**: Create orders (buy/refund), view order history
- **Admin Features**: Manage books and view system information
- **Session Management**: Secure cookie-based sessions with AES-256-GCM encryption

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   MONGODB_DB_NAME=bookstore
   PORT=3000
   API_VERSION_NO=v1
   SESSION_SECRET=your-secret-key-change-this
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Authentication Endpoints

#### Register
```http
POST /api/v1/user/register
Content-Type: application/json

{
  "username": "testuser123",
  "password": "SecurePass123!"
}
```

#### Login
```http
POST /api/v1/user/login
Content-Type: application/json

{
  "username": "testuser123",
  "password": "SecurePass123!"
}
```

#### Logout
```http
POST /api/v1/user/logout
Cookie: x-session=<session-token>
```

#### Change Password
```http
PUT /api/v1/user/change-password
Cookie: x-session=<session-token>
Content-Type: application/json

{
  "oldPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

#### Check Admin Status
```http
GET /api/v1/user/isAdmin
Cookie: x-session=<session-token>
```

### Book Endpoints

#### Get All Books or Search
```http
GET /api/v1/book
GET /api/v1/book?title=foo
GET /api/v1/book?author=bar
GET /api/v1/book?genres=Horror,Thriller
GET /api/v1/book?minPrice=10&maxPrice=50
Cookie: x-session=<session-token>
```

#### Get Book by ID
```http
GET /api/v1/book/:id
Cookie: x-session=<session-token>
```

#### Create Book (Admin Only)
```http
POST /api/v1/book
Cookie: x-session=<session-token>
Content-Type: application/json

{
  "title": "My Book Title",
  "author": "Author Name",
  "description": "Book description",
  "genres": ["Horror", "Thriller"],
  "publishedYear": "2024",
  "price": 19.99,
  "coverImage": "base64-encoded-image"
}
```

#### Update Book (Admin Only)
```http
PUT /api/v1/book/:id
Cookie: x-session=<session-token>
Content-Type: application/json

{
  "price": 24.99,
  "description": "Updated description"
}
```

#### Delete Book (Admin Only)
```http
DELETE /api/v1/book/:id
Cookie: x-session=<session-token>
```

### User Endpoints

#### Get User's Owned Books
```http
GET /api/v1/user/ownbooks
Cookie: x-session=<session-token>
```

#### Get User's Orders
```http
GET /api/v1/user/orders
Cookie: x-session=<session-token>
```

#### Create Order
```http
POST /api/v1/user/orders
Cookie: x-session=<session-token>
Content-Type: application/json

{
  "type": "buy",
  "bookIds": ["book_id_1", "book_id_2"]
}
```

### Admin Endpoints

#### Admin Health Check
```http
GET /api/v1/admin/health
Cookie: x-session=<session-token>
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **Session Encryption**: AES-256-GCM for session tokens
- **MongoDB Injection Prevention**: Input sanitization
- **Role-Based Access Control**: Admin and user roles
- **Session Invalidation**: Logout invalidates all sessions

## 📊 Data Models

### User
- username (unique, 8-32 characters)
- passwordHash (bcrypt hashed)
- role (admin/user/test)
- orders (array of order references)
- session data
- createdAt timestamp

### Book
- title (unique)
- author
- description
- genres (array)
- publishedYear
- price
- coverImage (base64)
- createdAt/updatedAt timestamps

### Order
- userId (reference to User)
- books (array of book references)
- type (buy/refund)
- timestamps

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URL | MongoDB connection URL | mongodb://localhost:27017 |
| MONGODB_DB_NAME | Database name | bookstore |
| PORT | Server port | 3000 |
| API_VERSION_NO | API version | v1 |
| SESSION_SECRET | Secret key for session encryption | (required) |
| SESSION_TIMEOUT | Session timeout in ms | 1800000 (30 min) |
| NODE_ENV | Environment | development |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👥 Authors

COMP 3810SEF Server-Side Technologies And Cloud Computing Project

## 🐛 Known Issues

Please check the [Issues](https://github.com/yourrepo/issues) page for known bugs and feature requests.

## 📞 Support

For support, please contact the development team or create an issue in the repository.
