const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// verifies the JWT is valid AND has an admin role — rejects everyone else
const protectAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized as admin" });
    }
    req.admin = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = protectAdmin;
