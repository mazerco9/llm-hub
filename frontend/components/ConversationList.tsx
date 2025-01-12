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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to fetch conversations');
      
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Conversation' }),
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      
      const newConversation: Conversation = await response.json();
      setConversations([...conversations, newConversation]);
      onSelect(newConversation._id);
    } catch (err) {
      setError('Failed to create new conversation');
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="w-64 h-full border-r border-gray-200 p-4">
      <Button
        onClick={createNewConversation}
        className="w-full mb-4"
      >
        New Chat
      </Button>
      
      <div className="space-y-2">
        {conversations.map((conv) => (
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
        ))}
      </div>
    </div>
  );
};

export default ConversationList;