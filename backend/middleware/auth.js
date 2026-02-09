const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: token contains { id, role }
    req.user = decoded;

    next();

  } catch (err) {
    console.error("Auth error:", err.message);

    res.status(401).json({ msg: "Token not valid" });
  }
};
