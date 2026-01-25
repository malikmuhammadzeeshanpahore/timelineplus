const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function jwtMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
  const token = auth.slice(7);
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = { id: data.uid, role: data.role, isAdmin: data.isAdmin };
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
}

function auth(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.slice(7);
    try {
      const data = jwt.verify(token, JWT_SECRET);
      req.user = { id: data.uid, role: data.role, isAdmin: data.isAdmin };
      
      if (allowedRoles.length > 0 && !allowedRoles.includes(data.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).send('Unauthorized');
  next();
}

module.exports = { jwtMiddleware, auth, adminOnly };
