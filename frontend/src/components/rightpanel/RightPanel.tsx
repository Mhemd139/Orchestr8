import { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'system' | 'user';
  content: string;
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'system',
    content: 'AI Coach initialized. Ready to assist with workflow creation.',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    type: 'user',
    content: 'How do I optimize this workflow?',
    timestamp: '10:31 AM',
  },
  {
    id: '3',
    type: 'system',
    content: 'I can help you optimize your workflow. Would you like me to analyze the recorded steps?',
    timestamp: '10:31 AM',
  },
];

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RightPanel = ({ isOpen, onClose }: RightPanelProps) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    if (inputValue.trim()) {
      console.log('[AI Coach] Message sent:', inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 border-l border-border bg-card shadow-lg">
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-foreground">AI Coach</h2>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex h-[calc(100vh-8rem)] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${
                msg.type === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask AI coach..."
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-primary p-2 text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
