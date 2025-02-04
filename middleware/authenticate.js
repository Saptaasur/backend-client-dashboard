const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token part

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }

    console.log("Decoded user ID:", decoded.id); // Debugging decoded user ID
    req.user = decoded; // Attach decoded user data to request
    next(); // Proceed to the next route handler
  });
};


module.exports = authenticate;
