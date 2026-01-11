import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AuthRequest extends Request {
  user?: any;
}

export function jwtMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).send('Unauthorized');
  const token = auth.slice(7);
  try {
    const data: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: data.uid };
    next();
  } catch (err) {
    res.status(401).json({ error: 'invalid token' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).send('Unauthorized');
  // In real usage, fetch user and check isAdmin. For now, attach and proceed: caller should call ensureAdmin
  next();
}
