"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flex, Text, IconButton, Button, Icon } from '@/once-ui/components';
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="chatbot-fab"
          >
            <motion.button
              className="chatbot-fab-button"
              onClick={() => setIsOpen(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Open AI Assistant"
            >
              <span className="chatbot-fab-icon">🤖</span>
              <motion.div
                className="chatbot-fab-pulse"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.button>
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
              <Flex alignItems="center" gap="s">
                <div className="chatbot-avatar">
                  <span>🤖</span>
                </div>
                <Flex direction="column" gap="2">
                  <Text variant="label-strong-s" onBackground="neutral-strong">
                    AI Assistant
                  </Text>
                  <Flex alignItems="center" gap="xs">
                    <div className="status-dot" />
                    <Text variant="label-default-xs" onBackground="neutral-medium">
                      Online
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <IconButton
                icon="close"
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="s"
                aria-label="Close chat"
              />
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
                    <Text 
                      variant="body-default-s" 
                      onBackground={message.sender === 'ai' ? 'neutral-strong' : 'brand-strong'}
                    >
                      {message.text}
                    </Text>
                  </div>
                  <Text 
                    variant="label-default-xs" 
                    onBackground="neutral-weak"
                    className="message-time"
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
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
                  <Text variant="label-default-xs" onBackground="neutral-medium">
                    Suggested questions:
                  </Text>
                  <Flex direction="column" gap="xs" paddingTop="xs">
                    {suggestedQuestions.slice(0, 3).map((question, index) => (
                      <motion.button
                        key={index}
                        className="suggested-question-btn"
                        onClick={() => handleSendMessage(question)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Text variant="body-default-xs" onBackground="neutral-medium">
                          {question}
                        </Text>
                      </motion.button>
                    ))}
                  </Flex>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chatbot-input-container">
              <Flex gap="s" alignItems="flex-end">
                <div className="chatbot-input-wrapper">
                  <div
                    className="chatbot-input"
                    style={{
                      backgroundColor: theme === 'light' ? '#ffffff' : '#3a3a3a',
                      color: theme === 'light' ? '#000000' : '#e0e0e0',
                      borderColor: theme === 'light' ? '#dee2e6' : '#555',
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${theme === 'light' ? '#dee2e6' : '#555'}`,
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      minHeight: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'text',
                      transition: 'all 0.3s ease',
                    }}
                    onClick={() => inputRef.current?.focus()}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      style={{
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        width: '100%',
                        color: theme === 'light' ? '#000000' : '#e0e0e0',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
                <motion.button
                  className="chatbot-send-btn"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <Icon name="send" size="s" />
                </motion.button>
              </Flex>
              <Text 
                variant="label-default-xs" 
                onBackground="neutral-weak"
                style={{ marginTop: '8px', textAlign: 'center' }}
              >
                Powered by AI • Showcasing ML expertise • {theme} mode
              </Text>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

