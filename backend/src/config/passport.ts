import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User, IUser } from '../models/user.model';

// Type pour la fonction done
type DoneCallback = (error: any, user?: any, options?: { message: string }) => void;

// Configuration de la stratégie locale (email + mot de passe)
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done: DoneCallback) => {
      try {
        // Recherche de l'utilisateur
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Utilisateur non trouvé
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Vérification du mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        
        // Authentification réussie
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Configuration de la stratégie JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (jwtPayload: { id: string }, done: DoneCallback) => {
      try {
        // Vérification de l'existence de l'utilisateur
        const user = await User.findById(jwtPayload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Sérialisation pour les sessions (optionnel si on utilise uniquement JWT)
passport.serializeUser((user: any, done: DoneCallback) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: DoneCallback) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;