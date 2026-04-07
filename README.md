# 📚 School Library Management API

A RESTful API for managing a School Library System built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

---

## 🚀 Features

- Full CRUD for Authors, Books, Students, and Library Attendants
- Book borrowing & returning with full status tracking
- Overdue book detection
- Pagination on all list endpoints
- Search books by title, ISBN, or author name
- Duplicate ISBN prevention
- Input validation via `express-validator`
- JWT authentication for Library Attendants
- Clean MVC architecture

---

## 🛠️ Tech Stack

| Tool        | Purpose                    |
|-------------|----------------------------|
| Node.js     | Runtime environment        |
| Express.js  | Web framework              |
| MongoDB     | NoSQL database             |
| Mongoose    | ODM for MongoDB            |
| JWT         | Authentication             |
| bcryptjs    | Password hashing           |
| express-validator | Input validation    |
| dotenv      | Environment variables      |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/school-library-api.git
cd school-library-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/school-library
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
library-system/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authorController.js    # Author CRUD logic
│   ├── bookController.js      # Book CRUD + borrow/return logic
│   ├── studentController.js   # Student CRUD logic
│   └── attendantController.js # Attendant CRUD + auth logic
├── middleware/
│   ├── auth.js                # JWT protect middleware
│   ├── errorHandler.js        # Global error handler
│   └── validate.js            # express-validator rules
├── models/
│   ├── Author.js
│   ├── Book.js
│   ├── Student.js
│   └── LibraryAttendant.js
├── routes/
│   ├── authorRoutes.js
│   ├── bookRoutes.js
│   ├── studentRoutes.js
│   └── attendantRoutes.js
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

---

## 📖 API Documentation

### Base URL
```
http://localhost:3000/api
```

---

### 👤 Authors

| Method | Endpoint         | Description         |
|--------|-----------------|---------------------|
| POST   | /authors        | Create a new author |
| GET    | /authors        | Get all authors     |
| GET    | /authors/:id    | Get single author   |
| PUT    | /authors/:id    | Update author       |
| DELETE | /authors/:id    | Delete author       |

#### Create Author — `POST /api/authors`
```json
{
  "name": "Chinua Achebe",
  "bio": "Nigerian novelist, poet, and critic."
}
```

#### Response
```json
{
  "success": true,
  "message": "Author created successfully",
  "data": {
    "_id": "664abc...",
    "name": "Chinua Achebe",
    "bio": "Nigerian novelist, poet, and critic.",
    "createdAt": "2026-04-06T10:00:00.000Z"
  }
}
```Hi

#### Query Parameters (GET /authors)
| Param  | Type   | Description              |
|--------|--------|--------------------------|
| page   | Number | Page number (default: 1) |
| limit  | Number | Items per page (default: 10) |
| search | String | Search by name           |

---

### 📚 Books

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| POST   | /books                | Create a new book        |
| GET    | /books                | Get all books            |
| GET    | /books/:id            | Get single book          |
| PUT    | /books/:id            | Update book              |
| DELETE | /books/:id            | Delete book              |
| POST   | /books/:id/borrow     | Borrow a book            |
| POST   | /books/:id/return     | Return a book            |
| GET    | /books/overdue        | Get all overdue books    |

#### Create Book — `POST /api/books`
```json
{
  "title": "Things Fall Apart",
  "isbn": "978-0-385-47454-2",
  "authors": ["664abc123...", "664abc456..."]
}
```

#### Query Parameters (GET /books)
| Param   | Type   | Description                        |
|---------|--------|------------------------------------|
| page    | Number | Page number (default: 1)           |
| limit   | Number | Items per page (default: 10)       |
| search  | String | Search by title, ISBN, or author   |
| status  | String | Filter by status: `IN` or `OUT`    |
| overdue | Boolean| Set to `true` to filter overdue    |

#### Borrow Book — `POST /api/books/:id/borrow`
```json
{
  "studentId": "664student...",
  "attendantId": "664attendant...",
  "returnDate": "2026-05-01T00:00:00.000Z"
}
```

**Rules:**
- Book must have status `"IN"`
- `returnDate` must be in the future
- `studentId` and `attendantId` must exist

#### Return Book — `POST /api/books/:id/return`
No request body needed.

**Rules:**
- Book must have status `"OUT"`
- Clears `borrowedBy`, `issuedBy`, `returnDate`
- Sets status back to `"IN"`

#### GET Single Book Response (when status is `"OUT"`)
```json
{
  "success": true,
  "data": { ... },
  "borrowInfo": {
    "borrowedBy": { "_id": "...", "name": "John Doe", "studentId": "STU001" },
    "issuedBy": { "_id": "...", "name": "Mrs. Okeke", "staffId": "STAFF01" },
    "returnDate": "2026-05-01T00:00:00.000Z",
    "isOverdue": false
  }
}
```

---

### 🎓 Students

| Method | Endpoint         | Description         |
|--------|-----------------|---------------------|
| POST   | /students       | Create a student    |
| GET    | /students       | Get all students    |
| GET    | /students/:id   | Get single student (includes currently borrowed books) |

#### Create Student — `POST /api/students`
```json
{
  "name": "Amaka Obi",
  "email": "amaka.obi@school.edu",
  "studentId": "STU2024001"
}
```

---

### 🏫 Library Attendants

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | /attendants         | Create attendant         |
| POST   | /attendants/login   | Login (get JWT token)    |
| GET    | /attendants         | Get all attendants       |
| GET    | /attendants/:id     | Get single attendant     |

#### Create Attendant — `POST /api/attendants`
```json
{
  "name": "Mrs. Ngozi Okeke",
  "staffId": "LIB-STAFF-001",
  "email": "ngozi.okeke@school.edu",
  "password": "securepassword123",
  "role": "attendant"
}
```

#### Login — `POST /api/attendants/login`
```json
{
  "email": "ngozi.okeke@school.edu",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": { ... }
}
```

---

## 🔒 Authentication (Bonus)

Protected routes use JWT Bearer tokens:

```http
Authorization: Bearer <your_jwt_token>
```

To use the `protect` middleware on any route, import it from `middleware/auth.js` and apply it:
```js
const { protect } = require('../middleware/auth');
router.delete('/:id', protect, deleteBook);
```

---

## ✅ Validation Rules

| Field       | Rules                                      |
|-------------|--------------------------------------------|
| name        | Required, string                           |
| email       | Required, valid email format, unique       |
| studentId   | Required, string, unique                   |
| staffId     | Required, string, unique                   |
| isbn        | Optional, string, unique                   |
| authors     | Optional, array of valid MongoDB ObjectIds |
| returnDate  | Required for borrow, must be future date   |
| password    | Optional, minimum 6 characters             |

---

## 🧪 Example Workflow

```bash
# 1. Create an author
POST /api/authors
{ "name": "Wole Soyinka", "bio": "Nigerian playwright and Nobel laureate." }

# 2. Create a book
POST /api/books
{ "title": "Death and the King's Horseman", "authors": ["<authorId>"] }

# 3. Create a student
POST /api/students
{ "name": "Emeka Eze", "email": "emeka@school.edu", "studentId": "STU001" }

# 4. Create a library attendant
POST /api/attendants
{ "name": "Mr. Bello", "staffId": "STF001", "email": "bello@lib.edu", "password": "pass1234" }

# 5. Borrow the book
POST /api/books/<bookId>/borrow
{ "studentId": "<studentId>", "attendantId": "<attendantId>", "returnDate": "2026-06-01" }

# 6. Return the book
POST /api/books/<bookId>/return

# 7. Check overdue books
GET /api/books/overdue
```

---

## 📬 Postman Collection

Import this into Postman:
1. Open Postman → **Import**
2. Paste the base URL: `http://localhost:3000/api`
3. Test each endpoint from the table above

---

## 👨‍💻 Author

Built as a School Library Management System assignment.

---

## 📝 License

MIT
