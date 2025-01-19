const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied, token missing' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified Token Payload:', verified); // Debugging log
    req.user = verified; // Attach the user payload to the request object
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken;
