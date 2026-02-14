import Groq from 'groq-sdk';
import { BaseAIProvider } from './base';
import { AIProviderConfig, AIOptions, AIMessage, PROVIDER_MODELS, DEFAULT_MODELS } from '../types';

export class GroqProvider extends BaseAIProvider {
  private client: Groq;

  constructor(config: AIProviderConfig) {
    super({
      ...config,
      defaultModel: config.defaultModel || DEFAULT_MODELS.groq,
    });
    
    this.client = new Groq({
      apiKey: config.apiKey,
    });
  }

  getName(): string {
    return 'groq';
  }

  getModels(): string[] {
    return PROVIDER_MODELS.groq;
  }

  async generateCompletion(prompt: string, options?: AIOptions): Promise<string> {
    const mergedOptions = this.mergeOptions(options);
    const model = this.getModel(options);

    const response = await this.client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: mergedOptions.maxTokens || 4096,
      temperature: mergedOptions.temperature ?? 0.7,
      top_p: mergedOptions.topP,
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateChatCompletion(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const mergedOptions = this.mergeOptions(options);
    const model = this.getModel(options);

    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: mergedOptions.maxTokens || 4096,
      temperature: mergedOptions.temperature ?? 0.7,
      top_p: mergedOptions.topP,
    });

    return response.choices[0]?.message?.content || '';
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Groq uses API keys starting with 'gsk_'
      return this.config.apiKey.startsWith('gsk_');
    } catch {
      return false;
    }
  }
}
