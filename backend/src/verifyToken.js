// verifyToken.js
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    console.log("verified= ", user);
    req.user = user;
    next(); // THIS IS CRITICAL - without this, the request hangs
  });
};

module.exports = authenticateToken;