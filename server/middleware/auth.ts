import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    req.user = {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}