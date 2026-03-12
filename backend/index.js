require("dotenv").config();
const dashboardRoutes = require("./routes/dashboard");

const authMiddleware = require("./middleware/auth");
const testCaseRoutes = require("./routes/testcase");
const express = require("express");

const authRoutes = require("./routes/auth");
const bugRoutes = require("./routes/bug");

const app = express();

const cors = require("cors");
const exportRoutes = require("./routes/export");
const suiteRoutes = require("./routes/suite");
const executionRoutes = require("./routes/execution");
const testRunRoutes = require("./routes/testrun");
const reportRoutes = require("./routes/reports");
const bugReports = require("./routes/bugReports");
const session = require("express-session");
const passport = require("./config/passport");
const projectRoutes = require("./routes/project");
const milestoneRoutes = require("./routes/milestones");
const bugComments = require("./routes/bugComments");
const notificationRoutes = require("./routes/notification");
const notificationPreferences =require("./routes/notificationPreferences");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "x-auth-token",
    "x-project-id"
  ]
}));


app.use("/api/suites", suiteRoutes);
app.use("/api/export", exportRoutes);
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/bugs", bugRoutes);

app.use("/api/testcases", testCaseRoutes);
app.use("/api/executions", executionRoutes);
app.use("/api/testruns", testRunRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/reports", bugReports);
app.use("/api/projects", projectRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/bugs", bugComments);
app.use("/api/notifications", notificationRoutes);
app.get("/", (req, res) => {
  res.send("TestTrack Pro API Running ");
});
app.use("/uploads", express.static("uploads"));
app.use(
  "/api/notification-preferences",
  notificationPreferences
);
app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    msg: "Welcome to protected route ",
    user: req.user,
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});