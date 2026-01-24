import React, { useState, useEffect } from 'react';
import { speechService } from './SpeechService';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  isRecording,
  setIsRecording
}) => {
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!speechService.isAvailable()) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const transcript = await speechService.startListening();
      if (transcript.trim()) {
        onTranscript(transcript);
      }
      setIsRecording(false);
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    speechService.stopListening();
    setIsRecording(false);
  };

  if (!isSupported) {
    return (
      <div className="voice-recorder unsupported">
        <p>Voice recognition not supported in your browser. Please use Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="voice-recorder">
      {!isRecording ? (
        <button
          className="record-button start"
          onClick={startRecording}
          title="Start speaking"
        >
          <span className="icon" style={{ fontSize: '24px' }}>🎤</span>
          <span>Start Speaking</span>
        </button>
      ) : (
        <button
          className="record-button stop"
          onClick={stopRecording}
          title="Stop recording"
        >
          <span className="icon" style={{ fontSize: '24px' }}>⏹️</span>
          <span>Stop Recording</span>
        </button>
      )}
      
      <div className="recording-status">
        {isRecording && (
          <div className="pulse-animation">
            <div className="pulse-circle"></div>
            <span>Listening... Speak now</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;