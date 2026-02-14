import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest, requireAuth } from '../middleware/auth';
import { AIService, AIMessage, AIProviderType } from '../lib/ai';
import { decrypt } from '../lib/encryption';

const router = Router();

// Helper to get user's API keys
async function getUserApiKeys(userId: string): Promise<Partial<Record<AIProviderType, string>>> {
  const userApiKeys = await prisma.apiKey.findMany({
    where: { userId, isActive: true },
  });

  const userKeys: Partial<Record<AIProviderType, string>> = {};
  for (const apiKey of userApiKeys) {
    try {
      const decryptedKey = decrypt(apiKey.keyHash);
      userKeys[apiKey.provider as AIProviderType] = decryptedKey;
    } catch (error) {
      console.error(`Failed to decrypt key for provider ${apiKey.provider}:`, error);
    }
  }

  return userKeys;
}

// General chat endpoint (no document context)
router.post('/chat', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's API keys
    const userKeys = await getUserApiKeys(req.user!.id);
    if (Object.keys(userKeys).length === 0) {
      return res.status(400).json({ error: 'No API keys configured. Please add your API key in Settings.' });
    }

    const aiService = new AIService({ userKeys });

    const systemPrompt = `You are a helpful AI study assistant for Doc2Learn. You help students learn and understand various topics.

Your capabilities:
- Answer questions about any topic
- Explain complex concepts in simple terms
- Help with study strategies and learning techniques
- Generate practice questions and quizzes
- Summarize information
- Provide examples and analogies

Guidelines:
- Be helpful, accurate, and educational
- Keep responses focused and relevant
- If you don't know something, say so honestly
- Encourage critical thinking and deeper understanding
- Use markdown formatting when helpful (lists, bold, etc.)`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history if provided
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: message });

    const response = await aiService.generateChatCompletion(messages);

    return res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Chat with document context
router.post('/documents/:id/chat', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { message, pageContent } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get document for context
    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get user's API keys
    const userKeys = await getUserApiKeys(req.user!.id);
    if (Object.keys(userKeys).length === 0) {
      return res.status(400).json({ error: 'No API keys configured. Please add your API key in Settings.' });
    }

    const aiService = new AIService({ userKeys });

    // Build context from document
    let context = `Document Title: ${document.title}\n\n`;
    if (document.content) {
      context += `Document Content (excerpt):\n${document.content.slice(0, 5000)}\n\n`;
    }
    if (pageContent) {
      context += `Current Page Content:\n${pageContent}\n\n`;
    }

    const systemPrompt = `You are a helpful AI study assistant. You help students understand and learn from educational documents.

Your role:
- Answer questions about the document content clearly and concisely
- Explain complex concepts in simple terms
- Provide examples when helpful
- Encourage learning and critical thinking
- If asked about something not in the document, say so honestly

Context from the document:
${context}

Remember: Be helpful, accurate, and educational. Keep responses focused and relevant to the student's question.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ];

    const response = await aiService.generateChatCompletion(messages);

    return res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to process chat message' });
  }
});

// Summarize specific page/section
router.post('/documents/:id/summarize', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get user's API keys
    const userKeys = await getUserApiKeys(req.user!.id);
    if (Object.keys(userKeys).length === 0) {
      return res.status(400).json({ error: 'No API keys configured. Please add your API key in Settings.' });
    }

    const aiService = new AIService({ userKeys });

    const systemPrompt = `You are an expert educator. Create a clear, concise summary of the provided content.

Guidelines:
- Focus on key points and main ideas
- Use bullet points for clarity
- Highlight important terms or concepts
- Keep it educational and easy to understand
- Aim for 150-250 words`;

    const userPrompt = `Please summarize the following content:\n\n${content}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const summary = await aiService.generateChatCompletion(messages);

    return res.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    return res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Explain concept
router.post('/documents/:id/explain', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text to explain is required' });
    }

    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get user's API keys
    const userKeys = await getUserApiKeys(req.user!.id);
    if (Object.keys(userKeys).length === 0) {
      return res.status(400).json({ error: 'No API keys configured. Please add your API key in Settings.' });
    }

    const aiService = new AIService({ userKeys });

    const systemPrompt = `You are an expert educator. Explain the provided concept or term clearly and thoroughly.

Guidelines:
- Start with a simple definition
- Provide context and background
- Give examples when relevant
- Explain why it's important
- Connect to related concepts if applicable
- Use analogies to make complex ideas easier to understand`;

    const userPrompt = `Please explain the following concept:\n\n"${text}"\n\n${context ? `Context from document:\n${context}` : ''}`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const explanation = await aiService.generateChatCompletion(messages);

    return res.json({ explanation });
  } catch (error) {
    console.error('Explain error:', error);
    return res.status(500).json({ error: 'Failed to generate explanation' });
  }
});

// Generate exercises
router.post('/documents/:id/exercises', authenticateToken, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { content, topic } = req.body;

    if (!content && !topic) {
      return res.status(400).json({ error: 'Content or topic is required' });
    }

    const document = await prisma.document.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get user's API keys
    const userKeys = await getUserApiKeys(req.user!.id);
    if (Object.keys(userKeys).length === 0) {
      return res.status(400).json({ error: 'No API keys configured. Please add your API key in Settings.' });
    }

    const aiService = new AIService({ userKeys });

    const systemPrompt = `You are an expert educator. Generate practice exercises based on the provided content.

Guidelines:
- Create 5-8 exercises of varying difficulty
- Include different types: multiple choice, fill-in-the-blank, short answer
- Make exercises educational and relevant
- Provide correct answers for each exercise
- Return as valid JSON`;

    const userPrompt = `Generate practice exercises based on the following content:\n\n${content || `Topic: ${topic}`}

Return a JSON object with this structure:
{
  "exercises": [
    {
      "type": "multiple_choice" | "fill_blank" | "short_answer",
      "question": "The question text",
      "options": ["A", "B", "C", "D"] (only for multiple_choice),
      "correctAnswer": "The correct answer",
      "explanation": "Brief explanation of the answer"
    }
  ]
}

Return ONLY the JSON object, no additional text.`;

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    const response = await aiService.generateChatCompletion(messages);

    // Parse the JSON response
    let exercises;
    try {
      // Try to extract JSON from the response
      let cleaned = response.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      exercises = JSON.parse(cleaned.trim());
    } catch {
      // If parsing fails, return a default structure
      exercises = {
        exercises: [
          {
            type: 'short_answer',
            question: 'Could not generate exercises. Please try again.',
            correctAnswer: '',
            explanation: '',
          },
        ],
      };
    }

    return res.json(exercises);
  } catch (error) {
    console.error('Generate exercises error:', error);
    return res.status(500).json({ error: 'Failed to generate exercises' });
  }
});

export default router;
