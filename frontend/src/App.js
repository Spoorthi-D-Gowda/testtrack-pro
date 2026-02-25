import { Routes, Route, Navigate } from "react-router-dom";
import Bugs from "./pages/Bugs";
import Analytics from "./pages/Analytics";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TestCases from "./pages/TestCases";
import TestSuites from "./pages/TestSuites";

// Protected Route Component
function PrivateRoute({ children }) {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  return token ? children : <Navigate to="/" />;
}

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot" element={<ForgotPassword />} />

      <Route path="/reset/:token" element={<ResetPassword />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

        <Route
  path="/testcases"
  element={
    <PrivateRoute>
      <TestCases />
    </PrivateRoute>
  }
/>

<Route
  path="/bugs"
  element={
    <PrivateRoute>
      <Bugs />
    </PrivateRoute>
  }
/>
<Route
  path="/analytics"
  element={
    <PrivateRoute>
      <Analytics />
    </PrivateRoute>
  }
/>
<Route path="/dashboard/testcases/view" element={<Dashboard />} />
<Route path="/dashboard/testcases/create" element={<Dashboard />} />

<Route path="/suites" element={
  <PrivateRoute>
            <TestSuites />
          </PrivateRoute>
  } 
  />

    </Routes>
  );
}

export default App;