const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const SECRET_KEY =
  "d7a8fbb2764d4d0fa4a36e93d9a15fba6b831d59b4b71d987fe789a1b7d3d4a9";
const ALGORITHM = "HS256";
const EXPIRES_IN_DAYS = 365;
const EXPIRES_IN_MS = EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000; // 365 days in milliseconds

const generateToken = (id, first_name, email, authority) => {
  const payload = {
    id,
    first_name,
    email,
    authority,
  };

  return jwt.sign(payload, SECRET_KEY, {
    expiresIn: EXPIRES_IN_MS,
    algorithm: ALGORITHM,
  });
};

const jwtMiddleware = (req, res, next) => {
  try {
    const token =
      req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - Token missing" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Error verifying token:", err);
        return res
          .status(401)
          .json({ message: "Unauthorized - Invalid token" });
      }
      req.decodedToken = decoded;

      next();
    });
  } catch (error) {
    console.error("Error in JWT middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const isAdmin = (req, res, next) => {
  if (!req.decodedToken) {
    return res.status(401).json({ message: "Unauthorized - Token not verified" });
  }

  if (req.decodedToken.authority !== 'admin') {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }

  next();
};
module.exports = { jwtMiddleware, generateToken,isAdmin };
