
import React, { useState, useRef, useEffect } from 'react';
import { Transaction } from '../../types';
import { getChatInsight } from '../../services/geminiService';

interface MoneyCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

interface Message {
    text: string;
    sender: 'user' | 'ai';
}

const MoneyCoachModal: React.FC<MoneyCoachModalProps> = ({ isOpen, onClose, transactions }) => {
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: "Hello! I'm your MoneyMind AI Coach. How can I help you with your finances today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getChatInsight(input, transactions);
    setMessages([...newMessages, { sender: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
      <div className="bg-background dark:bg-dark-background rounded-2xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col p-4">
        <div className="flex justify-between items-center border-b border-border-color dark:border-dark-border-color pb-3 mb-4">
            <h2 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">AI Money Coach 🧠</h2>
            <button onClick={onClose} className="text-text-secondary dark:text-dark-text-secondary">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-card-bg dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary shadow-sm'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-start">
                    <div className="max-w-md p-3 rounded-lg bg-card-bg dark:bg-dark-card-bg text-text-primary dark:text-dark-text-primary shadow-sm flex items-center space-x-2">
                        <span className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></span>
                        <span className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:0.4s]"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 pt-4 border-t border-border-color dark:border-dark-border-color">
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask 'How much did I spend on food?'"
                    className="flex-grow px-4 py-2 bg-gray-100 dark:bg-dark-card-bg border border-border-color dark:border-dark-border-color rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading}
                    className="bg-primary text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MoneyCoachModal;
