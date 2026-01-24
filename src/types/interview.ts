export type Speaker = 'user' | 'ai';

export interface Message {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: Date;
  question?: string;
}

export interface InterviewState {
  id: string;
  isActive: boolean;
  isRecording: boolean;
  isAIThinking: boolean;
  messages: Message[];
  currentQuestionIndex: number;
  interviewType: 'mixed' | 'technical' | 'behavioral';
}

export interface WebSocketMessage {
  type: 'user_response' | 'ai_question' | 'interview_started' | 
        'interview_complete' | 'feedback' | 'error';
  text?: string;
  question?: string;
  question_number?: number;
  total_questions?: number;
  interview_id?: string;
  responses?: any[];
}