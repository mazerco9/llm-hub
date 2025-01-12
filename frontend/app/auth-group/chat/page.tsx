"use client";

import { useEffect, useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { io, Socket } from 'socket.io-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isComplete?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Pas de token trouvé');
      return;
    }

    console.log('Initialisation de Socket.IO...');
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000', {
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
          return [...prev, {
            role: 'assistant',
            content: data.content,
            timestamp: new Date(),
            isComplete: false
          }];
        }
      });
    });

    socketInstance.on('message-complete', () => {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && !lastMessage.isComplete) {
          lastMessage.isComplete = true;
        }
        return newMessages;
      });
      setIsLoading(false);
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
    if (!inputMessage.trim() || isLoading || !socket) return;

    const newMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      isComplete: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    socket.emit('send-message', inputMessage.trim());
  };

  return (
    <div className="flex flex-col h-full p-4">
      <Card className="flex flex-col h-full">
        {/* Messages container */}
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

        {/* Input form */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}