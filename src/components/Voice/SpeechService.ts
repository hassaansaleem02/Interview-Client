// Abstraction layer for easy swapping between free/paid services
export interface ISpeechService {
  startListening(): Promise<string>;
  stopListening(): void;
  speak(text: string): void;
  stop(): void;
  isAvailable(): boolean;
}

// Free browser implementation
export class BrowserSpeechService implements ISpeechService {
  private recognition: any;
  private isListening = false;
  private resolveCallback: ((text: string) => void) | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      // @ts-ignore - WebkitSpeechRecognition is browser-specific
      this.recognition = new webkitSpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (this.resolveCallback) {
        this.resolveCallback(transcript);
        this.resolveCallback = null;
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (this.resolveCallback) {
        this.resolveCallback('');
        this.resolveCallback = null;
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };
  }

  async startListening(): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Speech recognition not available');
    }

    return new Promise((resolve) => {
      this.resolveCallback = resolve;
      this.isListening = true;
      this.recognition.start();
    });
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Select a voice if available
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        utterance.voice = englishVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }

  stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    this.stopListening();
  }

  isAvailable(): boolean {
    return 'webkitSpeechRecognition' in window && 'speechSynthesis' in window;
  }
}

// Singleton instance
export const speechService = new BrowserSpeechService();