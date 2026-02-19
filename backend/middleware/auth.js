const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {

    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({
        msg: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token payload contains: { id, role }
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch (err) {

    console.error("Auth error:", err.message);

    return res.status(401).json({
      msg: "Invalid or expired token."
    });
  }
};
