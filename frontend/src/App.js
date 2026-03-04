
import { Routes, Route, Navigate } from "react-router-dom";
import Bugs from "./pages/Bugs";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TestCases from "./pages/TestCases";
import TestSuites from "./pages/TestSuites";
import ExecuteTestCase from "./pages/ExecuteTestCase";
import TestRuns from "./pages/TestRuns";
import ExecutionCompare from "./pages/ExecutionCompare";
import SuiteExecution from "./pages/SuiteExecution";
import OAuthSuccess from "./pages/OAuthSuccess";
import ChooseRole from "./pages/ChooseRole";
import ProjectSettings from "./pages/ProjectSettings";
// Protected Route Component
function PrivateRoute({ children }) {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");

  return token ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <Routes>
<Route path="/oauth-success" element={<OAuthSuccess />} />
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
  path="/reports"
  element={
    <PrivateRoute>
      <Reports />
    </PrivateRoute>
  }
/>
<Route path="/dashboard/testcases/view" element={<Dashboard />} />
<Route path="/dashboard/testcases/create" element={<Dashboard />} />

<Route
  path="/testruns"
  element={
    <PrivateRoute>
      <TestRuns />
    </PrivateRoute>
  }
/>
<Route path="/suites" element={
  <PrivateRoute>
            <TestSuites />
          </PrivateRoute>
  } 
  />
  <Route
  path="/execute/:testCaseId"
  element={
    <PrivateRoute>
      <ExecuteTestCase />
    </PrivateRoute>
  }
/>
<Route path="/compare/:testCaseId" element={<ExecutionCompare />} />

<Route
  path="/suite-execution/:suiteExecutionId"
  element={<SuiteExecution />}
/>
<Route path="/choose-role" element={<ChooseRole />} />
<Route path="/project-settings" element={<ProjectSettings />} />

    </Routes>
  );
}

export default App;