import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface définissant la structure d'un utilisateur
export interface IUser extends Document {
  email: string;
  password: string;
  apiKeys?: {
    openai?: string;
    anthropic?: string;
    grok?: string;
    deepseek?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schéma MongoDB pour les utilisateurs
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    apiKeys: {
      openai: { type: String },
      anthropic: { type: String },
      grok: { type: String },
      deepseek: { type: String },
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// Middleware pour hasher le mot de passe avant sauvegarde
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthode pour comparer le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export du modèle
export const User = mongoose.model<IUser>('User', UserSchema);