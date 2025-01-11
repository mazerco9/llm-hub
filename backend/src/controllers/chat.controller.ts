import { Request, Response } from 'express';
import { claudeService } from '../services/claude.service';
import mongoose from 'mongoose';

// Interface pour les erreurs typées
interface ApiError extends Error {
  message: string;
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
      console.log('Appel du service Claude');
      const messages = [{ role: 'user' as const, content: message }];
      
      try {
        const claudeResponse = await claudeService.sendMessage(messages);
        console.log('Réponse de Claude reçue:', claudeResponse);
        return res.json(claudeResponse);
      } catch (error) {
        const claudeError = error as ApiError;
        console.error('Erreur Claude API:', claudeError);
        return res.status(500).json({ 
          error: 'Failed to get response from Claude',
          details: claudeError.message || 'Unknown error'
        });
      }
    } catch (error) {
      const generalError = error as ApiError;
      console.error('Erreur générale dans sendMessage:', generalError);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: generalError.message || 'Unknown error'
      });
    }
  },

  // Ajout de la méthode getHistory
  async getHistory(req: AuthRequest, res: Response) {
    try {
      console.log('Récupération de l\'historique');
      // Pour l'instant, retournons un tableau vide
      // Nous implémenterons la vraie fonctionnalité plus tard
      return res.json([]);
    } catch (error) {
      const historyError = error as ApiError;
      console.error('Erreur lors de la récupération de l\'historique:', historyError);
      return res.status(500).json({ 
        error: 'Failed to get chat history',
        details: historyError.message || 'Unknown error'
      });
    }
  }
};