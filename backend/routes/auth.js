const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const { PrismaClient } = require("@prisma/client");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

const prisma = new PrismaClient();
const role = require("../middleware/role");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// ================= REGISTER =================
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password")
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/[0-9]/)
      .matches(/[^A-Za-z0-9]/),
    body("role").isIn(["tester", "developer", "admin"]),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        msg: "Password must be 8 characters and include uppercase, lowercase, number & special character",
      });
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

      const verifyToken = crypto.randomBytes(32).toString("hex");
      const verifyExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          verifyToken,
          verifyExpiry,
        },
      });

const verifyLink = `http://localhost:5000/api/auth/verify/${verifyToken}`;



const info = await transporter.sendMail({
  from: `"TestTrack" <${process.env.SMTP_USER}>`,
  to: email,
  subject: "Verify Your Account",
  html: `
    <div style="font-family: Arial, sans-serif;">
      <h2>Hello ${name},</h2>
      <p>Please click below to verify your account:</p>

      <a href="${verifyLink}"
         style="
           display:inline-block;
           padding:10px 20px;
           background:#2563eb;
           color:white;
           text-decoration:none;
           border-radius:5px;
           margin-top:10px;
         ">
         Verify Email
      </a>

      <p style="margin-top:20px;">
        Or copy this link:
      </p>

      <p>${verifyLink}</p>

      <p>This link expires in 1 hour.</p>
    </div>
  `,
});

console.log("Email sent:", info.response);

      res.json({
        msg: "Registration successful! Please verify your email.",
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);
router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const user = await prisma.user.findFirst({
      where: { verifyToken: token },
    });

    // 🔹 If token not found
    if (!user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/?verified=already`
      );
    }

    // 🔹 If expired
    if (user.verifyExpiry < new Date()) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/?verified=expired`
      );
    }

    // 🔹 Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyExpiry: null,
      },
    });

    // 🔹 Redirect to login page
return res.redirect(`${process.env.FRONTEND_URL}/?verified=success`);

  } catch (err) {
    console.error(err);
    return res.redirect(
      `${process.env.FRONTEND_URL}/?verified=error`
    );
  }
});

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
      // 1️⃣ Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      // 2️⃣ Check if user exists
      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // 3️⃣ ✅ Check if email verified (ADD HERE)
      if (!user.isVerified) {
        return res.status(400).json({
          msg: "Please verify your email first",
        });
      }

      // 4️⃣ Check password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // 5️⃣ Generate token
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
        msg: "Login successful",
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
router.get("/users", authMiddleware, role(["admin","tester"]), async (req, res) => {
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

router.get("/developers", authMiddleware, async (req, res) => {
  try {
    const developers = await prisma.user.findMany({
      where: { role: "developer" },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json(developers);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch developers" });
  }
});
module.exports = router;
