const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// checks the Bearer token from the Authorization header and attaches the user id to req
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ msg: "No token, access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id; // attach user id to request
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = protect;