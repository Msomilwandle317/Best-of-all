import React from 'react';
import { ASSETS } from '../assets/assetPaths';
import { Shield, Wifi, AlertTriangle, Play, Square, Server } from 'lucide-react';
import { BrokerConfig } from '../types/trading';

interface Props {
  eaRunning: boolean;
  onToggleEA: () => void;
  broker: BrokerConfig;
  onOpenBrokerModal: () => void;
  activePositionsCount: number;
  totalFloatingPnL: number;
  onOpenAIHelper: () => void;
}

export const Navbar: React.FC<Props> = ({
  eaRunning,
  onToggleEA,
  broker,
  onOpenBrokerModal,
  activePositionsCount,
  totalFloatingPnL,
  onOpenAIHelper,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0e]/95 backdrop-blur-md border-b border-red-950/60 px-3 py-2.5 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden border border-red-600/70 shadow-md shadow-red-950/80 bg-black flex items-center justify-center">
              <img
                src={ASSETS.logo}
                alt="KILL CHART"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            {/* Live Indicator Dot */}
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0e] ${
                eaRunning ? 'bg-green-500 animate-ping' : 'bg-red-500'
              }`}
            />
            <span
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0e] ${
                eaRunning ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-black tracking-wider font-display uppercase bg-gradient-to-r from-red-500 via-red-400 to-rose-200 bg-clip-text text-transparent">
                KILL CHART
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40 font-mono">
                EA v4.2
              </span>
            </div>
            <p className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              {eaRunning ? (
                <span className="text-green-400 font-bold">ALGO RUNNING (12ms)</span>
              ) : (
                <span className="text-red-400 font-bold">EXECUTION PAUSED</span>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right Quick Stats & Controls */}
        <div className="flex items-center gap-2">
          {/* Floating PnL badge */}
          <div className="hidden sm:flex flex-col items-end px-2.5 py-1 rounded bg-[#111118] border border-red-900/30 font-mono">
            <span className="text-[9px] uppercase tracking-wider text-gray-400">Floating P&L (ZAR)</span>
            <span className={`text-xs font-bold ${totalFloatingPnL >= 0 ? 'text-green-400 glow-green-text' : 'text-red-400 glow-red-text'}`}>
              {totalFloatingPnL >= 0 
                ? `+R ${totalFloatingPnL.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : `-R ${Math.abs(totalFloatingPnL).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>

          {/* AI Helper Quick Trigger Button in Navbar */}
          <button
            onClick={onOpenAIHelper}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-950/80 to-[#180a0e] hover:from-red-900/90 hover:to-[#220c14] border border-red-600/70 text-red-200 hover:text-white transition cursor-pointer shadow-md shadow-red-950 active:scale-95"
            title="Open KILL CHART AI Trading Helper"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-bold font-display uppercase tracking-wider">AI HELPER</span>
          </button>

          {/* Broker Server Status Pill */}
          <button
            onClick={onOpenBrokerModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14141c] hover:bg-[#1c1c28] border border-red-950/80 hover:border-red-700/60 transition text-left cursor-pointer"
            title="Configure Broker Server & MT4/MT5 API"
          >
            <Server className={`w-3.5 h-3.5 ${broker.connected ? 'text-green-400' : 'text-red-500'}`} />
            <div className="hidden xs:block">
              <div className="text-[10px] font-bold text-gray-200 truncate max-w-[85px] sm:max-w-[120px]">
                {broker.server || 'No Broker'}
              </div>
              <div className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full ${broker.connected ? 'bg-green-400' : 'bg-red-500'}`} />
                {broker.connected ? `${broker.platform} • ${broker.pingMs}ms` : 'Disconnected'}
              </div>
            </div>
          </button>

          {/* Quick Header START/STOP Trigger */}
          <button
            onClick={onToggleEA}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-display text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
              eaRunning
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/50 glow-red'
                : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-950/80 border border-red-500/40'
            }`}
          >
            {eaRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current animate-pulse text-white" />
                <span>STOP EA</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>START EA</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

