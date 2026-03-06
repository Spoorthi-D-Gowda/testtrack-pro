# TestTrack Pro Backend

This directory contains the **Node.js/Express backend API** for TestTrack Pro.  
The backend provides RESTful endpoints for managing test cases, test suites, bug tracking, executions, user authentication, and project analytics.

---

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication- Securing API requests after login
- Passport.js -Google OAuth login

---

## Features

The backend provides APIs for:

- User authentication (JWT, role-based access control)
- Test case CRUD operations
- Test suite management
- Test execution tracking
- Bug tracking and assignment
- Reports and analytics
- Project configuration and milestones
- File uploads (test cases, execution evidence)

---

## Project Structure


```
backend/
│
├── index.js         # Main server entry point
├── prisma/          # Database schema and migrations
├── routes/          # API endpoint definitions
├── middleware/      # Authentication and role-based access control
├── config/          # Configuration files (passport)
├── .env             # Environment variables (database, secrets, etc.)
├── uploads/         # Uploaded files (executions, testcases)
└── README.md        # Backend documentation
```

---

## Important Route Files

| Route File         | Description                                 |
|-------------------|---------------------------------------------|
| auth.js           | User authentication and session management   |
| bug.js            | Bug tracking and assignment                  |
| dashboard.js      | Dashboard statistics and analytics           |
| execution.js      | Test execution management                    |
| export.js         | Exporting test data                          |
| milestones.js     | Project milestone APIs                       |
| project.js        | Project management                           |
| reports.js        | Reporting and analytics                      |
| suite.js          | Test suite management                        |
| testcase.js       | Test case CRUD operations                    |
| testcaseImport.js | Import test cases                            |
| testrun.js        | Test run management                          |

---

## Setup & Installation

Navigate to the backend directory and install dependencies:

```sh
cd backend
npm install
```

Configure environment variables if required (see config/).

Run database migrations:

```sh
npx prisma migrate deploy
```

Start the backend server:

```sh
npm start
```

The backend server will run at:

```
http://localhost:5000
```

---

## Database & Migrations

- Prisma manages the database schema and migrations.
- Migration files are located in `prisma/migrations/`.
- Update schema in `prisma/schema.prisma` and run:

```sh
npx prisma migrate dev
```

Generate Prisma client:

```sh
npx prisma generate
```

---

## API Overview

The backend exposes RESTful endpoints for all major features. Example endpoints:

| Endpoint                | Description                  |
|-------------------------|-----------------------------|
| POST /api/auth/register | Register new user           |
| POST /api/auth/login    | User login                  |
| GET /api/testcases      | Fetch test cases            |
| POST /api/testcases     | Create test case            |
| GET /api/bugs           | Fetch bug list              |
| POST /api/suites        | Create test suite           |
| POST /api/execution     | Execute test case           |

---

## Notes

- Ensure PostgreSQL is running and accessible.
- API endpoints must match frontend requests.
- Role-based access control is enforced through middleware.
- File uploads are handled via dedicated routes and stored in uploads/.

---
---

## Environment Variables

The backend uses a `.env` file for configuration. Common environment variables include:

| Variable                | Description                                 |
|-------------------------|---------------------------------------------|
| DATABASE_URL            | PostgreSQL connection string                 |
| JWT_SECRET              | Secret key for JWT authentication            |
| GOOGLE_CLIENT_ID        | Google OAuth client ID                       |
| GOOGLE_CLIENT_SECRET    | Google OAuth client secret                   |
| PORT                    | Port for backend server (default: 5000)      |
| NODE_ENV                | Environment mode (development/production)    |

Example `.env` file:

```
DATABASE_URL="postgresql://<db_user>:<db_password>@localhost:5432/<db_name>"
JWT_SECRET=<your_jwt_secret>
JWT_REFRESH_SECRET=<your_jwt_refresh_secret>
SMTP_HOST=<smtp_host>
SMTP_PORT=<smtp_port>
SMTP_USER=<smtp_user>
SMTP_PASS=<smtp_password>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
PORT=5000
NODE_ENV=development
```
