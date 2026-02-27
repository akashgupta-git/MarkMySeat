const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// middleware that verifies a theatre JWT token (stored as theatreToken)
const protectTheatre = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "theatre") {
      return res.status(403).json({ msg: "Not authorized as theatre" });
    }
    req.theatre = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = protectTheatre;
