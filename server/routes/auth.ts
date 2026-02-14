import { Router, Response } from 'express';
import { SignJWT } from 'jose';
import { hash, compare } from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const secretKey = new TextEncoder().encode(JWT_SECRET);

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // Create token
    const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey);

    // Set cookie
    res.cookie('auth-token', token, COOKIE_OPTIONS);

    return res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token
    const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(secretKey);

    // Set cookie
    res.cookie('auth-token', token, COOKIE_OPTIONS);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', (_req, res: Response) => {
  res.clearCookie('auth-token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res.json({ success: true });
});

// Get current user
router.get('/me', authenticateToken, requireAuth, (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

// Verify token (for client-side validation)
router.get('/verify', authenticateToken, (req: AuthRequest, res: Response) => {
  return res.json({ valid: true, user: req.user });
});

export { router as authRoutes };