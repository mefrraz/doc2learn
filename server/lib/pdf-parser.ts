import pdf from 'pdf-parse';

export interface PDFParseResult {
  text: string;
  numPages: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

/**
 * Extract text content from a PDF buffer
 */
export async function parsePDF(buffer: Buffer): Promise<PDFParseResult> {
  try {
    const data = await pdf(buffer, {
      // Options for pdf-parse
      max: 0, // 0 = no limit on pages
    });

    // Clean up the text - remove excessive whitespace and null characters
    const cleanText = data.text
      .replace(/\x00/g, '') // Remove null characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return {
      text: cleanText,
      numPages: data.numpages,
      info: data.info as Record<string, unknown>,
      metadata: data.metadata as Record<string, unknown>,
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Truncate text to a maximum length while preserving word boundaries
 */
export function truncateText(text: string, maxLength: number = 50000): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}
