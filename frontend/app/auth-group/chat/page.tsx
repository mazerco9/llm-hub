"use client";

import { useEffect, useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { io, Socket } from 'socket.io-client';
import ConversationList from '@/components/ConversationList';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isComplete?: boolean;
}

export default function ChatPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://llm-hub-backend.onrender.com';
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to load conversation');
      const data = await response.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setMessages([]);
    }
  };

  const handleConversationSelect = async (conversationId: string) => {
    setActiveConversationId(conversationId);
    await loadConversationMessages(conversationId);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Pas de token trouvé');
      return;
    }

    console.log('Initialisation de Socket.IO...');
    const socketInstance = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketInstance.on('connect', () => {
      console.log('Connecté à Socket.IO');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Erreur de connexion Socket.IO:', error.message);
    });

    socketInstance.on('message-chunk', (data: { content: string }) => {
      console.log('Reçu chunk:', data.content);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.isComplete) {
          lastMessage.content += data.content;
          return newMessages;
        } else {
          const newMessage: Message = {
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
            isComplete: false
          };
          return [...newMessages, newMessage];
        }
      });
    });

    socketInstance.on('message-complete', async () => {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && !lastMessage.isComplete) {
          lastMessage.isComplete = true;
        }
        return newMessages;
      });
      setIsLoading(false);

      if (activeConversationId && messages.length > 0) {
        try {
          await fetch(`${API_URL}/api/conversations/${activeConversationId}/messages`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
              }))
            }),
          });
        } catch (err) {
          console.error('Error saving conversation:', err);
        }
      }
    });

    socketInstance.on('stream-error', (error) => {
      console.error('Erreur streaming:', error);
      setIsLoading(false);
    });

    setSocket(socketInstance);

    return () => {
      console.log('Nettoyage de la connexion Socket.IO');
      socketInstance.disconnect();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !socket || !activeConversationId) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      isComplete: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      await fetch(`${API_URL}/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: {
            role: newMessage.role,
            content: newMessage.content
          }
        }),
      });

      socket.emit('send-message', {
        conversationId: activeConversationId,
        message: inputMessage.trim()
      });
    } catch (err) {
      console.error('Error saving message:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ConversationList 
        onSelect={handleConversationSelect}
        activeId={activeConversationId || undefined}
      />
      
      <div className="flex-1 p-4">
        <Card className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={activeConversationId ? "Écrivez votre message..." : "Sélectionnez une conversation..."}
                disabled={isLoading || !activeConversationId}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !activeConversationId}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}