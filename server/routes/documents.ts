import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireAuth } from '../middleware/auth';
import { uploadMiddleware, UploadedFile, uploadMemoryMiddleware, UploadedMemoryFile } from '../middleware/upload';
import { parsePDF, truncateText } from '../lib/pdf-parser';
import { AIService, AIProviderType } from '../lib/ai';
import { COMBINED_PROMPT, parseAIJsonResponse } from '../lib/prompts';
import { decrypt } from '../lib/encryption';
import fs from 'fs';
import path from 'path';

const router = Router();

// Get all documents for current user
router.get('/', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        progress: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single document
router.get('/:id', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
      include: {
        progress: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create document (placeholder for upload)
router.post('/', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, filename, fileType, fileSize, content } = req.body;

    if (!title || !filename || !fileType || !fileSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const document = await prisma.document.create({
      data: {
        userId: req.user!.id,
        title,
        filename,
        fileType,
        fileSize,
        content: content || null,
      },
    });

    // Create initial progress
    await prisma.documentProgress.create({
      data: {
        documentId: document.id,
        stage: 'uploaded',
        status: 'pending',
        progress: 0,
      },
    });

    return res.status(201).json({ document });
  } catch (error) {
    console.error('Create document error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload PDF with parsing
router.post('/upload', authenticateToken, requireAuth, uploadMiddleware.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file as UploadedFile;
    const title = req.body.title || file.originalname.replace('.pdf', '');

    // Parse PDF to extract text
    let extractedText = '';
    let numPages = 0;
    
    try {
      const fileBuffer = fs.readFileSync(file.path);
      const parseResult = await parsePDF(fileBuffer);
      extractedText = truncateText(parseResult.text, 50000); // Limit to 50k characters
      numPages = parseResult.numPages;
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      // Continue without text - user can still see the document
    }

    // Create document record with file path
    const document = await prisma.document.create({
      data: {
        userId: req.user!.id,
        title,
        filename: file.originalname,
        fileType: 'pdf',
        fileSize: file.size,
        content: extractedText || null,
        filePath: file.filename, // Store just the filename, not full path
      },
    });

    // Create initial progress
    await prisma.documentProgress.create({
      data: {
        documentId: document.id,
        stage: extractedText ? 'extracted' : 'uploaded',
        status: extractedText ? 'completed' : 'pending',
        progress: extractedText ? 100 : 0,
      },
    });

    return res.status(201).json({ 
      document,
      metadata: {
        numPages,
        textLength: extractedText.length,
      },
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document
router.patch('/:id', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, summary, glossary, flashcards, quiz, concepts } = req.body;

    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updated = await prisma.document.update({
      where: { id },
      data: {
        title,
        summary,
        glossary,
        flashcards,
        quiz,
        concepts,
      },
    });

    return res.json({ document: updated });
  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await prisma.document.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate learning content for a document
router.post('/:id/generate', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    // Get document
    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.content) {
      return res.status(400).json({ error: 'Document has no content to process' });
    }

    // Get user's API keys from database
    const userApiKeys = await prisma.apiKey.findMany({
      where: { userId: req.user!.id, isActive: true },
    });

    // Decrypt user's API keys
    const userKeys: Partial<Record<AIProviderType, string>> = {};
    for (const apiKey of userApiKeys) {
      try {
        const decryptedKey = decrypt(apiKey.keyHash);
        userKeys[apiKey.provider as AIProviderType] = decryptedKey;
      } catch (error) {
        console.error(`Failed to decrypt key for provider ${apiKey.provider}:`, error);
      }
    }

    if (Object.keys(userKeys).length === 0) {
      return res.status(400).json({ 
        error: 'No API keys configured. Please add your API key in Settings.' 
      });
    }

    // Create AI service with user's keys
    const aiService = new AIService({ userKeys });

    // Check if provider is available
    const hasProvider = await aiService.hasAvailableProvider();
    if (!hasProvider) {
      return res.status(400).json({ 
        error: 'No AI provider available. Please check your API keys in Settings.' 
      });
    }

    // Truncate content to avoid token limits (roughly 4 chars per token)
    // Groq free tier: 12000 TPM, so we limit to ~8000 tokens for input
    const maxContentLength = 30000; // ~7500 tokens
    const truncatedContent = document.content.length > maxContentLength
      ? document.content.substring(0, maxContentLength) + '\n\n[Content truncated due to size...]'
      : document.content;

    // Update progress
    await prisma.documentProgress.create({
      data: {
        documentId: id,
        stage: 'generating',
        status: 'processing',
        progress: 10,
      },
    });

    // Generate content using AI
    const prompt = COMBINED_PROMPT.user(truncatedContent);
    const systemPrompt = COMBINED_PROMPT.system;

    const response = await aiService.generateChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ], {
      maxTokens: 8192,
      temperature: 0.7,
    });

    // Parse the response
    const generated = parseAIJsonResponse<{
      summary: string;
      glossary: Array<{ term: string; definition: string }>;
      flashcards: Array<{ front: string; back: string }>;
      quiz: Array<{ question: string; options: string[]; correct: number }>;
      concepts: Array<{ name: string; description: string; related: string[] }>;
    }>(response);

    // Update document with generated content
    const updated = await prisma.document.update({
      where: { id },
      data: {
        summary: generated.summary,
        glossary: generated.glossary,
        flashcards: generated.flashcards,
        quiz: generated.quiz,
        concepts: generated.concepts,
      },
    });

    // Update progress to completed
    await prisma.documentProgress.create({
      data: {
        documentId: id,
        stage: 'completed',
        status: 'completed',
        progress: 100,
      },
    });

    return res.json({ 
      document: updated,
      generated: {
        summaryLength: generated.summary.length,
        glossaryCount: generated.glossary.length,
        flashcardCount: generated.flashcards.length,
        quizCount: generated.quiz.length,
        conceptCount: generated.concepts.length,
      },
    });
  } catch (error) {
    console.error('Generate content error:', error);
    
    // Update progress to failed
    const id = req.params.id as string;
    await prisma.documentProgress.create({
      data: {
        documentId: id,
        stage: 'generating',
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate content' 
    });
  }
});

// Serve PDF file for viewing
router.get('/:id/file', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.filePath) {
      return res.status(404).json({ error: 'No file associated with this document' });
    }

    const fullPath = path.join(process.cwd(), 'uploads', document.filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // Set headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${document.filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Serve file error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as documentRoutes };