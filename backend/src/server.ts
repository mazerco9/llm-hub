import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import winston from 'winston';
import dotenv from 'dotenv';
import config from './config/environment';
import authRoutes from './routes/auth.routes';
import passport from './config/passport';
import conversationRoutes from './routes/conversation.routes';
import { chatRoutes } from './routes/chat.routes';

// Chargement des variables d'environnement
dotenv.config();

// Configuration du logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialisation de l'application Express
const app = express();
const httpServer = createServer(app);

// Configuration de Socket.IO
const io = new SocketServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: config.cors.origin
}));
app.use(express.json());

// Routes de base pour la santé de l'application
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: config.server.nodeEnv });
});

// Gestion des erreurs globale
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ 
    error: 'Une erreur interne est survenue',
    message: config.server.nodeEnv === 'development' ? err.message : undefined
  });
});

// Connexion à MongoDB
mongoose.connect(config.database.uri)
  .then(() => {
    logger.info('Connecté à MongoDB');
    
    // Démarrage du serveur
    httpServer.listen(config.server.port, () => {
      logger.info(`Serveur démarré sur le port ${config.server.port}`);
      logger.info(`Mode: ${config.server.nodeEnv}`);
    });
  })
  .catch((error) => {
    logger.error('Erreur de connexion à MongoDB:', error);
    process.exit(1);
  });

// Gestion de Socket.IO
io.on('connection', (socket) => {
  logger.info('Nouveau client connecté');
  
  socket.on('disconnect', () => {
    logger.info('Client déconnecté');
  });
});

// Gestion des signaux d'arrêt
process.on('SIGTERM', async () => {
  logger.info('SIGTERM reçu. Arrêt gracieux...');
  
  try {
    await httpServer.close();
    await mongoose.connection.close();
    logger.info('Serveur arrêté');
    process.exit(0);
  } catch (error) {
    logger.error('Erreur lors de l\'arrêt du serveur:', error);
    process.exit(1);
  }
});

// Initialisation de Passport
app.use(passport.initialize());

// Routes d'authentification
app.use('/api/auth', authRoutes);

app.use('/api/conversations', conversationRoutes);

app.use('/api/chat', chatRoutes);

export default app;