import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authController } from '../controllers/auth.controller';
import { IUser } from '../models/user.model';

const router = express.Router();

// Interface pour étendre la requête avec l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

// Wrappers pour gérer les erreurs async
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Route d'inscription
router.post('/register', asyncHandler(authController.register));

// Route de connexion
router.post('/login', asyncHandler(authController.login));

// Route de profil (protégée)
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  asyncHandler(authController.getProfile)
);

export default router;