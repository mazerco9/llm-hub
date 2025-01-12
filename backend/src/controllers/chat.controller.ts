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
      console.log('=== Début de sendMessage ===');
      console.log('Headers reçus:', JSON.stringify(req.headers, null, 2));
      console.log('Body reçu:', JSON.stringify(req.body, null, 2));

      const { message } = req.body;
      console.log('Message extrait:', message);

      if (!message) {
        console.log('❌ Message manquant dans la requête');
        return res.status(400).json({
          error: 'Message is required',
          details: 'No message found in request body'
        });
      }

      // Vérification du user
      console.log('User dans la requête:', JSON.stringify(req.user, null, 2));
      if (!req.user?._id) {
        console.log('❌ Utilisateur non authentifié');
        return res.status(401).json({ 
          error: 'User not authenticated',
          details: 'No user ID found in request'
        });
      }
      console.log('✅ Utilisateur authentifié:', req.user._id);

      // Appel à Claude
      console.log('🔄 Préparation appel Claude avec message:', message);
      const messages = [{ role: 'user' as const, content: message }];
      
      try {
        console.log('🚀 Envoi à Claude...');
        console.log('Messages envoyés:', JSON.stringify(messages, null, 2));
        
        const claudeResponse = await claudeService.sendMessage(messages);
        console.log('✅ Réponse de Claude reçue:', JSON.stringify(claudeResponse, null, 2));
        return res.json(claudeResponse);
      } catch (rawError) {
        const error = rawError as ApiError;
        console.error('❌ Erreur Claude API:', error);
        console.error('Stack trace:', error.stack);
        console.error('Message complet erreur:', error.message);
        return res.status(500).json({ 
          error: 'Failed to get response from Claude',
          details: error.message || 'Unknown error'
        });
      }
    } catch (rawError) {
      const error = rawError as ApiError;
      console.error('❌ Erreur générale dans sendMessage:', error);
      console.error('Stack trace:', error.stack);
      return res.status(500).json({ 
        error: 'Internal server error',
        details: error.message || 'Unknown error'
      });
    } finally {
      console.log('=== Fin de sendMessage ===');
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