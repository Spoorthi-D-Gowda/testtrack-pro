const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = async function (req, res, next) {
  try {

    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({
        msg: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 Fetch user from DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        msg: "User not found."
      });
    }

    // 🔥 Compare tokenVersion
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({
        msg: "Session invalidated. Please login again."
      });
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();

  } catch (err) {

    console.error("Auth error:", err.message);

    return res.status(401).json({
      msg: "Invalid or expired token."
    });
  }
};