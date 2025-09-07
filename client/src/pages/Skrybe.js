import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Skrybe = () => {
  const { user } = useAuth();
  const { sendAIMessage, socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const creativeSuggestions = [
    "Help me brainstorm ideas for my art project",
    "I need inspiration for a short story",
    "What's a unique angle for my music composition?",
    "How can I make my coding project more creative?",
    "Give me prompts for creative writing",
    "Help me overcome creative block",
    "What are some trending creative challenges?",
    "How can I improve my artistic style?"
  ];

  useEffect(() => {
    fetchConversations();
    fetchSuggestions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('ai_response', handleAIResponse);
      socket.on('ai_typing', () => setAiTyping(true));
      
      return () => {
        socket.off('ai_response');
        socket.off('ai_typing');
      };
    }
  }, [socket]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/ai/conversations');
      setConversations(response.data.conversations);
      
      if (response.data.conversations.length > 0 && !activeConversation) {
        loadConversation(response.data.conversations[0]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/ai/suggestions');
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const loadConversation = async (conversation) => {
    setActiveConversation(conversation);
    
    try {
      const response = await axios.get(`/ai/conversations/${conversation.id}`);
      setMessages(response.data.conversation.messages || []);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const createNewConversation = async (initialMessage = '') => {
    try {
      const message = initialMessage || inputMessage.trim();
      if (!message) return;

      const response = await axios.post('/ai/conversations', {
        message,
        contextType: 'creative',
        title: `Chat ${new Date().toLocaleDateString()}`
      });

      const newConversation = response.data.conversation;
      setConversations([newConversation, ...conversations]);
      setActiveConversation(newConversation);
      setMessages(newConversation.messages || []);
      setInputMessage('');
      
      toast.success('🤖 New chat started!');
    } catch (error) {
      toast.error('Failed to start new conversation');
    }
  };

  const sendMessage = async (messageText = '') => {
    const message = messageText || inputMessage.trim();
    if (!message) return;

    if (!activeConversation) {
      await createNewConversation(message);
      return;
    }

    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAiTyping(true);

    try {
      // Send via socket for real-time response
      if (socket) {
        sendAIMessage(activeConversation.id, message);
      } else {
        // Fallback to HTTP
        const response = await axios.post(`/ai/conversations/${activeConversation.id}/messages`, {
          message
        });
        
        handleAIResponse({
          conversationId: activeConversation.id,
          message: response.data.aiResponse,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
      setAiTyping(false);
    }
  };

  const handleAIResponse = (data) => {
    if (data.conversationId === activeConversation?.id) {
      const aiMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: data.timestamp
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setAiTyping(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`/ai/conversations/${conversationId}`);
      setConversations(conversations.filter(c => c.id !== conversationId));
      
      if (activeConversation?.id === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          loadConversation(remaining[0]);
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const TypingAnimation = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center space-x-2 text-cyber-cyan"
    >
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-cyber-cyan rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      <span className="text-sm font-cyber">Skrybe is thinking...</span>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-cyber">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-white mb-4">
            <span className="text-gradient">Skrybe</span> 🤖
          </h1>
          <p className="text-gray-300 font-cyber">
            Your AI-powered creative companion and digital muse
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <div className="cyber-card h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-gaming text-white">Conversations</h3>
                <button
                  onClick={() => createNewConversation()}
                  className="p-2 bg-cyber-cyan bg-opacity-20 text-cyber-cyan rounded-lg hover:bg-opacity-30 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-3 rounded-xl cursor-pointer transition-all duration-300 group ${
                      activeConversation?.id === conversation.id
                        ? 'bg-cyber-cyan bg-opacity-20 border border-cyber-cyan border-opacity-30'
                        : 'bg-dark-surface hover:bg-opacity-80'
                    }`}
                    onClick={() => loadConversation(conversation)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white text-sm font-cyber truncate">
                          {conversation.title || 'New Chat'}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {conversation.last_message || 'Start a conversation...'}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all duration-300"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="cyber-card h-full flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-white border-opacity-10 pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-gaming text-white">Skrybe</h3>
                        <p className="text-xs text-gray-400">Your creative AI companion</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <SparklesIcon className="w-12 h-12 text-cyber-cyan mx-auto mb-4" />
                        <h3 className="text-xl font-gaming text-white mb-2">Ready to Create!</h3>
                        <p className="text-gray-300 mb-6">
                          Ask me anything about your creative projects. I'm here to inspire and help!
                        </p>
                        
                        {/* Quick Suggestions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {creativeSuggestions.slice(0, 4).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => sendMessage(suggestion)}
                              className="p-3 bg-dark-surface rounded-xl text-left hover:bg-opacity-80 transition-colors group"
                            >
                              <p className="text-sm text-gray-300 group-hover:text-white">
                                {suggestion}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                          <div className={`p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-cyber-cyan bg-opacity-20 text-white ml-4'
                              : 'bg-dark-surface text-white mr-4 border border-cyber-purple border-opacity-30'
                          }`}>
                            {message.role === 'assistant' && (
                              <div className="flex items-center space-x-2 mb-2">
                                <SparklesIcon className="w-4 h-4 text-cyber-purple" />
                                <span className="text-xs text-cyber-purple font-cyber">Skrybe</span>
                              </div>
                            )}
                            
                            <div className={message.role === 'assistant' ? 'glow-text' : ''}>
                              {message.content.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 last:mb-0">{line}</p>
                              ))}
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {aiTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[80%] bg-dark-surface p-4 rounded-2xl mr-4 border border-cyber-purple border-opacity-30">
                          <TypingAnimation />
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-white border-opacity-10 pt-4">
                    <div className="flex space-x-4">
                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask Skrybe anything creative..."
                          className="w-full bg-dark-surface border-2 border-cyber-purple border-opacity-30 text-white rounded-xl px-4 py-3 pr-12 focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple focus:ring-opacity-50 transition-all duration-300 resize-none h-12 font-cyber placeholder-gray-400"
                          style={{
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.1)'
                          }}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => sendMessage()}
                            disabled={!inputMessage.trim() || aiTyping}
                            className="p-2 bg-gradient-to-r from-cyber-cyan to-cyber-purple rounded-lg text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Welcome Screen */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="text-8xl mb-6"
                    >
                      🤖
                    </motion.div>
                    
                    <h2 className="text-2xl font-gaming text-white mb-4">
                      Welcome to <span className="text-gradient">Skrybe</span>!
                    </h2>
                    
                    <p className="text-gray-300 mb-8 leading-relaxed">
                      I'm your AI creative companion, ready to help you brainstorm, 
                      overcome creative blocks, and explore new ideas. Let's create something amazing together!
                    </p>
                    
                    <button
                      onClick={() => createNewConversation("Hello Skrybe! I'm ready to get creative.")}
                      className="cyber-button flex items-center mx-auto"
                    >
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                      Start Creating
                    </button>

                    {/* AI Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-lg font-gaming text-white mb-4">Suggested for You</h3>
                        <div className="space-y-2">
                          {suggestions.slice(0, 3).map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => createNewConversation(suggestion.content)}
                              className="w-full p-3 bg-dark-surface rounded-xl text-left hover:bg-opacity-80 transition-colors group"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">{suggestion.type === 'goal_setting' ? '🎯' : suggestion.type === 'challenge' ? '⚔️' : '🎨'}</span>
                                <div>
                                  <p className="text-white font-cyber">{suggestion.title}</p>
                                  <p className="text-sm text-gray-400">{suggestion.content}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skrybe;