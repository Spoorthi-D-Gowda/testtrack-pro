require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();


// ✅ CORS (correct and complete)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-auth-token"]
  })
);


// ✅ Body parsers (must be BEFORE routes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Import routes
const authMiddleware = require("./middleware/auth");

const testcaseImport = require("./routes/testcaseImport");   // CSV/Excel/JSON import
const dashboardRoutes = require("./routes/dashboard");
const testCaseRoutes = require("./routes/testcase");
const authRoutes = require("./routes/auth");
const bugRoutes = require("./routes/bug");
const exportRoutes = require("./routes/export");


// ✅ Register routes (ORDER matters)

// export
app.use("/api/export", exportRoutes);

// dashboard
app.use("/api/dashboard", dashboardRoutes);

// import FIRST (important)
app.use("/api/testcases", testcaseImport);

// testcase CRUD
app.use("/api/testcases", testCaseRoutes);

// bugs
app.use("/api/bugs", bugRoutes);

// auth
app.use("/api/auth", authRoutes);



// health check
app.get("/", (req, res) => {
  res.send("TestTrack Pro API Running ");
});


// protected test
app.get("/api/profile", authMiddleware, (req, res) => {

  res.json({
    msg: "Welcome to protected route ",
    user: req.user
  });

});


// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
