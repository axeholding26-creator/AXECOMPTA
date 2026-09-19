import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from './db';

const router = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Réservé aux administrateurs.' });
  }
  next();
}

function serializeUser(u: { id: string; email: string; name: string; role: string; createdAt: Date }) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt.toISOString() };
}

router.use(requireAdmin);

router.get('/users', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(users.map(serializeUser));
  } catch (e) {
    next(e);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body ?? {};
    if (!['ADMIN', 'COMPTABLE', 'LECTURE_SEULE'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide.' });
    }

    const requester = (req as any).user;
    if (req.params.id === requester.sub && role !== 'ADMIN') {
      return res.status(400).json({ error: 'Vous ne pouvez pas retirer votre propre rôle administrateur.' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });
    res.json(serializeUser(updated));
  } catch (e) {
    next(e);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    const requester = (req as any).user;
    if (req.params.id === requester.sub) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;
