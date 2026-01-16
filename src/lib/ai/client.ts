"use client";

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerateRequest {
  prompt: string;
  context?: string;
  options?: AIGenerateOptions;
}

export interface AIGenerateResponse {
  content: string;
  success: boolean;
  error?: string;
}

/**
 * Client-side AI service that calls the server-side API
 */
export class AIClientService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api/ai";
  }

  /**
   * Generate AI content via server-side API
   */
  async generateContent(
    prompt: string,
    context?: string,
    options: AIGenerateOptions = {}
  ): Promise<string> {
    console.log("🌐 AI Client - generateContent called:", {
      prompt: prompt.substring(0, 200) + (prompt.length > 200 ? "..." : ""),
      promptLength: prompt.length,
      context: context,
      options: options,
    });

    try {
      const requestBody = {
        prompt,
        context,
        options,
      } as AIGenerateRequest;

      console.log(
        "🌐 AI Client - Sending request to /api/ai/generate:",
        requestBody
      );

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("🌐 AI Client - Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🌐 AI Client - Error response:", errorData);
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: AIGenerateResponse = await response.json();
      console.log("🌐 AI Client - Success response:", {
        success: data.success,
        contentLength: data.content?.length,
        contentPreview:
          data.content?.substring(0, 100) +
          (data.content?.length > 100 ? "..." : ""),
      });

      if (!data.success) {
        throw new Error(data.error || "AI generation failed");
      }

      return data.content;
    } catch (error) {
      console.error("AI client error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate AI content"
      );
    }
  }

  /**
   * Improve text using AI
   */
  async improveText(
    text: string,
    tone: string = "professional",
    style: string = "clear"
  ): Promise<string> {
    console.log("🤖 AI Client - improveText called:", {
      text: text,
      textLength: text.length,
      tone: tone,
      style: style,
    });

    const prompt = `Please improve the following text to be more ${tone} and ${style}. Keep the same meaning but enhance clarity, flow, and impact. Return only the improved text without any explanations or additional commentary.

Text to improve:
${text}

Improved text:`;
    console.log("🤖 AI Client - Generated prompt:", prompt);

    return this.generateContent(prompt);
  }

  /**
   * Summarize text using AI
   */
  async summarizeText(
    text: string,
    length: "short" | "medium" | "long" = "medium"
  ): Promise<string> {
    const lengthInstructions = {
      short: "in 1-2 sentences",
      medium: "in 3-4 sentences",
      long: "in 1-2 paragraphs",
    };

    const prompt = `Please summarize the following text ${lengthInstructions[length]}. Return only the summary without any explanations.

Text to summarize:
${text}

Summary:`;
    return this.generateContent(prompt);
  }

  /**
   * Translate text using AI
   */
  async translateText(text: string, targetLanguage: string): Promise<string> {
    const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;
    return this.generateContent(prompt);
  }

  /**
   * Continue writing using AI
   */
  async continueWriting(
    context: string,
    tone: string = "consistent",
    length: number = 200
  ): Promise<string> {
    const prompt = `Continue writing the following text in a ${tone} tone. Write approximately ${length} words that naturally flow from the existing content:\n\n${context}`;
    return this.generateContent(prompt);
  }

  /**
   * Fix grammar using AI
   */
  async fixGrammar(text: string): Promise<string> {
    const prompt = `Please fix any grammar, spelling, and punctuation errors in the following text. Keep the same meaning and style. Return only the corrected text without any explanations.

Text to fix:
${text}

Corrected text:`;
    return this.generateContent(prompt);
  }

  /**
   * Change tone using AI
   */
  async changeTone(
    text: string,
    tone: "professional" | "casual" | "friendly" | "formal" | "creative"
  ): Promise<string> {
    const prompt = `Rewrite the following text in a ${tone} tone while keeping the same meaning:\n\n${text}`;
    return this.generateContent(prompt);
  }

  /**
   * Expand text using AI
   */
  async expandText(text: string, focus?: string): Promise<string> {
    const focusInstruction = focus ? ` Focus particularly on ${focus}.` : "";
    const prompt = `Expand the following text with more details, examples, and explanations.${focusInstruction}\n\n${text}`;
    return this.generateContent(prompt);
  }

  /**
   * Make text concise using AI
   */
  async makeTextConcise(text: string): Promise<string> {
    const prompt = `Make the following text more concise while keeping all important information and meaning:\n\n${text}`;
    return this.generateContent(prompt);
  }
}

// Default AI client instance
export const aiClient = new AIClientService();
