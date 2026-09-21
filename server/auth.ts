import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant dans les variables d\'environnement.');
}

export const COOKIE_NAME = 'axecompta_session';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: string;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: AuthTokenPayload) {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  (req as any).user = payload;
  next();
}
/** Utilisateur authentifié attaché à la requête par requireAuth (undefined si non connecté). */
export function getAuthUser(req: Request): AuthTokenPayload | undefined {
  return (req as any).user as AuthTokenPayload | undefined;
}
