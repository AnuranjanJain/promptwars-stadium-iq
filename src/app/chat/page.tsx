'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useAppContext } from '@/components/AppProvider';
import { ChatMessage } from '@/types';
import { generateId } from '@/utils/helpers';
import styles from './page.module.css';

const SUGGESTIONS = [
  '🍔 Where can I eat?',
  '🚻 Nearest restroom?',
  '⚽ What\'s the score?',
  '🏃 Least crowded area?',
  '🛍️ Merchandise shops?',
  '🚪 How do I exit?',
  '🔮 When will the rush hit?',
  '♿ Accessible routes?',
];

export default function ChatPage() {
  const { gameState } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  useEffect(() => {
    // Initialize messages on client to avoid hydration mismatch with Date.now()
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hey there! I'm **Stadium Buddy**, your AI concierge for National Arena!\n\n⚽ **${gameState.homeTeam} ${gameState.homeScore} - ${gameState.awayScore} ${gameState.awayTeam}** (${gameState.period}, ${gameState.timeRemaining})\n\nI can help you with:\n- 🍔 Finding food with the shortest waits\n- 🚻 Nearest restrooms and queue times\n- 🗺️ Navigation within the stadium\n- 🔮 Crowd predictions\n- 📸 Photo-based location finding\n\nWhat do you need?`,
        timestamp: Date.now(),
      },
    ]);
  }, [gameState]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e?: FormEvent, overrideMessage?: string) => {
    e?.preventDefault();
    const messageText = overrideMessage || input.trim();
    if (!messageText && !selectedImage) return;
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
      imageUrl: selectedImage || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    // Add loading message
    const loadingId = generateId();
    setMessages(prev => [...prev, {
      id: loadingId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          image: selectedImage,
          history: messages
            .filter(m => !m.isLoading)
            .map(m => ({
              role: m.role === 'assistant' ? 'model' : m.role,
              parts: [{ text: m.content }],
            })),
        }),
      });

      const data = await response.json();

      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { ...m, content: data.response, isLoading: false, timestamp: Date.now() }
          : m
      ));
    } catch (error) {
      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { ...m, content: 'Sorry, I encountered an error. Please try again!', isLoading: false }
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestion = (suggestion: string) => {
    handleSubmit(undefined, suggestion);
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatPage}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.chatAvatar}>🤖</div>
        <div className={styles.chatHeaderInfo}>
          <h2>Stadium Buddy</h2>
          <div className={styles.chatStatus}>
            <span className="status-dot active" />
            <p>Powered by Gemini AI · Always online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.chatMessages} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map(msg => (
          <div key={msg.id}>
            <div className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}>
              <div className={`${styles.msgAvatar} ${msg.role === 'user' ? styles.msgAvatarUser : styles.msgAvatarBot}`}>
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div>
                <div className={`${styles.msgBubble} ${msg.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleBot}`}>
                  {msg.isLoading ? (
                    <div className={styles.loadingDots}>
                      <div className={styles.loadingDot} />
                      <div className={styles.loadingDot} />
                      <div className={styles.loadingDot} />
                    </div>
                  ) : (
                    <>
                      {msg.imageUrl && (
                        <img
                          src={`data:image/jpeg;base64,${msg.imageUrl}`}
                          alt="Uploaded"
                          style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px', display: 'block' }}
                        />
                      )}
                      {formatMessage(msg.content)}
                    </>
                  )}
                </div>
                <div className={`${styles.msgTime} ${msg.role === 'user' ? styles.msgTimeUser : ''}`}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className={styles.suggestions}>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              className={styles.suggestion}
              onClick={() => handleSuggestion(s)}
              aria-label={`Ask: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={styles.chatInput}>
        {selectedImage && (
          <div className={styles.imagePreview}>
            <img src={`data:image/jpeg;base64,${selectedImage}`} alt="Selected" />
            <button className={styles.removeImage} onClick={() => setSelectedImage(null)} aria-label="Remove image">✕</button>
          </div>
        )}
        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            aria-label="Upload photo"
          />
          <button
            type="button"
            className={styles.imageBtn}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Take or upload a photo for location detection"
            title="📸 Where Am I? — Snap a photo!"
          >
            📸
          </button>
          <div className={styles.inputWrapper}>
            <textarea
              ref={textareaRef}
              className={styles.inputField}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Stadium Buddy anything..."
              rows={1}
              aria-label="Type your message"
            />
          </div>
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={isLoading || (!input.trim() && !selectedImage)}
            aria-label="Send message"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
