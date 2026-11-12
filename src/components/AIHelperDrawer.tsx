import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  Shield,
  X,
  Code2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  MessageSquare,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { AIChatMessage, Position, BrokerConfig, ChartScanResult, OrderDirection } from '../types/trading';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  broker: BrokerConfig;
  positions: Position[];
  lastScanResult: ChartScanResult | null;
  onExecuteTrade: (params: {
    symbol: string;
    direction: OrderDirection;
    lotSize: number;
    stopLoss?: number;
    takeProfit?: number;
    source: 'AUTO_EA';
    comment: string;
  }) => void;
  onLoadCodeToConsole: (code: string) => void;
}

const QUICK_PROMPTS = [
  { label: '🛡️ Audit Risk (ZAR)', query: 'Audit my account risk and calculate safe lot sizes in South African Rands (ZAR) for my balance.' },
  { label: '🇿🇦 USDZAR Outlook', query: 'What is the institutional outlook for USDZAR with current SARB repo rates and commodity flows?' },
  { label: '📊 Analyze Chart Setup', query: 'Explain the technical setup and smart money concepts for the most recent scanned chart signal.' },
  { label: '⚡ Review Open Positions', query: 'Review all my open active positions and advise if I should hold, trail stop loss, or close 50%.' },
  { label: '💻 Generate MQL5 Scalper', query: 'Generate a high-velocity MQL5 scalping algorithm with strict stop loss for MT5.' },
];

export const AIHelperDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  broker,
  positions,
  lastScanResult,
  onExecuteTrade,
  onLoadCodeToConsole,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString('en-GB'),
      content: `### KILL CHART Institutional AI Copilot Online
I am synchronized with your **${broker.platform}** connection and **R ${broker.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}** ZAR account.

I can help you:
- **Audit Portfolio Risk in ZAR** (1% & 2% stop-out rules).
- **Evaluate Chart Setups** with Smart Money Concepts (SMC/ICT).
- **Optimize Open Positions** (trailing stops & 50% partial closes).
- **Generate MQL5/MQL4 Scripts** for zero-latency execution.
- **Forecast USDZAR Fundamentals** (SARB repo rate differentials).

Select a tactical quick prompt below or type your question:`,
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputVal).trim();
    if (!q || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString('en-GB'),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-helper/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          context: {
            balance: broker.balance,
            currency: broker.currency || 'ZAR',
            positions: positions,
            platform: broker.platform,
            lastScan: lastScanResult,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMsg: AIChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('en-GB'),
          actionProposal: data.actionProposal,
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get AI answer');
      }
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `**AI Copilot Notice:** ${err.message || 'Connection glitch'}. The institutional backup risk model remains active for your R ${broker.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} account.`,
        timestamp: new Date().toLocaleTimeString('en-GB'),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteAction = (action: AIChatMessage['actionProposal']) => {
    if (!action) return;
    if (action.type === 'TRADE_EXECUTE' && action.symbol && action.direction && action.lotSize) {
      onExecuteTrade({
        symbol: action.symbol,
        direction: action.direction,
        lotSize: action.lotSize,
        source: 'AUTO_EA',
        comment: 'AI_HELPER_FIRE',
      });
      onClose();
    } else if (action.type === 'LOAD_CODE' && action.codeSnippet) {
      onLoadCodeToConsole(action.codeSnippet);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1 hidden md:block" onClick={onClose} />

      {/* Drawer Container */}
      <div className="w-full max-w-xl h-full bg-[#0a0a10] border-l border-red-950/80 shadow-2xl flex flex-col font-mono text-gray-200">
        {/* Header */}
        <div className="p-4 border-b border-red-950/70 bg-[#0e0e16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-950/80 glow-red">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                  KILL CHART AI HELPER
                </h2>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">
                Institutional Algorithmic Trading & ZAR Risk Copilot
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#14141e] text-gray-400 hover:text-white hover:bg-red-950/50 border border-gray-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Telemetry Bar */}
        <div className="bg-[#07070c] px-4 py-2 border-b border-red-950/50 flex items-center justify-between text-[11px] font-mono text-gray-400 overflow-x-auto">
          <div className="flex items-center gap-3 shrink-0">
            <span>
              Balance: <span className="text-white font-bold">R {broker.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</span>
            </span>
            <span className="text-gray-700">|</span>
            <span>
              Bridge: <span className="text-red-400 font-bold">{broker.platform}</span>
            </span>
            <span className="text-gray-700">|</span>
            <span>
              Open: <span className="text-yellow-400 font-bold">{positions.length}</span>
            </span>
          </div>
          {lastScanResult && (
            <div className="text-[10px] text-gray-400 shrink-0 ml-2">
              Latest Scan: <span className="text-emerald-400 font-bold">{lastScanResult.symbol} {lastScanResult.signal}</span>
            </div>
          )}
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-gray-500 font-mono">
                {msg.role === 'assistant' ? (
                  <>
                    <Bot className="w-3 h-3 text-red-400" />
                    <span className="text-red-400 font-bold">KILL CHART AI</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-bold">OPERATOR</span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs font-mono leading-relaxed shadow-lg ${
                  msg.role === 'user'
                    ? 'bg-red-950/80 border border-red-600/70 text-white rounded-tr-none'
                    : 'bg-[#12121c] border border-red-950/70 text-gray-200 rounded-tl-none space-y-2'
                }`}
              >
                {/* Parse basic markdown headers & code blocks */}
                <div className="whitespace-pre-wrap space-y-1.5">
                  {msg.content.split('\n').map((line, lIdx) => {
                    if (line.startsWith('### ')) {
                      return (
                        <div key={lIdx} className="font-display font-bold text-sm text-red-400 tracking-wider uppercase mt-1">
                          {line.replace('### ', '')}
                        </div>
                      );
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={lIdx} className="font-bold text-white">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      );
                    }
                    return <div key={lIdx}>{line}</div>;
                  })}
                </div>

                {/* Action Proposal Button inside AI Response */}
                {msg.actionProposal && (
                  <div className="mt-3 pt-2.5 border-t border-red-950/80">
                    <button
                      onClick={() => handleExecuteAction(msg.actionProposal)}
                      className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-red-950 active:scale-95"
                    >
                      {msg.actionProposal.type === 'TRADE_EXECUTE' ? (
                        <>
                          <Zap className="w-4 h-4 fill-white" />
                          <span>{msg.actionProposal.label}</span>
                        </>
                      ) : (
                        <>
                          <Code2 className="w-4 h-4" />
                          <span>{msg.actionProposal.label}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-lg bg-red-950/50 text-red-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#12121c] border border-red-950/60 rounded-xl p-3 text-xs text-gray-400 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-400" />
                <span>KILL CHART AI analyzing live market data & computing response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 border-t border-red-950/50 bg-[#08080d] overflow-x-auto flex items-center gap-2">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.query)}
              disabled={isLoading}
              className="px-2.5 py-1.5 rounded-lg bg-[#141420] hover:bg-red-950/60 border border-gray-800 hover:border-red-700/60 text-[10px] font-mono text-gray-300 hover:text-white whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-red-950/80 bg-[#0e0e16]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask AI Helper about charts, MQL5, risk, or USDZAR..."
              disabled={isLoading}
              className="flex-1 bg-[#141420] border border-gray-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:bg-gray-800 disabled:text-gray-600 text-white transition cursor-pointer shadow-md shadow-red-950 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[9px] text-gray-500 text-center mt-1.5 font-mono">
            Directly connected to Gemini 3.8 Flash & Institutional Risk Matrix
          </div>
        </div>
      </div>
    </div>
  );
};
