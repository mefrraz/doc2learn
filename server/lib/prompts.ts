// Prompt templates for AI content generation

export interface PromptTemplate {
  system: string | ((language?: string) => string);
  user: (content: string, language?: string) => string;
}

/**
 * Generate a summary of the document
 */
export const SUMMARY_PROMPT: PromptTemplate = {
  system: `You are an expert educator and content summarizer. Your task is to create comprehensive, well-structured summaries of educational content.

Guidelines:
- Create a DETAILED and COMPREHENSIVE summary (aim for 1500-2500 words)
- Use markdown formatting extensively with headings (##, ###), bullet points, and bold text
- Structure with clear sections: Introduction, Main Concepts, Key Details, Examples, and Conclusion
- Include specific examples, numbers, and details from the document
- Explain relationships between concepts
- Highlight important terms with **bold**
- Use lists and sub-lists for better organization
- Make it educational and useful for studying`,
  user: (content: string) => `Please create a DETAILED and COMPREHENSIVE summary of the following document. This summary should be thorough enough to serve as a study guide.

Document content:
${content}

Create a well-structured summary in markdown format with:
1. **Introduction** - Overview of the document's purpose and scope
2. **Main Concepts** - Detailed explanation of key concepts with examples
3. **Key Details** - Important facts, figures, and specific information
4. **Practical Applications** - How the concepts can be applied
5. **Conclusion** - Summary of key takeaways

Use markdown formatting:
- ## for main sections
- ### for subsections
- **bold** for important terms
- - bullet points for lists
- > for important quotes or notes

Make the summary comprehensive and educational.`,
};

/**
 * Generate a glossary of terms
 */
export const GLOSSARY_PROMPT: PromptTemplate = {
  system: `You are an expert educator specializing in creating educational glossaries. Your task is to identify and define key terms and concepts from educational content.

Guidelines:
- Identify ALL important terms, concepts, jargon, and technical words
- Provide DETAILED definitions (2-3 sentences each)
- Include context and examples where helpful
- Prioritize terms that are central to understanding the material
- Include 20-40 terms for comprehensive coverage
- Return the glossary as a valid JSON array`,
  user: (content: string) => `Extract ALL key terms and concepts from the following document content. For each term, provide a detailed and informative definition that helps understanding.

Document content:
${content}

Return the glossary as a JSON array with the following format:
[{"term": "Term Name", "definition": "Detailed definition with context and examples if relevant"}]

Include 20-40 terms. Return ONLY the JSON array, no additional text.`,
};

/**
 * Generate flashcards
 */
export const FLASHCARDS_PROMPT: PromptTemplate = {
  system: `You are an expert educator specializing in creating effective flashcards for learning. Your task is to create flashcards that help students memorize and understand key concepts.

Guidelines:
- Create clear, focused questions on one side
- Provide DETAILED answers (1-3 sentences) on the other side
- Cover important concepts, definitions, and relationships
- Make questions specific enough to have clear answers
- Vary question types (definitions, explanations, comparisons, scenarios, etc.)
- Include context in answers when helpful
- Create 20-30 flashcards for comprehensive coverage
- Return flashcards as a valid JSON array`,
  user: (content: string, language?: string) => {
    const count = 25;
    return `Create ${count} flashcards from the following document content. Each flashcard should have a clear question or prompt on the front and a detailed, informative answer on the back.

Document content:
${content}

Return the flashcards as a JSON array with the following format:
[{"front": "Question or prompt", "back": "Detailed answer with explanation and context"}]

Create ${count} flashcards. Return ONLY the JSON array, no additional text.`;
  },
};

/**
 * Generate a quiz
 */
export const QUIZ_PROMPT: PromptTemplate = {
  system: `You are an expert educator specializing in creating educational quizzes. Your task is to create multiple-choice questions that test understanding of the material.

Guidelines:
- Create clear, unambiguous questions
- Provide 4 answer options for each question
- Make distractors plausible but clearly incorrect
- Vary question difficulty (easy, medium, hard)
- Cover different aspects of the material
- Return the quiz as a valid JSON array`,
  user: (content: string, language?: string) => {
    const count = 10;
    return `Create ${count} multiple-choice quiz questions from the following document content. Each question should have 4 options with one correct answer.

Document content:
${content}

Return the quiz as a JSON array with the following format:
[{"question": "The question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0}]

Where "correct" is the index (0-3) of the correct answer.
Return ONLY the JSON array, no additional text.`;
  },
};

/**
 * Generate concept explanations
 */
export const CONCEPTS_PROMPT: PromptTemplate = {
  system: `You are an expert educator specializing in concept mapping and explanation. Your task is to identify and explain key concepts and their relationships.

Guidelines:
- Identify major concepts and themes
- Provide clear explanations for each concept
- Show relationships between concepts
- Include related concepts for context
- Return concepts as a valid JSON array`,
  user: (content: string) => `Identify and explain the key concepts from the following document content. Show how they relate to each other.

Document content:
${content}

Return the concepts as a JSON array with the following format:
[{"name": "Concept Name", "description": "Explanation of the concept", "related": ["Related Concept 1", "Related Concept 2"]}]

Return ONLY the JSON array, no additional text.`,
};

/**
 * Combined generation prompt (for efficiency)
 */
export const COMBINED_PROMPT: PromptTemplate = {
  system: (language: string = 'English') => `You are an expert educator AI assistant. Your task is to generate COMPREHENSIVE and DETAILED learning materials from document content.

IMPORTANT - LANGUAGE REQUIREMENT:
- You MUST respond ONLY in ${language} language
- All content, including summaries, definitions, and quiz questions must be in ${language}

You will generate:
1. A DETAILED summary (1500-2500 words) in markdown format
2. A COMPREHENSIVE glossary (20-40 terms) with detailed definitions
3. Flashcards (20-30 cards) with detailed answers
4. A quiz (15-20 questions) to test understanding
5. Key concepts and their relationships

IMPORTANT:
- Make all content DETAILED and EDUCATIONAL
- Use markdown formatting in the summary (##, ###, **bold**, - lists)
- Provide context and examples in definitions
- Create varied and challenging quiz questions
- Return everything as a single JSON object`,
  user: (content: string) => `Generate COMPREHENSIVE learning materials from the following document content:

${content}

Return a JSON object with the following structure:
{
  "summary": "DETAILED summary in markdown format with ## headings, **bold** terms, and - bullet lists. Include Introduction, Main Concepts, Key Details, Practical Applications, and Conclusion sections. Aim for 1500-2500 words.",
  "glossary": [{"term": "Term", "definition": "Detailed definition with context (2-3 sentences)"}],
  "flashcards": [{"front": "Clear question or prompt", "back": "Detailed answer with explanation"}],
  "quiz": [{"question": "Question text", "options": ["A", "B", "C", "D"], "correct": 0}],
  "concepts": [{"name": "Concept", "description": "Detailed explanation", "related": ["Related Concept"]}]
}

Generate:
- 20-40 glossary terms
- 20-30 flashcards
- 15-20 quiz questions

Return ONLY the JSON object, no additional text.`,
};

/**
 * Parse JSON from AI response, handling potential formatting issues
 */
export function parseAIJsonResponse<T>(response: string): T {
  // Remove any markdown code blocks if present
  let cleaned = response.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();
  
  // Try parsing directly first
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.log('Direct JSON parse failed, attempting to fix...');
  }
  
  // Fix unescaped newlines in JSON string values
  // This regex finds string values and escapes control characters
  const fixed = fixJsonControlChars(cleaned);
  
  try {
    return JSON.parse(fixed) as T;
  } catch (e) {
    console.error('Failed to parse JSON after fixes:', e);
    console.error('Original response (first 1000 chars):', response.slice(0, 1000));
    throw new Error('Failed to parse AI response as JSON');
  }
}

/**
 * Fix control characters in JSON string values
 */
function fixJsonControlChars(json: string): string {
  let result = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }
    
    if (inString) {
      // Escape control characters within string values
      if (char === '\n') {
        result += '\\n';
      } else if (char === '\r') {
        result += '\\r';
      } else if (char === '\t') {
        result += '\\t';
      } else {
        result += char;
      }
    } else {
      result += char;
    }
  }
  
  return result;
}
