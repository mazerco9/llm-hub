import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, X, Check } from 'lucide-react';

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://llm-hub-backend.onrender.com';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    console.log("Using API URL:", API_URL);
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
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
      const response = await fetch(`${API_URL}/api/conversations`, {
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

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation._id);
    setNewTitle(conversation.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewTitle('');
  };

  const saveTitle = async (conversationId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) throw new Error('Failed to update conversation');

      const updatedConversation = await response.json();
      setConversations(conversations.map(conv => 
        conv._id === conversationId ? updatedConversation : conv
      ));
      setEditingId(null);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      setConversations(conversations.filter(conv => conv._id !== conversationId));
      if (activeId === conversationId) {
        onSelect('');
      }
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
              className={`p-3 ${activeId === conv._id ? 'bg-gray-100' : ''}`}
            >
              <div className="flex items-center justify-between">
                {editingId === conv._id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <button onClick={() => saveTitle(conv._id)} className="p-1">
                      <Check className="h-4 w-4 text-green-500" />
                    </button>
                    <button onClick={cancelEditing} className="p-1">
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onSelect(conv._id)}
                    >
                      <h3 className="text-sm font-medium truncate">
                        {conv.title || 'New Conversation'}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(conv);
                        }}
                        className="p-1"
                      >
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv._id);
                        }}
                        className="p-1"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;