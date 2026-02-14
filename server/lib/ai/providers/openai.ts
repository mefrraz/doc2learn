import OpenAI from 'openai';
import { BaseAIProvider } from './base';
import { AIProviderConfig, AIOptions, AIMessage, PROVIDER_MODELS, DEFAULT_MODELS } from '../types';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(config: AIProviderConfig) {
    super({
      ...config,
      defaultModel: config.defaultModel || DEFAULT_MODELS.openai,
    });
    
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  getName(): string {
    return 'openai';
  }

  getModels(): string[] {
    return PROVIDER_MODELS.openai;
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
      // Make a minimal API call to check if the key is valid
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
