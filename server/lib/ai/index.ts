import { AIProvider, AIProviderType, AIOptions, AIMessage } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleProvider } from './providers/google';
import { GroqProvider } from './providers/groq';

interface AIServiceConfig {
  // User's API keys (from database)
  userKeys?: Partial<Record<AIProviderType, string>>;
  
  // Environment API keys (fallback)
  envKeys?: Partial<Record<AIProviderType, string>>;
  
  // Preferred provider order
  providerOrder?: AIProviderType[];
}

/**
 * AI Service that manages multiple providers with fallback support
 */
export class AIService {
  private providers: Map<AIProviderType, AIProvider> = new Map();
  private providerOrder: AIProviderType[];

  constructor(config: AIServiceConfig) {
    const envKeys = config.envKeys || {
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      groq: process.env.GROQ_API_KEY,
    };

    // Initialize providers with user keys or fallback to env keys
    const keys = { ...envKeys, ...config.userKeys };

    if (keys.openai) {
      this.providers.set('openai', new OpenAIProvider({ apiKey: keys.openai }));
    }
    if (keys.anthropic) {
      this.providers.set('anthropic', new AnthropicProvider({ apiKey: keys.anthropic }));
    }
    if (keys.google) {
      this.providers.set('google', new GoogleProvider({ apiKey: keys.google }));
    }
    if (keys.groq) {
      this.providers.set('groq', new GroqProvider({ apiKey: keys.groq }));
    }

    // Set provider order (prefer user-configured, then default)
    this.providerOrder = config.providerOrder || ['openai', 'anthropic', 'google', 'groq'];
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get the first available provider
   */
  async getAvailableProvider(): Promise<AIProvider | null> {
    for (const providerType of this.providerOrder) {
      const provider = this.providers.get(providerType);
      if (provider && await provider.isAvailable()) {
        return provider;
      }
    }
    return null;
  }

  /**
   * Generate completion using the first available provider
   */
  async generateCompletion(prompt: string, options?: AIOptions): Promise<string> {
    const provider = await this.getAvailableProvider();
    
    if (!provider) {
      throw new Error('No AI provider available. Please configure an API key in Settings.');
    }

    return provider.generateCompletion(prompt, options);
  }

  /**
   * Generate chat completion using the first available provider
   */
  async generateChatCompletion(messages: AIMessage[], options?: AIOptions): Promise<string> {
    const provider = await this.getAvailableProvider();
    
    if (!provider) {
      throw new Error('No AI provider available. Please configure an API key in Settings.');
    }

    return provider.generateChatCompletion(messages, options);
  }

  /**
   * Generate completion with a specific provider
   */
  async generateCompletionWithProvider(
    providerType: AIProviderType,
    prompt: string,
    options?: AIOptions
  ): Promise<string> {
    const provider = this.providers.get(providerType);
    
    if (!provider) {
      throw new Error(`Provider ${providerType} is not configured. Please add an API key in Settings.`);
    }

    return provider.generateCompletion(prompt, options);
  }

  /**
   * Check if any provider is available
   */
  async hasAvailableProvider(): Promise<boolean> {
    const provider = await this.getAvailableProvider();
    return provider !== null;
  }
}

// Export types and providers
export * from './types';
export { OpenAIProvider } from './providers/openai';
export { AnthropicProvider } from './providers/anthropic';
export { GoogleProvider } from './providers/google';
export { GroqProvider } from './providers/groq';
