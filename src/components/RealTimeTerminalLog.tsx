import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types/trading';
import { Terminal, Trash2, Search, ArrowDownCircle, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface Props {
  logs: LogEntry[];
  onClearLogs: () => void;
}

export const RealTimeTerminalLog: React.FC<Props> = ({ logs, onClearLogs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'ALL' && log.type !== filterType) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return log.message.toLowerCase().includes(q) || log.timestamp.includes(q);
    }
    return true;
  });

  const getBadgeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'TRADE':
        return 'text-green-400 bg-green-950/60 border-green-800/40';
      case 'ALERT':
        return 'text-red-400 bg-red-950/60 border-red-800/40';
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';
      case 'WARNING':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/40';
      case 'ERROR':
        return 'text-red-500 bg-red-950 border-red-700';
      default:
        return 'text-blue-400 bg-blue-950/60 border-blue-800/40';
    }
  };

  return (
    <div className="bg-[#09090e] border border-red-950/70 rounded-xl overflow-hidden flex flex-col">
      {/* Terminal Title Bar */}
      <div className="bg-[#101018] px-3 py-2 border-b border-red-950/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-200">
            Real-Time Position & Execution Log
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/80 text-gray-400 border border-gray-800">
            {filteredLogs.length} events
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {['ALL', 'TRADE', 'ALERT', 'INFO'].map(f => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition ${
                filterType === f
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-[#181822] text-gray-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded text-[10px] cursor-pointer transition ml-1 ${
              autoScroll ? 'text-green-400 bg-green-950/40' : 'text-gray-500'
            }`}
            title={autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearLogs}
            className="p-1 rounded text-[10px] text-gray-400 hover:text-red-400 cursor-pointer transition ml-1"
            title="Clear terminal stream"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0b0b12] px-3 py-1.5 border-b border-red-950/40 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter logs by ticket, symbol, execution message..."
          className="w-full bg-transparent text-[11px] font-mono text-gray-300 placeholder-gray-600 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[10px] text-gray-500 hover:text-gray-300 font-mono"
          >
            ✕
          </button>
        )}
      </div>

      {/* Log Feed */}
      <div
        ref={logContainerRef}
        className="h-48 sm:h-56 overflow-y-auto p-2.5 font-mono text-[11px] space-y-1.5 select-text bg-[#07070b]"
      >
        {filteredLogs.length === 0 ? (
          <div className="py-8 text-center text-gray-600">
            No matching log entries.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className="flex items-start gap-2 hover:bg-[#12121c] p-1 rounded transition group"
            >
              <span className="text-gray-500 text-[10px] shrink-0 font-mono select-none">
                [{log.timestamp}]
              </span>
              <span
                className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase shrink-0 border ${getBadgeColor(
                  log.type
                )}`}
              >
                {log.type}
              </span>
              <span className="text-gray-300 flex-1 leading-snug group-hover:text-white">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
