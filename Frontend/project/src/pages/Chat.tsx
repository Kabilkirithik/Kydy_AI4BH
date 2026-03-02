import React, { useState, useRef, useEffect } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Layout from '../components/Layout';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  PlusCircle, 
  MoreHorizontal,
  Code2,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

// Mock Data
const MOCK_HISTORY = [
  { id: 1, title: 'React Hooks Explanation', date: new Date(Date.now() - 3600000) },
  { id: 2, title: 'Debugging TypeScript Error', date: new Date(Date.now() - 86400000) },
  { id: 3, title: 'Explain SVG Animations', date: new Date(Date.now() - 172800000) },
  { id: 4, title: 'Algorithm Optimization', date: new Date(Date.now() - 259200000) },
];

const INITIAL_MESSAGES = [
  { id: '1', role: 'ai', content: "Hello! I'm your Kydy Assistant. Whether you're learning a new concept or debugging code, I'm here to help. What can we build or learn today?" }
];

export default function Chat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMsg = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      setIsTyping(false);
      const newAiMsg = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: "I'm a simulated AI assistant for this demo. To enable real intelligent responses, please connect the backend services. For now, try exploring the SVG Animations page to see interactive learning tools!" 
      };
      setMessages(prev => [...prev, newAiMsg]);
    }, 1500);
  };

  return (
    <Layout hideFooter>
      <div className="flex-1 flex overflow-hidden h-[calc(100vh-5rem)]">
        <PanelGroup direction="horizontal">
          
          {/* Left Panel: Chat History */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="bg-muted/30 border-r border-border hidden md:flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <span className="font-medium text-sm text-muted-foreground uppercase tracking-wider">History</span>
              <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors" title="New Chat">
                <PlusCircle size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {MOCK_HISTORY.map((chat) => (
                <button 
                  key={chat.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/80 transition-colors group flex flex-col gap-1 border border-transparent hover:border-border/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1 flex items-center gap-2">
                      <MessageSquare size={14} className="text-muted-foreground" />
                      {chat.title}
                    </span>
                    <MoreHorizontal size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-6">
                    {format(chat.date, 'MMM d, yyyy')}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-medium">Pro Plan Active</p>
                  <p className="text-[10px] text-muted-foreground">Unlimited messages</p>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize hidden md:block" />

          {/* Center Panel: Active Chat */}
          <Panel defaultSize={80} className="flex flex-col bg-background relative">
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <div className="max-w-3xl mx-auto space-y-8">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === 'user' 
                        ? 'bg-secondary text-secondary-foreground border border-border' 
                        : 'bg-primary text-primary-foreground shadow-sm'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-muted/50 border border-border text-foreground'
                        : 'bg-card border border-border/50 shadow-sm text-foreground'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                      <Bot size={16} />
                    </div>
                    <div className="bg-card border border-border/50 shadow-sm rounded-2xl px-5 py-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
              <div className="max-w-3xl mx-auto relative">
                <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-card border border-border rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all p-2">
                  <button 
                    type="button" 
                    className="p-3 text-muted-foreground hover:text-primary transition-colors rounded-xl"
                    title="Insert Code Snippet"
                  >
                    <Code2 size={20} />
                  </button>
                  
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Ask a question, paste code, or request a topic explanation..."
                    className="flex-1 max-h-32 min-h-[44px] py-3 bg-transparent border-none focus:outline-none resize-none text-sm"
                    rows={1}
                  />
                  
                  <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <div className="text-center mt-2">
                   <p className="text-xs text-muted-foreground">AI can make mistakes. Verify important information.</p>
                </div>
              </div>
            </div>

          </Panel>
        </PanelGroup>
      </div>
    </Layout>
  );
}