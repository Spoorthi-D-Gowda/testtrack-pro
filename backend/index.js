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
app.use("/api/export", exportRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/api/bugs", bugRoutes);


app.use("/api/testcases", testCaseRoutes);


app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("TestTrack Pro API Running ");
});

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
