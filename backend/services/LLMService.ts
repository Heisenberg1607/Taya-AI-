import OpenAI from "openai";
import {
  memorySchema,
  buildMemoryPrompt,
} from "@/backend/prompts/memoryPrompt";
import {
  sanitizeMemoryJson,
  type MemoryJson,
} from "@/backend/validator/memoryJson";

/**
 * Unified LLM service for all OpenAI API interactions
 * Handles both audio transcription and text structuring
 */
export class LLMService {
  private static instance: LLMService | null = null;
  private openai: OpenAI;

  private constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Gets the singleton instance of LLMService
   */
  static getInstance(): LLMService {
    if (!this.instance) {
      this.instance = new LLMService();
    }
    return this.instance;
  }

  /**
   * Transcribes audio file to text using Whisper model
   */
  async transcribeAudio(file: File): Promise<string> {
    const transcription = await this.openai.audio.transcriptions.create({
      model: "whisper-1",
      file,
    });

    const text = (transcription.text || "").trim();
    if (!text) {
      throw new Error("Transcription returned empty text");
    }

    return text;
  }

  /**
   * Structures a transcript into a memory object using GPT
   */
  async structureMemory(transcript: string): Promise<MemoryJson> {
    const response = await this.openai.responses.create({
      model: "gpt-4.1-nano-2025-04-14",
      input: buildMemoryPrompt(transcript),
      text: { format: memorySchema },
    });

    const raw = (response.output_text || "").trim();
    if (!raw) {
      throw new Error("LLM returned empty output");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw) as unknown;
    } catch {
      throw new Error("LLM returned non-JSON response");
    }

    const structured = sanitizeMemoryJson(parsed);
    if (!structured) {
      throw new Error("LLM JSON response has invalid shape");
    }

    return structured;
  }

  /**
   * Processes audio: transcribes and structures in one call
   */
  async processAudioToMemory(file: File): Promise<{
    transcript: string;
    memory: MemoryJson;
  }> {
    const transcript = await this.transcribeAudio(file);
    const memory = await this.structureMemory(transcript);
    return { transcript, memory };
  }

  /**
   * Generic text completion (for future extensibility)
   */
  async complete(
    prompt: string,
    model: string = "gpt-4.1-nano-2025-04-14"
  ): Promise<string> {
    const response = await this.openai.responses.create({
      model,
      input: prompt,
    });

    return (response.output_text || "").trim();
  }
}

// Convenience exports for backward compatibility
export async function transcribeWithWhisper(file: File): Promise<string> {
  return LLMService.getInstance().transcribeAudio(file);
}

export async function structureMemory(transcript: string): Promise<MemoryJson> {
  return LLMService.getInstance().structureMemory(transcript);
}
