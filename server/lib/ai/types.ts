// AI Provider types and interfaces

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string;
  topP?: number;
}

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProvider {
  /**
   * Generate a completion from the AI provider
   */
  generateCompletion(prompt: string, options?: AIOptions): Promise<string>;

  /**
   * Generate a completion with conversation history
   */
  generateChatCompletion(messages: AIMessage[], options?: AIOptions): Promise<string>;

  /**
   * Check if the provider is available (has valid API key)
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the provider name
   */
  getName(): string;

  /**
   * Get available models
   */
  getModels(): string[];
}

export interface AIProviderConfig {
  apiKey: string;
  defaultModel?: string;
  defaultOptions?: AIOptions;
}

// Supported AI providers
export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'groq';

// Provider model configurations
export const PROVIDER_MODELS: Record<AIProviderType, string[]> = {
  openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
};

// Default models for each provider
export const DEFAULT_MODELS: Record<AIProviderType, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-3-5-sonnet-20241022',
  google: 'gemini-1.5-flash',
  groq: 'llama-3.3-70b-versatile',
};
