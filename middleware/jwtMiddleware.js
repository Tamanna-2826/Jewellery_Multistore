const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const SECRET_KEY = crypto.randomBytes(32).toString('hex');;
const ALGORITHM = 'HS256';
const EXPIRES_IN_DAYS = 365;
const EXPIRES_IN_MS = EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000; // 365 days in milliseconds


const generateToken = (id,first_name,email,authority) => {
  const payload={
    id,
    first_name,
    email,
    authority,
  }

  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: EXPIRES_IN_MS, 
    algorithm: ALGORITHM,
  });
};

const jwtMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized - Token missing' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
      }
      req.decodedToken = decoded; 
      next(); 
    });
  } catch (error) {
    console.error('Error in JWT middleware:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { jwtMiddleware, generateToken };

