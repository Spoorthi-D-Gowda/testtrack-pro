# TestTrack Pro Frontend

This directory contains the **React frontend application** for TestTrack Pro.  
The frontend provides the user interface for managing test cases, test suites, bug tracking, executions, and project analytics.

It communicates with the backend API built with **Node.js and Express**.

---

## Tech Stack

- React
- Axios
- React Router
- CSS

---

## Features

The frontend provides the UI for:

- User authentication (Login, Register, Password reset)
- Dashboard with analytics
- Test case management
- Test suite management
- Test execution tracking
- Bug tracking
- Reports and analytics
- Project configuration and milestones

---

## Project Structure


```
frontend/
│
├── public/              # Static files
├── src/
│   ├── pages/           # Application pages
│   ├── auth.css         # CSS files
│   ├── api.js           # Central Axios configuration with interceptors
│   └── App.js           # Main application component
├── package.json
└── README.md
```

---

## Important Pages

| Page              | Description                                 |
|-------------------|---------------------------------------------|
| Dashboard.js      | Main dashboard showing system overview       |
| TestCases.js      | Create, edit, clone, and manage test cases   |
| TestSuites.js     | Manage test suites and suite execution       |
| ExecuteTestCase.js| Execute individual test cases                |
| ExecutionHistory.js| View execution history                      |
| Bugs.js           | Bug tracking and assignment                  |
| Reports.js        | View system reports and analytics            |
| ProjectSettings.js| Configure project settings                   |
| Milestones.js     | Manage project milestones                    |
| Login.js          | User login                                   |
| Register.js       | User registration                            |
| ForgotPassword.js | Password recovery                            |
| ResetPassword.js  | Password reset                               |
| VerifyEmail.js    | Email verification                           |

---

## Installation

Navigate to the frontend directory and install dependencies.

```sh
cd frontend
npm install
```

### Running the Application

Start the development server:

```sh
npm start
```

The application will run at:

```
http://localhost:3000
```

Make sure the backend server is running on:

```
http://localhost:5000
```

### API Integration

The frontend communicates with the backend using Axios.

Example API request:

```js
axios.get("http://localhost:5000/api/testcases")
```
A centralized Axios configuration is defined in:
Copy code

src/api.js

This file sets the base API URL and automatically attaches authentication headers using Axios interceptors.

Authentication is handled using JWT tokens stored in localStorage or sessionStorage.

### Environment Configuration

If needed, create an .env file in the frontend directory to store environment variables such as:

```
REACT_APP_API_URL=http://localhost:5000
```

### Build for Production

To create an optimized production build:

```sh
npm run build
```

The build files will be generated in the build/ folder.

---


