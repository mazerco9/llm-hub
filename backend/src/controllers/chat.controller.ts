import { Request, Response } from 'express';
import { claudeService } from '../services/claude.service';
import mongoose from 'mongoose';

// Interface pour les erreurs typées
interface ApiError {
  message: string;
  stack?: string;
}

interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

export const chatController = {
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      console.log('Début de sendMessage');
      const { message } = req.body;
      console.log('Message reçu:', message);

      // Appel à Claude
      console.log('Appel du service Claude avec le message:', message);
      const messages = [{ role: 'user' as const, content: message }];
      
      try {
        console.log('En attente de la réponse de Claude...');
        const claudeResponse = await claudeService.sendMessage(messages);
        console.log('Réponse brute de Claude:', claudeResponse);
        return res.json(claudeResponse);
      } catch (rawError) {
        const error = rawError as ApiError;
        console.error('Erreur détaillée Claude API:', error);
        console.error('Stack trace:', error.stack);
        return res.status(500).json({ 
          error: 'Failed to get response from Claude',
          details: error.message || 'Unknown error'
        });
      }
    } catch (rawError) {
      const error = rawError as ApiError;
      console.error('Erreur générale dans sendMessage:', error);
      console.error('Stack trace:', error.stack);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      });
    }
  },

  async getHistory(req: AuthRequest, res: Response) {
    try {
      console.log('Récupération de l\'historique');
      return res.json([]);
    } catch (rawError) {
      const error = rawError as ApiError;
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return res.status(500).json({ 
        error: 'Failed to get chat history',
        details: error.message || 'Unknown error'
      });
    }
  }
};