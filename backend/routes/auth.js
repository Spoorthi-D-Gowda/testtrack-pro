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
const passport = require("../config/passport");


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
      return res.status(400).json({ msg: "Invalid input" });
    }

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // 🚨 1️⃣ Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        return res.status(403).json({
          msg: "Account locked. Try again after 15 minutes.",
        });
      }

      // 🚨 2️⃣ Check if email verified
      if (!user.isVerified) {
        return res.status(400).json({
          msg: "Please verify your email first",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      // ❌ Wrong password
      if (!isMatch) {
        const attempts = user.failedAttempts + 1;

        // Lock after 5 attempts
        if (attempts >= 5) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedAttempts: 0,
              lockUntil: new Date(Date.now() + 15 * 60 * 1000), // 15 min
            },
          });

          return res.status(403).json({
            msg: "Too many failed attempts. Account locked for 15 minutes.",
          });
        }

        // Update failed attempts
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: attempts },
        });

        return res.status(400).json({
          msg: `Invalid credentials. ${5 - attempts} attempts remaining.`,
        });
      }

      // ✅ Successful login → reset attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: 0,
          lockUntil: null,
        },
      });

      // 🔐 Access Token (15 min)
const accessToken = jwt.sign(
  { 
    id: user.id, 
    role: user.role,
    tokenVersion: user.tokenVersion 
  },
  process.env.JWT_SECRET,
  { expiresIn: "15m" }
);

// 🔐 Refresh Token (7 days)
const refreshToken = jwt.sign(
  { id: user.id },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: "7d" }
);

     // Save refresh token in DB
await prisma.user.update({
  where: { id: user.id },
  data: { refreshToken }
});

res.json({
  msg: "Login successful",
  accessToken,
  refreshToken,
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
      return res.status(400).json({ msg: "User not found" });
    }

    // 🔐 Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // ⏳ 1 hour expiry
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetExpiry: expiry,
      },
    });

    const resetLink = `http://localhost:3000/reset/${token}`;

    // 📧 Send email
    await transporter.sendMail({
      from: `"TestTrack" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial;">
          <h2>Password Reset</h2>
          <p>Click below to reset your password:</p>

          <a href="${resetLink}"
            style="
              display:inline-block;
              padding:10px 20px;
              background:#dc2626;
              color:white;
              text-decoration:none;
              border-radius:5px;
            ">
            Reset Password
          </a>

          <p style="margin-top:15px;">
            This link expires in 1 hour.
          </p>

          <p>If you did not request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({
      msg: "Password reset link sent to your email",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
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
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // 🔐 Strong password check
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!strongPassword.test(password)) {
      return res.status(400).json({
        msg: "Password must meet strength requirements",
      });
    }

    // 🚫 Check last 5 passwords
    const lastPasswords = await prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    for (let old of lastPasswords) {
      const match = await bcrypt.compare(password, old.password);
      if (match) {
        return res.status(400).json({
          msg: "Cannot reuse last 5 passwords",
        });
      }
    }

    const hashed = await bcrypt.hash(password, 10);

    // Save old password to history
    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        password: user.password,
      },
    });

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetExpiry: null,
      },
    });

    res.json({ msg: "Password reset successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/change-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 1️⃣ Verify current password
    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: "Current password is incorrect",
      });
    }

    // 2️⃣ Strong password validation
    const strongPassword =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({
        msg: "Password must meet strength requirements",
      });
    }

    // 3️⃣ Check last 5 passwords
    const lastPasswords = await prisma.passwordHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    for (let old of lastPasswords) {
      const match = await bcrypt.compare(newPassword, old.password);
      if (match) {
        return res.status(400).json({
          msg: "Cannot reuse last 5 passwords",
        });
      }
    }

    // 4️⃣ Save current password into history
    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        password: user.password,
      },
    });

    // 5️⃣ Update password
    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    res.json({ msg: "Password changed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ msg: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ msg: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });

  } catch (err) {
    return res.status(403).json({ msg: "Token expired" });
  }
});
router.post("/logout-all", authMiddleware, async (req, res) => {
  await prisma.user.update({
    where: { id: req.user.id },
    data: {
      refreshToken: null,
      tokenVersion: { increment: 1 }
    }
  });

  res.json({ msg: "Logged out from all devices" });
});

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {

    const user = req.user;

    // 🔥 If new user → redirect to role selection
    if (user.isNewUser) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/choose-role?email=${user.email}&name=${user.name}&googleId=${user.googleId}`
      );
    }

    // Existing user → normal login
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);
router.post("/google/register", async (req, res) => {

  const { email, name, role, googleId } = req.body;

  try {

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        googleId,
        isVerified: true,
      },
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.json({ accessToken, refreshToken });

  } catch (err) {
    res.status(500).json({ msg: "OAuth registration failed" });
  }
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  async (req, res) => {

    const user = req.user;

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, tokenVersion: user.tokenVersion },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`
    );
  }
);
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
