import { Request, Response } from 'express';
import Conversation from '../models/conversation.model';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
  user?: { _id: mongoose.Types.ObjectId };
}

export const createConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title } = req.body;
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const conversation = new Conversation({
      title,
      userId,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error });
  }
};

export const getUserConversations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};

export const addMessageToConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { content, role, model } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    conversation.messages.push({
      content,
      role,
      model,
      timestamp: new Date()
    });
    conversation.updatedAt = new Date();
    
    await conversation.save();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error adding message', error });
  }
};

export const getConversation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation', error });
  }
};