import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import winston from 'winston';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import config from './config/environment';
import authRoutes from './routes/auth.routes';
import passport from './config/passport';
import conversationRoutes from './routes/conversation.routes';
import { chatRoutes } from './routes/chat.routes';
import { chatController } from './controllers/chat.controller';

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
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware d'authentification Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    logger.error('Tentative de connexion Socket.IO sans token');
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.data.user = decoded;
    logger.info('Client Socket.IO authentifié:', decoded);
    next();
  } catch (error) {
    logger.error('Erreur authentification Socket.IO:', error);
    next(new Error('Invalid authentication'));
  }
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  logger.info('Nouveau client connecté', {
    userId: socket.data.user?._id
  });
  
  socket.on('send-message', (messageData: { conversationId: string, message: string }) => {
    logger.info('Message reçu pour streaming', {
      userId: socket.data.user?._id,
      messageLength: messageData.message.length
    });
    chatController.handleStreamMessage(socket, messageData);
  });

  socket.on('disconnect', () => {
    logger.info('Client déconnecté', {
      userId: socket.data.user?._id
    });
  });
});

// Middleware de logging pour toutes les requêtes
app.use((req, res, next) => {
  logger.info('=== Requête entrante ===', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query
  });
  next();
});

// Middleware CORS et JSON
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialisation de Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/chat', chatRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: config.server.nodeEnv });
});

// Gestion des erreurs globale
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Erreur serveur:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
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

export default app;