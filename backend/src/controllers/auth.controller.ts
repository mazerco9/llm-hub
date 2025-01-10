import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

// Extension du type Request pour inclure l'utilisateur
interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const authController = {
  // Inscription d'un nouvel utilisateur
  async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Vérification si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Création du nouvel utilisateur
      const user = new User({
        email: email.toLowerCase(),
        password,
      });

      await user.save();

      // Génération du token JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // Réponse sans le mot de passe
      const userResponse = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error during registration' });
    }
  },

  // Connexion d'un utilisateur
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Recherche de l'utilisateur
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Vérification du mot de passe
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Génération du token JWT
      const token = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });

      // Réponse sans le mot de passe
      const userResponse = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };

      res.json({
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error during login' });
    }
  },

  // Récupération du profil utilisateur
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Envoi des informations sans le mot de passe
      const userResponse = {
        id: user.id,
        email: user.email,
        apiKeys: user.apiKeys,
        createdAt: user.createdAt,
      };

      res.json({ user: userResponse });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  },
};