import { Router, Request, Response } from 'express';
import { chatController } from '../controllers/chat.controller';
import passport from 'passport';
import mongoose from 'mongoose';

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

const router = Router();

// Middleware d'authentification
const auth = passport.authenticate('jwt', { session: false });

// Helper pour gérer la promesse et le typage
const asyncHandler = (fn: (req: AuthenticatedRequest, res: Response) => Promise<any>) => 
  (req: Request, res: Response) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res)).catch((error) => {
      console.error('Route error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  };

// Routes avec gestion des types
router.post('/', auth, asyncHandler(chatController.sendMessage));

export const chatRoutes = router;