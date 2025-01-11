import axios from 'axios';
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
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = config.llm.CLAUDE_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async sendMessage(messages: Message[]): Promise<ClaudeResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: "claude-3-opus-20240229",
          messages: messages,
          max_tokens: 1024,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );

      return {
        text: response.data.content[0].text,
        usage: {
          prompt_tokens: response.data.usage.input_tokens,
          completion_tokens: response.data.usage.output_tokens,
          total_tokens: response.data.usage.input_tokens + response.data.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to get response from Claude');
    }
  }
}

export const claudeService = new ClaudeService();