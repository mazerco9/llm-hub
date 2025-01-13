import { Router, Request, Response, NextFunction } from 'express';
import * as ConversationController from '../controllers/conversation.controller';
import passport from 'passport';
import mongoose from 'mongoose';

// Interface pour étendre Request avec le user authentifié
interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
  };
}

const router = Router();

// Protection de toutes les routes avec authentification
router.use(passport.authenticate('jwt', { session: false }));

// Routes
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ConversationController.createConversation(req as AuthenticatedRequest, res);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ConversationController.getUserConversations(req as AuthenticatedRequest, res);
  } catch (error) {
    next(error);
  }
});

router.get('/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ConversationController.getConversation(req as AuthenticatedRequest, res);
  } catch (error) {
    next(error);
  }
});

router.put('/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ConversationController.updateConversation(req as AuthenticatedRequest, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ConversationController.deleteConversation(req as AuthenticatedRequest, res);
  } catch (error) {
    next(error);
  }
});

router.post('/:conversationId/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ConversationController.addMessageToConversation(req as AuthenticatedRequest, res);
  } catch (error) {
    next(error);
  }
});

export default router;