import mongoose, { Schema, Document } from 'mongoose';

interface IMessage {
  content: string;
  role: 'user' | 'assistant';
  model: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  title: string;
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  model: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new Schema<IConversation>({
  title: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IConversation>('Conversation', conversationSchema);