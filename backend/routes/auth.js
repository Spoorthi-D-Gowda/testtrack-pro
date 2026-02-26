const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const { PrismaClient } = require("@prisma/client");

const router = express.Router();

const prisma = new PrismaClient();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

// ================= REGISTER =================
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["tester", "developer", "admin"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
      const userExists = await prisma.user.findUnique({
        where: { email },
      });

      if (userExists) {
        return res.status(400).json({ msg: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      res.json({
        msg: "User registered successfully ",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// ================= LOGIN =================
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        msg: "Login successful ",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

const crypto = require("crypto");

// ========== FORGOT PASSWORD ==========
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ msg: "User not found " });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetExpiry: expiry,
      },
    });

    // For now: log link (later email)
    console.log("Password Reset Link:");
    console.log(`http://localhost:3000/reset/${token}`);

    res.json({
      msg: "Reset link sent to email (check console) ",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error " });
  }
});

// ========== RESET PASSWORD ==========
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token " });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Weak password " });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetExpiry: null,
      },
    });

    res.json({ msg: "Password reset successful " });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error " });
  }
});

// ================= GET ALL USERS (ADMIN ONLY) =================
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {

      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      res.json(users);

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Failed to fetch users" });
    }
  }
);
module.exports = router;
