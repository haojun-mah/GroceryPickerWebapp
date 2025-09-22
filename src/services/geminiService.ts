import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Interface for structured input
export interface GeminiStructuredInput {
  prompt: string;
  context?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  schema?: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// Interface for structured output
export interface GeminiStructuredOutput<T = any> {
  success: boolean;
  data?: T;
  rawResponse?: string;
  error?: string;
  tokensUsed?: number;
}

// Main service class
export class GeminiService {
  private model: any;

  constructor(modelName: string = 'gemini-2.5-flash') {
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  /**
   * Make a structured call to Gemini AI
   * @param input - Structured input with prompt, context, and configuration
   * @returns Promise<GeminiStructuredOutput> - Structured response
   */
  async callStructured<T = any>(input: GeminiStructuredInput): Promise<GeminiStructuredOutput<T>> {
    try {
      // Validate input
      if (!input.prompt || input.prompt.trim().length === 0) {
        return {
          success: false,
          error: 'Prompt is required and cannot be empty'
        };
      }

      // Build the full prompt
      let fullPrompt = '';
      
      if (input.systemInstruction) {
        fullPrompt += `System: ${input.systemInstruction}\n\n`;
      }
      
      if (input.context) {
        fullPrompt += `Context: ${input.context}\n\n`;
      }
      
      fullPrompt += `User: ${input.prompt}`;
      
      // Add schema instruction if provided
      if (input.schema) {
        fullPrompt += `\n\nPlease respond with valid JSON that matches this schema:\n${JSON.stringify(input.schema, null, 2)}`;
      }

      // Generate content
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: input.temperature || 0.7,
          maxOutputTokens: input.maxTokens || 1000,
        }
      });

      const response = await result.response;
      const text = response.text();

      // Try to parse JSON if schema is provided
      if (input.schema) {
        try {
          // Log the raw response for debugging
          console.log(`[GEMINI SERVICE] Raw response text (length: ${text.length}):`, text);
          
          // Clean the response text - remove any markdown formatting or extra text
          let cleanText = text.trim();
          
          // Remove markdown code blocks if present
          if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          
          // Find JSON object boundaries
          const jsonStart = cleanText.indexOf('{');
          const jsonEnd = cleanText.lastIndexOf('}');
          
          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
          }
          
          console.log(`[GEMINI SERVICE] Cleaned text for parsing:`, cleanText);
          
          const parsedData = JSON.parse(cleanText);
          console.log(`[GEMINI SERVICE] Successfully parsed JSON:`, parsedData);
          
          return {
            success: true,
            data: parsedData as T,
            rawResponse: text,
            tokensUsed: response.usageMetadata?.totalTokenCount
          };
        } catch (parseError) {
          console.error(`[GEMINI SERVICE] JSON parsing failed:`, parseError);
          console.error(`[GEMINI SERVICE] Raw response that failed to parse:`, text);
          console.error(`[GEMINI SERVICE] Response length:`, text.length);
          console.error(`[GEMINI SERVICE] Parse error details:`, parseError);
          
          return {
            success: false,
            error: `Failed to parse JSON response: ${parseError}`,
            rawResponse: text
          };
        }
      }

      // Return raw text response if no schema
      return {
        success: true,
        data: text as T,
        rawResponse: text,
        tokensUsed: response.usageMetadata?.totalTokenCount
      };

    } catch (error: any) {
      console.error('Gemini API call failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        rawResponse: undefined
      };
    }
  }

  /**
   * Convenience method for JSON-structured responses
   * @param prompt - The main prompt
   * @param schema - Expected JSON schema
   * @param options - Additional options
   */
  async callForJSON<T = any>(
    prompt: string, 
    schema: GeminiStructuredInput['schema'],
    options: Partial<GeminiStructuredInput> = {}
  ): Promise<GeminiStructuredOutput<T>> {
    return this.callStructured<T>({
      prompt,
      schema,
      ...options
    });
  }

  /**
   * Convenience method for simple text responses
   * @param prompt - The main prompt
   * @param options - Additional options
   */
  async callForText(
    prompt: string,
    options: Partial<GeminiStructuredInput> = {}
  ): Promise<GeminiStructuredOutput<string>> {
    return this.callStructured<string>({
      prompt,
      ...options
    });
  }
}

// Export a default instance
export const geminiService = new GeminiService();

// Export utility functions
export const createGeminiService = (modelName?: string) => new GeminiService(modelName);

// Common schemas for grocery-related tasks
export const GrocerySchemas = {
  PRODUCT_ANALYSIS: {
    type: 'object' as const,
    properties: {
      productName: { type: 'string', description: 'Standardized product name' },
      category: { type: 'string', description: 'Product category' },
      brand: { type: 'string', description: 'Brand name if identifiable' },
      size: { type: 'string', description: 'Product size or quantity' },
      keywords: { 
        type: 'array', 
        items: { type: 'string' },
        description: 'Search keywords for this product'
      }
    },
    required: ['productName', 'category']
  },
  
  SHOPPING_SUGGESTIONS: {
    type: 'object' as const,
    properties: {
      suggestions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            item: { type: 'string' },
            reason: { type: 'string' },
            priority: { type: 'number', minimum: 1, maximum: 5 }
          }
        }
      },
      totalEstimatedCost: { type: 'number' }
    },
    required: ['suggestions']
  },
  
  PRICE_COMPARISON: {
    type: 'object' as const,
    properties: {
      analysis: { type: 'string', description: 'Analysis of price differences' },
      recommendation: { type: 'string', description: 'Best value recommendation' },
      savings: { type: 'number', description: 'Potential savings amount' },
      factors: {
        type: 'array',
        items: { type: 'string' },
        description: 'Factors considered in comparison'
      }
    },
    required: ['analysis', 'recommendation']
  }
};

export default geminiService;