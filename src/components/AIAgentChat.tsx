import React, { useState } from 'react';
import { DoctorDirectoryAI, type AIAgentResponse } from '../utils/aiAgent';

interface AIAgentChatProps {
  onResults: (response: AIAgentResponse) => void;
}

export const AIAgentChat: React.FC<AIAgentChatProps> = ({ onResults }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    type: 'user' | 'ai';
    message: string;
    timestamp: Date;
  }>>([
    {
      type: 'ai',
      message: DoctorDirectoryAI.generateHelpfulResponse(),
      timestamp: new Date()
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage = query.trim();
    setQuery('');
    setIsLoading(true);

    // Add user message to chat
    setChatHistory(prev => [...prev, {
      type: 'user',
      message: userMessage,
      timestamp: new Date()
    }]);

    try {
      const response = await DoctorDirectoryAI.processQuery(userMessage);
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        type: 'ai',
        message: response.message,
        timestamp: new Date()
      }]);

      // Send results to parent component
      onResults(response);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        type: 'ai',
        message: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-agent-chat">
      <div className="chat-header">
        <h2>🤖 Doctor Directory AI Assistant</h2>
        <p>Ask me about doctors, offices, or medical specialties in the building</p>
      </div>

      <div className="chat-messages">
        {chatHistory.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              <div className="message-text">{message.message}</div>
              <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai-message">
            <div className="message-content">
              <div className="message-text">🤔 Thinking...</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me about doctors, offices, or specialties..."
            disabled={isLoading}
            className="chat-input"
          />
          <button 
            type="submit" 
            disabled={!query.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
      </form>

      <div className="quick-actions">
        <p>Quick actions:</p>
        <div className="action-buttons">
          <button 
            onClick={() => setQuery('Show all available doctors')}
            className="quick-action-btn"
          >
            Available Doctors
          </button>
          <button 
            onClick={() => setQuery('List all offices')}
            className="quick-action-btn"
          >
            All Offices
          </button>
          <button 
            onClick={() => setQuery('Show medical specialties')}
            className="quick-action-btn"
          >
            Specialties
          </button>
        </div>
      </div>
    </div>
  );
};