"use client";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, Send, X } from 'lucide-react';
import './chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const suggestedQuestions = [
  "What's your experience with Java and Spring Boot?",
  "Tell me about your AI/ML projects",
  "Can you help with cloud architecture on AWS?",
  "What's your experience with React and frontend development?",
  "Tell me about your work at JP Morgan Chase",
  "What technologies do you specialize in?"
];

interface AIChatbotProps {
  theme?: 'light' | 'dark';
}

export default function AIChatbot({ theme = 'light' }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      text: "Hi! I'm Yasasvi's AI assistant. Ask me anything about his experience, skills, or projects!",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Step aside while a screen that holds its own action or the closing wordmark is in view
  // (the hero, the footer), so the launcher never sits on top of display type
  const pathname = usePathname();
  const [fabHidden, setFabHidden] = useState(false);
  useEffect(() => {
    const blockers = Array.from(document.querySelectorAll('[data-hide-fab]'));
    if (!blockers.length) {
      setFabHidden(false);
      return;
    }
    const visible = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
      setFabHidden(visible.size > 0);
    }, { threshold: 0.15 });
    blockers.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the chatbot API
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && !fabHidden && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="chatbot-fab"
          >
            <button
              type="button"
              className="chatbot-fab-button"
              onClick={() => setIsOpen(true)}
              aria-label="Ask about me"
            >
              <MessageSquareText aria-hidden="true" />
              <span className="chatbot-fab-label">Ask about me</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="chatbot-window"
            data-theme={theme}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div>
                <p className="chatbot-title">Ask about Yasasvi</p>
                <p className="chatbot-subtitle">An AI assistant that knows his resume</p>
              </div>
              <button type="button" className="ds-icon-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X aria-hidden="true" />
              </button>
            </div>

            {/* Messages */}
            <div className="chatbot-messages">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message ${message.sender}`}
                >
                  <div className="message-content">
                    <p>{message.text}</p>
                  </div>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="message ai"
                >
                  <div className="message-content typing">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Suggested Questions (only show initially) */}
              {messages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="suggested-questions"
                >
                  <p className="suggested-questions__label">Try asking</p>
                  <div className="suggested-questions__list">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        type="button"
                        className="suggested-question-btn"
                        onClick={() => handleSendMessage(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chatbot-input-container">
              <form
                className="chatbot-input-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <label htmlFor="chatbot-input" className="ds-visually-hidden">Your question</label>
                <input
                  id="chatbot-input"
                  ref={inputRef}
                  type="text"
                  className="chatbot-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask about projects, skills or experience"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="chatbot-send-btn"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                >
                  <Send aria-hidden="true" />
                </button>
              </form>
              <p className="chatbot-note">Answers come from an AI model and can be wrong.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

