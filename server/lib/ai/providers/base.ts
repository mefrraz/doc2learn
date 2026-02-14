import { AIProvider, AIProviderConfig, AIOptions, AIMessage } from '../types';

/**
 * Base class for AI providers with common functionality
 */
export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  abstract generateCompletion(prompt: string, options?: AIOptions): Promise<string>;
  abstract generateChatCompletion(messages: AIMessage[], options?: AIOptions): Promise<string>;
  abstract getName(): string;
  abstract getModels(): string[];

  async isAvailable(): Promise<boolean> {
    try {
      // Simple check - if we have an API key, consider it available
      // More sophisticated checks can be implemented in subclasses
      return !!this.config.apiKey && this.config.apiKey.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Merge provided options with defaults
   */
  protected mergeOptions(options?: AIOptions): AIOptions {
    return {
      ...this.config.defaultOptions,
      ...options,
    };
  }

  /**
   * Get the model to use, falling back to default
   */
  protected getModel(options?: AIOptions): string {
    return options?.model || this.config.defaultModel || this.getModels()[0];
  }
}
