import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base';
import { AIProviderConfig, AIOptions, AIMessage, PROVIDER_MODELS, DEFAULT_MODELS } from '../types';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(config: AIProviderConfig) {
    super({
      ...config,
      defaultModel: config.defaultModel || DEFAULT_MODELS.anthropic,
    });
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  getName(): string {
    return 'anthropic';
  }

  getModels(): string[] {
    return PROVIDER_MODELS.anthropic;
  }

  async generateCompletion(prompt: string, options?: AIOptions): Promise<string> {
    const mergedOptions = this.mergeOptions(options);
    const model = this.getModel(options);

    const response = await this.client.messages.create({
      model,
      max_tokens: mergedOptions.maxTokens || 4096,
      temperature: mergedOptions.temperature ?? 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock ? textBlock.text : '';
  }

  async generateChatCompletion(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const mergedOptions = this.mergeOptions(options);
    const model = this.getModel(options);

    // Extract system message if present
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await this.client.messages.create({
      model,
      max_tokens: mergedOptions.maxTokens || 4096,
      temperature: mergedOptions.temperature ?? 0.7,
      system: systemMessage?.content,
      messages: conversationMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const textBlock = response.content.find(block => block.type === 'text');
    return textBlock ? textBlock.text : '';
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Anthropic doesn't have a simple check, so just verify the key format
      return this.config.apiKey.startsWith('sk-ant-');
    } catch {
      return false;
    }
  }
}
