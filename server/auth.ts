import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

/**
 * Résolu à l'usage (pas au chargement du module) : sur une fonction serverless,
 * une exception levée au chargement d'un module fait planter tout le processus
 * (toutes les routes, y compris /api/health), sans message exploitable côté
 * client. En la déportant ici, seule une requête touchant réellement l'auth
 * échoue si la variable est absente, et l'erreur remonte proprement via le
 * gestionnaire d'erreurs Express.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET manquant dans les variables d\'environnement.');
  }
  return secret;
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
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
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
