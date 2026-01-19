const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function jwtMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
  const token = auth.slice(7);
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = { id: data.uid };
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).send('Unauthorized');
  next();
}

module.exports = { jwtMiddleware, adminOnly };
