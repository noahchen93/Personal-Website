import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { useLanguage } from '../../language/LanguageContext';

type MessageType = 'success' | 'error' | 'warning' | 'info';

interface StatusMessage {
  id: string;
  type: MessageType;
  title: string;
  message: string;
  timestamp: number;
}

// 全局状态管理
let messages: StatusMessage[] = [];
let listeners: ((messages: StatusMessage[]) => void)[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener([...messages]));
};

export const addStatusMessage = (type: MessageType, title: string, message: string) => {
  const newMessage: StatusMessage = {
    id: Date.now().toString(),
    type,
    title,
    message,
    timestamp: Date.now()
  };
  
  messages.unshift(newMessage);
  
  // 只保留最近的5条消息
  if (messages.length > 5) {
    messages = messages.slice(0, 5);
  }
  
  notifyListeners();
  
  // 自动移除消息
  setTimeout(() => {
    removeStatusMessage(newMessage.id);
  }, 5000);
};

export const removeStatusMessage = (id: string) => {
  messages = messages.filter(msg => msg.id !== id);
  notifyListeners();
};

export const clearAllMessages = () => {
  messages = [];
  notifyListeners();
};

export default function StatusMessage() {
  const { isZh } = useLanguage();
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);

  useEffect(() => {
    const listener = (newMessages: StatusMessage[]) => {
      setStatusMessages(newMessages);
    };
    
    listeners.push(listener);
    listener([...messages]); // 初始化
    
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  const getIcon = (type: MessageType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case 'success':
        return 'border-green-400/50 bg-green-900/20 backdrop-blur-sm';
      case 'error':
        return 'border-red-400/50 bg-red-900/20 backdrop-blur-sm';
      case 'warning':
        return 'border-yellow-400/50 bg-yellow-900/20 backdrop-blur-sm';
      case 'info':
        return 'border-blue-400/50 bg-blue-900/20 backdrop-blur-sm';
      default:
        return 'border-slate-400/50 bg-slate-900/20 backdrop-blur-sm';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(isZh ? 'zh-CN' : 'en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (statusMessages.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 space-y-2 z-50 max-w-md">
      {statusMessages.map((message) => (
        <div
          key={message.id}
          className={`border rounded-lg p-3 shadow-lg animate-slideInLeft ${getTypeColor(message.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(message.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-small font-terminal font-medium terminal-text-white">
                  {message.title}
                </p>
                <span className="text-small font-terminal terminal-text-cyan">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <p className="text-small font-terminal terminal-text-cyan mt-1">
                {message.message}
              </p>
            </div>
            <button
              onClick={() => removeStatusMessage(message.id)}
              className="terminal-text-cyan hover:terminal-text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {statusMessages.length > 1 && (
        <div className="text-center">
          <button
            onClick={clearAllMessages}
            className="text-small font-terminal terminal-text-cyan hover:terminal-text-white underline"
          >
            {isZh ? '清除所有消息' : 'Clear all messages'}
          </button>
        </div>
      )}
    </div>
  );
}