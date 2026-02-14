import { Router, Response } from 'express';
import { hash } from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireAuth } from '../middleware/auth';

const router = Router();

// Get all API keys for current user
router.get('/', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: req.user!.id },
      select: {
        id: true,
        provider: true,
        keyLast4: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ apiKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update API key
router.post('/', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { provider, key, name } = req.body;

    if (!provider || !key) {
      return res.status(400).json({ error: 'Provider and key are required' });
    }

    // Validate provider
    const validProviders = ['openai', 'anthropic', 'google', 'groq', 'cerebras', 'openrouter'];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Get last 4 characters for display
    const keyLast4 = key.slice(-4);

    // Hash the key for storage
    const keyHash = await hash(key, 12);

    // Upsert the API key
    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId: req.user!.id,
          provider,
        },
      },
      update: {
        keyHash,
        keyLast4,
        name: name || null,
        isActive: true,
      },
      create: {
        userId: req.user!.id,
        provider,
        keyHash,
        keyLast4,
        name: name || null,
      },
      select: {
        id: true,
        provider: true,
        keyLast4: true,
        name: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.json({ apiKey });
  } catch (error) {
    console.error('Create API key error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete API key
router.delete('/:id', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await prisma.apiKey.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle API key active status
router.patch('/:id/toggle', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const updated = await prisma.apiKey.update({
      where: { id },
      data: { isActive: !apiKey.isActive },
      select: {
        id: true,
        provider: true,
        keyLast4: true,
        name: true,
        isActive: true,
      },
    });

    return res.json({ apiKey: updated });
  } catch (error) {
    console.error('Toggle API key error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as apiKeyRoutes };