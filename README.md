
# TestTrack Pro

TestTrack Pro is a full-stack application for managing software testing, bug tracking, and project milestones. It provides tools for creating and managing test cases, organizing them into suites, tracking bugs, executing tests, and generating reports.
The system consists of a Node.js/Express backend and a React frontend, using Prisma ORM with PostgreSQL for database management.

## Table of Contents
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database & Migrations](#database--migrations)
- [Usage](#usage)
- [Folder Overview](#folder-overview)
- [API Overview](#api-overview)

## Architecture

TestTrack Pro follows a modular full-stack architecture.

### Backend
The backend is built with Node.js and Express.js and exposes RESTful APIs for:
- Authentication
- Test case management
- Test suite management
- Bug tracking
- Reporting and analytics
Database operations are handled using Prisma ORM.

### Frontend
The frontend is built with React, providing an interactive interface for testers, developers, and administrators. It communicates with the backend through API calls using Axios.

### Database
The system uses PostgreSQL, managed through Prisma migrations and schema models.

### Authentication
Authentication is implemented using JWT (JSON Web Tokens) along with role-based access control to secure system operations.

### File Uploads
Files such as imported test cases or execution evidence are stored in a dedicated uploads directory.

The architecture keeps the frontend and backend decoupled, allowing independent development and deployment.

## Tech Stack

### Frontend
- React
- Axios
- React Router

### Backend
- Node.js
- Express.js
- Prisma ORM

### Database
- PostgreSQL

### Authentication
- JWT (JSON Web Tokens)

### Tools
- Git
- npm
- Prisma CLI

## Features
- User authentication and role-based access control
- Test case creation, editing, cloning, and version history
- Test suite creation and execution
- Bug tracking and assignment workflow
- Import/export test cases (CSV, Excel, JSON)
- Dashboard analytics and reporting
- Soft delete and restore functionality
- Bulk operations for test case management
- Project configuration and milestone tracking

## Project Structure

```
testtrack-pro/
│
├── backend/          # Node.js + Express REST API
│   ├── prisma/       # Database schema and migrations (Prisma)
│   ├── routes/       # API endpoint definitions
│   ├── middleware/   # Authentication and role-based access control
│   └── README.md     # Backend documentation
├── frontend/         # React application
│   ├── pages/        # Application pages (React components)
│   └── README.md     # Frontend documentation
├── uploads/          # Imported files and execution attachments
└── README.md         # Project documentation
```

## Backend Setup

Navigate to the backend folder:

```sh
cd backend
npm install
```

Configure environment variables if required (see config files).

Run database migrations:

```sh
npx prisma migrate deploy
```

Start the backend server:

```sh
npm start
```

The backend server will start on:

```sh
http://localhost:5000
```

## Frontend Setup

Navigate to the frontend folder:

```sh
cd frontend
npm install
```

Start the React application:

```sh
npm start
```

The frontend application will run at:

```sh
http://localhost:3000
```

## Database & Migrations

Prisma manages the database schema and migrations.

Migration files are located in:

```sh
backend/prisma/migrations/
```

To update the database schema:

Modify the schema:

```sh
backend/prisma/schema.prisma
```

Run migration:

```sh
npx prisma migrate dev
```

Generate Prisma client:

```sh
npx prisma generate
```

## Usage

Start the backend server.

```sh
cd backend
npm start
```

Start the frontend application.

```sh
cd frontend
npm start
```

Open the application in your browser:

```sh
http://localhost:3000
```

Register a new user or login to access the dashboard.

## Folder Overview

### Backend

```sh
backend/
```
Key folders and files:
- index.js – Main server entry point
- middleware/ – Authentication and role-based access control
- prisma/ – Database schema and migrations
- routes/ – API endpoints

Important Route Files
- auth.js – User authentication
- bug.js – Bug tracking
- dashboard.js – Dashboard statistics
- execution.js – Test execution management
- export.js – Exporting test data
- milestones.js – Project milestone APIs
- project.js – Project management
- reports.js – Reporting and analytics
- suite.js – Test suite management
- testcase.js – Test case CRUD operations
- testcaseImport.js – Import test cases
- testrun.js – Test run management

### Frontend

```sh
frontend/src/
```
Main folders:
- pages/ – Application pages

Important Pages
- Dashboard.js – Dashboard overview
- TestCases.js – Test case management
- TestSuites.js – Test suite management
- ExecuteTestCase.js – Test execution
- ExecutionHistory.js – Execution tracking
- ExecutionCompare.js – Compare test executions
- Bugs.js – Bug tracking
- Reports.js – Reports and analytics
- ProjectSettings.js – Project configuration
- Milestones.js – Milestone management
- Login.js – Login page
- Register.js – User registration
- ForgotPassword.js – Password recovery
- ResetPassword.js – Password reset
- VerifyEmail.js – Email verification


## API Overview

Key backend API endpoints include:

| Endpoint              | Description              |
|-----------------------|-------------------------|
| POST /api/auth/register | Register new user      |
| POST /api/auth/login    | User login             |
| GET /api/testcases      | Fetch test cases       |
| POST /api/testcases     | Create test case       |
| GET /api/bugs           | Fetch bug list         |
| POST /api/suites        | Create test suite      |
| POST /api/execution     | Execute test case      |

