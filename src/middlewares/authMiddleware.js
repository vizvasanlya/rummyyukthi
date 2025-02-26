const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
