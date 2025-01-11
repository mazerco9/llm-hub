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

interface ApiError {
  message: string;
  stack?: string;
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
      console.log('Tentative d\'envoi à Claude avec:', {
        model: "claude-3-sonnet-20240229",
        messages: messages
      });
      
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: messages,
      });

      console.log('Réponse brute de Claude:', response);
      
      // Vérification et extraction du texte de la réponse
      const content = response.content[0];
      console.log('Premier bloc de contenu:', content);
      
      if ('text' in content) {
        const result = {
          text: content.text,
          usage: {
            prompt_tokens: response.usage.input_tokens,
            completion_tokens: response.usage.output_tokens,
            total_tokens: response.usage.input_tokens + response.usage.output_tokens
          }
        };
        console.log('Réponse formatée:', result);
        return result;
      } else {
        throw new Error('Unexpected response format from Claude');
      }
    } catch (rawError) {
      const error = rawError as ApiError;
      console.error('Erreur détaillée Claude API:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }
}

export const claudeService = new ClaudeService();