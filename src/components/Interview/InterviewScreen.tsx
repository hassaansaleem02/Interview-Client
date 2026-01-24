import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, InterviewState } from '../../types/interview';
import { websocketService } from '../../services/websocket';
import { speechService } from '../Voice/SpeechService';
import MessageBubble from './MessageBubble';
import VoiceRecorder from '../Voice/VoiceRecorder';
import './InterviewScreen.css';

const InterviewScreen: React.FC = () => {
  const [interviewState, setInterviewState] = useState<InterviewState>({
    id: `interview_${Date.now()}`,
    isActive: false,
    isRecording: false,
    isAIThinking: false,
    messages: [],
    currentQuestionIndex: 0,
    interviewType: 'mixed'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  const handleWebSocketMessage = (data: any) => {
    console.log('Received:', data);
    
    switch (data.type) {
      case 'interview_started':
        addMessage('ai', data.first_question || 'Welcome! Let\'s begin the interview.');
        break;
        
      case 'ai_question':
        setInterviewState(prev => ({
          ...prev,
          isAIThinking: false
        }));
        
        addMessage('ai', data.text);
        
        // Speak the AI response
        if (data.text) {
          speechService.speak(data.text);
        }
        break;
        
      case 'feedback':
        addMessage('ai', `Feedback: ${data.text}`);
        break;
        
      case 'interview_complete':
        addMessage('ai', 'Interview completed! Thank you for your time.');
        setInterviewState(prev => ({ ...prev, isActive: false }));
        break;
        
      case 'error':
        console.error('Server error:', data);
        break;
    }
  };

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interviewState.messages]);

  // Initialize WebSocket
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        await websocketService.connect(interviewState.id);
        setIsConnected(true);
        
        websocketService.addMessageListener(handleWebSocketMessage);
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    };

    initializeConnection();

    return () => {
      websocketService.removeMessageListener(handleWebSocketMessage);
      websocketService.disconnect();
    };
  }, [interviewState.id, handleWebSocketMessage]);

  const addMessage = (speaker: 'user' | 'ai', text: string, question?: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      speaker,
      text,
      timestamp: new Date(),
      question
    };

    setInterviewState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  };

  const startInterview = () => {
    setInterviewState(prev => ({ ...prev, isActive: true }));
    
    websocketService.sendMessage({
      type: 'start_interview',
      interview_type: interviewState.interviewType
    });
  };

  const handleTranscript = (transcript: string) => {
    if (!transcript.trim()) return;

    // Add user message
    addMessage('user', transcript);
    
    // Show AI thinking
    setInterviewState(prev => ({ ...prev, isAIThinking: true }));
    
    // Send to backend
    websocketService.sendMessage({
      type: 'user_response',
      text: transcript,
      interview_id: interviewState.id
    });
  };

  const endInterview = () => {
    websocketService.sendMessage({
      type: 'end_interview'
    });
    setInterviewState(prev => ({ ...prev, isActive: false }));
  };

  if (!isConnected) {
    return (
      <div className="interview-container connecting">
        <div className="connection-status">
          <div className="spinner"></div>
          <p>Connecting to interview server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-container">
      {/* Header */}
      <div className="interview-header">
        <h2>AI Interview Practice</h2>
        <div className="interview-info">
          <span className={`status-dot ${interviewState.isActive ? 'active' : 'inactive'}`}></span>
          <span>{interviewState.isActive ? 'Interview in Progress' : 'Ready'}</span>
          <span className="interview-id">ID: {interviewState.id}</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {interviewState.messages.length === 0 ? (
          <div className="welcome-message">
            <h3>Welcome to AI Interview Practice</h3>
            <p>Practice your interview skills with AI. Click "Start Interview" to begin.</p>
            <p>Choose your interview type:</p>
            <div className="interview-type-selector">
              {(['mixed', 'technical', 'behavioral'] as const).map(type => (
                <button
                  key={type}
                  className={`type-btn ${interviewState.interviewType === type ? 'selected' : ''}`}
                  onClick={() => setInterviewState(prev => ({ ...prev, interviewType: type }))}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {interviewState.messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {interviewState.isAIThinking && (
              <div className="thinking-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>AI is thinking...</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Controls */}
      <div className="interview-controls">
        {!interviewState.isActive ? (
          <button className="control-btn start-btn" onClick={startInterview}>
            Start Interview
          </button>
        ) : (
          <>
            <VoiceRecorder
              onTranscript={handleTranscript}
              isRecording={interviewState.isRecording}
              setIsRecording={(recording) => 
                setInterviewState(prev => ({ ...prev, isRecording: recording }))
              }
            />
            
            <button className="control-btn end-btn" onClick={endInterview}>
              End Interview
            </button>
          </>
        )}
      </div>

      {/* Connection Status */}
      <div className="connection-info">
        <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
    </div>
  );
};

export default InterviewScreen;