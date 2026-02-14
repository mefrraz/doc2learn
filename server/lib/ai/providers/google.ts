import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base';
import { AIProviderConfig, AIOptions, AIMessage, PROVIDER_MODELS, DEFAULT_MODELS } from '../types';

export class GoogleProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor(config: AIProviderConfig) {
    super({
      ...config,
      defaultModel: config.defaultModel || DEFAULT_MODELS.google,
    });
    
    this.client = new GoogleGenerativeAI(config.apiKey);
  }

  getName(): string {
    return 'google';
  }

  getModels(): string[] {
    return PROVIDER_MODELS.google;
  }

  async generateCompletion(prompt: string, options?: AIOptions): Promise<string> {
    const mergedOptions = this.mergeOptions(options);
    const model = this.getModel(options);

    const generativeModel = this.client.getGenerativeModel({ model });
    
    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: mergedOptions.maxTokens || 8192,
        temperature: mergedOptions.temperature ?? 0.7,
        topP: mergedOptions.topP,
      },
    });

    return result.response.text();
  }

  async generateChatCompletion(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const mergedOptions = this.mergeOptions(options);
    const model = this.getModel(options);

    const generativeModel = this.client.getGenerativeModel({ model });

    // Convert messages to Google's format
    // Google uses 'user' and 'model' roles
    const history = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = generativeModel.startChat({
      history,
      generationConfig: {
        maxOutputTokens: mergedOptions.maxTokens || 8192,
        temperature: mergedOptions.temperature ?? 0.7,
        topP: mergedOptions.topP,
      },
    });

    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) {
      throw new Error('No user message found');
    }

    const result = await chat.sendMessage(lastUserMessage.content);
    return result.response.text();
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Try a minimal generation to verify the key
      const model = this.client.getGenerativeModel({ model: 'gemini-pro' });
      await model.generateContent('Hi');
      return true;
    } catch {
      return false;
    }
  }
}
