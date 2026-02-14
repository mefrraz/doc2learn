/**
 * Masks an API key for display
 */
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) return '****'
  return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
}

/**
 * Gets the master encryption key from environment
 * Note: In production, encryption should happen on the server
 */
export function getMasterKey(): string {
  // Return a placeholder - actual encryption happens on the server
  return 'client-side-placeholder'
}
