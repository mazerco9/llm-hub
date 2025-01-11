import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeResponse {
  text: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.llm.CLAUDE_API_KEY
    });
  }

  async sendMessage(messages: Message[]): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: messages,
      });

      // Vérification et extraction du texte de la réponse
      const content = response.content[0];
      if ('text' in content) {
        return {
          text: content.text,
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens
          }
        };
      } else {
        throw new Error('Unexpected response format from Claude');
      }
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to get response from Claude');
    }
  }
}

export const claudeService = new ClaudeService();