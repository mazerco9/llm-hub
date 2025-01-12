import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Conversation {
  _id: string;
  title: string;
  updatedAt: string;
}

interface ConversationListProps {
  onSelect: (id: string) => void;
  activeId?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ onSelect, activeId }) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://llm-hub-backend.onrender.com/api';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    console.log("Using API URL:", API_URL);
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      const newConversation = await response.json();
      setConversations([...conversations, newConversation]);
      onSelect(newConversation._id);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="w-64 h-full border-r border-gray-200 p-4">
      <Button
        onClick={createNewConversation}
        className="w-full mb-4"
      >
        New Chat
      </Button>
      
      <div className="space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-500 text-sm p-4">
            Aucune conversation
            <br />
            Cliquez sur "New Chat" pour commencer
          </div>
        ) : (
          conversations.map((conv) => (
            <Card
              key={conv._id}
              className={`p-3 cursor-pointer hover:bg-gray-100 ${
                activeId === conv._id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onSelect(conv._id)}
            >
              <h3 className="text-sm font-medium truncate">
                {conv.title || 'New Conversation'}
              </h3>
              <p className="text-xs text-gray-500 truncate">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;