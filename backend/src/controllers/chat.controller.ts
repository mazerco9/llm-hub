import { Request, Response } from 'express';
import { claudeService } from '../services/claude.service';
import ConversationModel from '../models/conversation.model';
import mongoose from 'mongoose';

// Extension du type Request pour inclure l'utilisateur
interface AuthRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

export const chatController = {
  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { message } = req.body;
      if (!req.user?._id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Appeler l'API Claude
      const messages = [
        {
          role: 'user' as const,
          content: message
        }
      ];

      const response = await claudeService.sendMessage(messages);

      // Créer ou mettre à jour la conversation
      await ConversationModel.create({
        title: `Conversation ${new Date().toLocaleString()}`, // Titre par défaut
        userId: req.user._id,
        messages: [
          { 
            role: 'user', 
            content: message,
            model: 'user',
            timestamp: new Date()
          },
          { 
            role: 'assistant', 
            content: response.text,
            model: 'claude',
            timestamp: new Date()
          }
        ]
      });

      return res.json(response);
    } catch (error) {
      console.error('Error in chat controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user?._id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const conversations = await ConversationModel.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(10);

      return res.json(conversations);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
};