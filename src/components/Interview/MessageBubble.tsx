import React from 'react';
import { Message } from '../../types/interview';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.speaker === 'ai';
  
  return (
    <div className={`message-container ${isAI ? 'ai-message' : 'user-message'}`}>
      <div className="message-avatar">
        {isAI ? '🤖' : '👤'}
      </div>
      <div className="message-content">
        <div className="message-text">{message.text}</div>
        {message.question && (
          <div className="message-question">
            <small>Question: {message.question}</small>
          </div>
        )}
        <div className="message-time">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;