import React from 'react';
import InterviewScreen from './components/Interview/InterviewScreen';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 AI Interviewer - Weekend Project</h1>
        <p>Practice interviews with AI • Zero Cost • Real-time</p>
      </header>
      
      <main className="app-main">
        <InterviewScreen />
      </main>
      
      <footer className="app-footer">
        <p>Built with React, FastAPI & Ollama • Voice: Browser APIs • LLM: Llama 3</p>
        <p className="disclaimer">
          Note: Requires Chrome/Edge for voice recognition. 
          All processing happens locally on your machine.
        </p>
      </footer>
    </div>
  );
}

export default App;