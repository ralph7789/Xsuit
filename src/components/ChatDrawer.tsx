import React, { useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  RefreshCw,
  Lock,
  Shield,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { ChatMessage, XidUser } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (val: string) => void;
  onSendMessage: (customPrompt?: string) => void;
  chatLoading: boolean;
  user: XidUser | null;
  onLoginWithXid: () => void;
  onLogout: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  chatLoading,
  user,
  onLoginWithXid,
  onLogout,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, chatLoading]);

  if (!isOpen) return null;

  const isAuthenticated = user?.authenticated === true;
  const isXAdmin = user?.isXAdmin === true;

  const promptSuggestions = isAuthenticated
    ? isXAdmin
      ? [
          'Summarize Xcorp cluster architecture',
          'Inspect Sentinel WAF and Casbin policies',
          'How does the 220GB NVMe logging work?',
        ]
      : [
          'What tools do I have access to?',
          'How do I use Aladin AI workflows?',
          'Explore Xcorp applications',
        ]
    : [
        'What is Xcorp?',
        'Explore Ecosystem Applications',
        'How does XID security work?',
      ];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-2xl glass-panel border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 ${
        isExpanded
          ? 'w-[90vw] sm:w-[600px] h-[80vh]'
          : 'w-[90vw] sm:w-[440px] h-[580px]'
      }`}
    >
      {/* Top Header */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs text-white">
                Aladin AI Assistant
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-semibold flex items-center space-x-1 ${
                  isXAdmin
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : isAuthenticated
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isXAdmin ? 'XAdmin' : isAuthenticated ? 'User' : 'Guest'}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAuthenticated ? 'bg-emerald-400' : 'bg-cyan-400'
                }`}
              />
              <span>
                {isAuthenticated
                  ? `XID: ${user?.name || user?.email}`
                  : 'Public Concierge Mode'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-slate-400">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isExpanded ? 'Restore size' : 'Expand window'}
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* XID Access Governance Banner */}
      <div
        className={`px-3 py-2 text-[11px] border-b flex items-center justify-between ${
          isAuthenticated
            ? 'bg-slate-950/70 border-slate-800/80 text-slate-300'
            : 'bg-cyan-950/30 border-cyan-800/40 text-cyan-200'
        }`}
      >
        <div className="flex items-center space-x-1.5">
          {isAuthenticated ? (
            <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )}
          <span className="truncate">
            {isAuthenticated
              ? isXAdmin
                ? 'Full cluster operations & telemetry unlocked.'
                : 'Standard application guidance tier active.'
              : 'Public Concierge active. Chat freely with Aladin AI.'}
          </span>
        </div>

        <div>
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center space-x-1"
              title="Sign Out of XID"
            >
              <LogOut className="w-2.5 h-2.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={onLoginWithXid}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors flex items-center space-x-1 shadow-sm"
            >
              <KeyRound className="w-2.5 h-2.5" />
              <span>Sign In XID</span>
            </button>
          )}
        </div>
      </div>

      {/* Prompt Suggestion Chips */}
      <div className="p-2 bg-slate-950/60 border-b border-slate-900 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map(m => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {m.content}
              </div>
              <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-500 font-mono px-1">
                <span>{m.timestamp}</span>
                {m.latency_ms && <span>· {m.latency_ms}ms</span>}
              </div>
            </div>
          );
        })}

        {chatLoading && (
          <div className="flex items-center space-x-2 text-xs text-cyan-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono">Aladin AI reasoning...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={
              isAuthenticated
                ? isXAdmin
                  ? 'Ask Aladin AI about cluster ops, telemetry, nodes...'
                  : 'Ask Aladin AI about Xcorp apps...'
                : 'Ask Aladin AI anything...'
            }
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || chatLoading}
            className="p-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black transition-all"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
