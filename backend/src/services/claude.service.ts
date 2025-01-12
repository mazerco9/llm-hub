import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/environment';
import { EventEmitter } from 'events';
import { MessageStreamEvent } from '@anthropic-ai/sdk/resources/messages';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages/messages';

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

  async streamMessage(messages: Message[] | string): Promise<EventEmitter> {
    const emitter = new EventEmitter();
    
    try {
      console.log('Démarrage du streaming avec Claude...');
      
      // Si messages est une string, créer un message formaté correctement
      const formattedMessages: MessageParam[] = typeof messages === 'string' 
        ? [{ role: 'user', content: messages }] 
        : messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })) as MessageParam[];

      const stream = await this.client.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1024,
        messages: formattedMessages,
        stream: true,
      });

      // Traitement du stream
      (async () => {
        try {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              console.log('Chunk reçu:', chunk.delta.text);
              emitter.emit('data', chunk.delta.text);
            }
          }
          console.log('Stream terminé');
          emitter.emit('end');
        } catch (error) {
          console.error('Erreur pendant le streaming:', error);
          emitter.emit('error', error);
        }
      })();

    } catch (error) {
      console.error('Erreur lors de l\'initialisation du stream:', error);
      emitter.emit('error', error);
    }

    return emitter;
  }

  async sendMessage(messages: Message[]): Promise<ClaudeResponse> {
    try {
      const formattedMessages: MessageParam[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })) as MessageParam[];

      console.log('Tentative d\'envoi à Claude avec:', {
        model: "claude-3-sonnet-20240229",
        messages: formattedMessages
      });
      
      const response = await this.client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: formattedMessages,
      });

      console.log('Réponse brute de Claude:', response);
      
      const content = response.content[0];
      console.log('Premier bloc de contenu:', content);
      
      if (content.type === 'text') {
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