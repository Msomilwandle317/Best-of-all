import React, { useState, useEffect } from 'react';
import { Play, Square, Shield, Zap, TrendingUp, TrendingDown, Target, Activity, Flame, DollarSign, Layers } from 'lucide-react';
import { MarketTicker, Position, BrokerConfig, OrderDirection } from '../types/trading';

interface Props {
  eaRunning: boolean;
  onToggleEA: () => void;
  tickers: MarketTicker[];
  positions: Position[];
  broker: BrokerConfig;
  onFastExecute: (symbol: string, direction: OrderDirection, lotSize: number) => void;
  onOpenBrokerModal: () => void;
}

export const EACockpit: React.FC<Props> = ({
  eaRunning,
  onToggleEA,
  tickers,
  positions,
  broker,
  onFastExecute,
  onOpenBrokerModal
}) => {
  const [fastLot, setFastLot] = useState<number>(0.50);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Sniper Liquidity Sweep');
  const [heartbeatCount, setHeartbeatCount] = useState<number>(1420);

  // Live algorithmic ticks counter simulation when EA is running
  useEffect(() => {
    if (!eaRunning) return;
    const interval = setInterval(() => {
      setHeartbeatCount(prev => prev + 1);
    }, 800);
    return () => clearInterval(interval);
  }, [eaRunning]);

  const totalFloating = positions.reduce((acc, p) => acc + p.profit, 0);

  return (
    <div className="space-y-4">
      {/* Top Combat Pulse Banner */}
      <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-500 ${
        eaRunning 
          ? 'bg-gradient-to-r from-[#12080a] via-[#1a0a0d] to-[#0d0d12] border-red-600/80 shadow-xl shadow-red-950/60 glow-red' 
          : 'bg-[#0e0e14] border-gray-800/80'
      }`}>
        {/* Cyber grid subtle background */}
        <div className="absolute inset-0 bg-cyber-grid opacity-30 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase ${
                eaRunning 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${eaRunning ? 'bg-red-500 animate-ping' : 'bg-gray-500'}`} />
                {eaRunning ? 'ALGO RUNNING • ACTIVE HUNT' : 'SYSTEM STANDBY'}
              </span>

              <span className="text-xs text-gray-400 font-mono hidden md:inline">
                {broker.platform} Bridge: <span className="text-gray-200">{broker.connected ? `${broker.server}` : 'DISCONNECTED'}</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-display tracking-wide uppercase text-white flex items-center justify-center sm:justify-start gap-2">
              <span>KILL CHART MOBILE EA</span>
              {eaRunning && <Flame className="w-5 h-5 text-red-500 animate-bounce" />}
            </h2>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {eaRunning 
                ? `Scanning institutional liquidity blocks • Ticks Analyzed: #${heartbeatCount} • Latency: ${broker.pingMs}ms` 
                : 'Automated execution stopped. Tap START to engage institutional algorithms or fire manually.'}
            </p>
          </div>

          {/* THE GIANT START / STOP TACTICAL BUTTON */}
          <div className="w-full sm:w-auto flex flex-col items-center">
            <button
              onClick={onToggleEA}
              className={`w-full sm:w-64 py-4 px-6 rounded-xl font-display font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-300 transform active:scale-95 cursor-pointer relative overflow-hidden flex items-center justify-center gap-3 shadow-2xl ${
                eaRunning
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white border-2 border-red-400/80 glow-red-lg'
                  : 'bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white border-2 border-red-500/60 shadow-red-950/90'
              }`}
            >
              {eaRunning ? (
                <>
                  <div className="relative">
                    <Square className="w-6 h-6 fill-white text-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold leading-tight">STOP EA EXECUTION</div>
                    <div className="text-[10px] text-red-200 font-mono tracking-normal">HALT ALGORITHM TRADING</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Play className="w-6 h-6 fill-white text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-extrabold leading-tight">START EA EXECUTION</div>
                    <div className="text-[10px] text-red-100 font-mono tracking-normal">ENGAGE AUTOMATED TRADING</div>
                  </div>
                </>
              )}
            </button>
            <span className="text-[10px] text-gray-500 font-mono mt-1.5 flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-400" />
              Automated stop-out perimeter active
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health & Strategy Metrics Grid (South African Rands) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[#0c0c12] border border-red-950/60 rounded-xl p-3">
          <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider flex items-center justify-between">
            <span>Balance (ZAR)</span>
            <span className="text-[10px] font-bold text-red-400">R</span>
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-gray-100 mt-1">
            R {broker.balance.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            Leverage: {broker.leverage} • ZAR ECN
          </div>
        </div>

        <div className="bg-[#0c0c12] border border-red-950/60 rounded-xl p-3">
          <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider flex items-center justify-between">
            <span>Equity (ZAR)</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-white mt-1">
            R {(broker.balance + totalFloating).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            Free: R {broker.freeMargin.toLocaleString('en-ZA', { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div className="bg-[#0c0c12] border border-red-950/60 rounded-xl p-3">
          <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider flex items-center justify-between">
            <span>Floating P&L</span>
            <span className={`w-2 h-2 rounded-full ${totalFloating >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div className={`text-base sm:text-lg font-bold font-mono mt-1 ${totalFloating >= 0 ? 'text-green-400 glow-green-text' : 'text-red-400 glow-red-text'}`}>
            {totalFloating >= 0 
              ? `+R ${totalFloating.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
              : `-R ${Math.abs(totalFloating).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            {positions.length} active position{positions.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="bg-[#0c0c12] border border-red-950/60 rounded-xl p-3">
          <div className="text-[10px] font-mono uppercase text-gray-400 tracking-wider flex items-center justify-between">
            <span>Win Rate</span>
            <Target className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-base sm:text-lg font-bold font-mono text-red-400 mt-1">
            83.3%
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            Profit Factor: 4.12
          </div>
        </div>
      </div>

      {/* Algorithmic Mode Selection */}
      <div className="bg-[#0b0b10] border border-red-950/70 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            <span className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-gray-200">
              Active Algorithm Matrix
            </span>
          </div>
          <span className="text-[10px] font-mono text-gray-400">
            {broker.platform} Bridge: <span className="text-green-400 font-bold">READY (MT5 • MT4 • cTrader • TV • MetaApi • Deriv)</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            {
              id: 'Sniper Liquidity Sweep',
              name: 'Sniper Liquidity Sweep',
              desc: 'Identifies FVG gaps and hunts market stop-outs',
              tag: '1:3 RR'
            },
            {
              id: 'London Breakout Scalper',
              name: 'London Breakout Scalper',
              desc: 'Explosive high-volume range expansion trigger',
              tag: 'High Freq'
            },
            {
              id: 'Trend Momentum Rider',
              name: 'Trend Momentum Rider',
              desc: 'Multi-timeframe EMA 50/200 crossover system',
              tag: 'Safe Trend'
            }
          ].map(strat => (
            <button
              key={strat.id}
              onClick={() => setSelectedStrategy(strat.id)}
              className={`p-2.5 rounded-lg text-left transition border cursor-pointer ${
                selectedStrategy === strat.id
                  ? 'bg-red-950/40 border-red-600/80 text-white shadow-md shadow-red-950/40'
                  : 'bg-[#12121a] border-gray-800/80 hover:border-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display">{strat.name}</span>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-black/60 text-red-400 border border-red-900/40">
                  {strat.tag}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 font-mono">
                {strat.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Live Market Watch & Fast Fire Terminal */}
      <div className="bg-[#0b0b10] border border-red-950/70 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            <h3 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-gray-200">
              Live Market Tickers & 1-Tap Fast Fire
            </h3>
          </div>

          {/* Quick Fast Lot Selector */}
          <div className="flex items-center gap-1.5 bg-[#14141c] px-2 py-1 rounded-lg border border-red-900/40">
            <span className="text-[10px] text-gray-400 font-mono">LOT:</span>
            {[0.10, 0.50, 1.00].map(size => (
              <button
                key={size}
                onClick={() => setFastLot(size)}
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition ${
                  fastLot === size
                    ? 'bg-red-600 text-white font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {size.toFixed(2)}
              </button>
            ))}
          </div>
        </div>

        {/* Ticker Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tickers.map(ticker => (
            <div
              key={ticker.symbol}
              className="bg-[#121218] border border-red-950/40 hover:border-red-800/60 rounded-lg p-2.5 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black font-mono text-white tracking-wider">
                      {ticker.symbol}
                    </span>
                    <span className="text-[9px] text-gray-500 font-mono">
                      {ticker.spread.toFixed(1)} pip spread
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 truncate block max-w-[120px]">
                    {ticker.name}
                  </span>
                </div>

                <div className={`text-right font-mono ${ticker.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="text-xs font-bold flex items-center justify-end gap-0.5">
                    {ticker.changePercent >= 0 ? (
                      <TrendingUp className="w-3 h-3 inline" />
                    ) : (
                      <TrendingDown className="w-3 h-3 inline" />
                    )}
                    {ticker.changePercent >= 0 ? `+${ticker.changePercent}%` : `${ticker.changePercent}%`}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    H: {ticker.high24h.toFixed(ticker.digits > 2 ? 4 : 2)}
                  </div>
                </div>
              </div>

              {/* Live Prices and Fast Fire Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => onFastExecute(ticker.symbol, 'SELL', fastLot)}
                  className="py-1.5 px-2 rounded bg-gradient-to-r from-red-950 to-red-900/80 hover:from-red-900 hover:to-red-800 text-red-200 border border-red-700/60 hover:border-red-500 font-mono text-left transition cursor-pointer active:scale-95 group"
                >
                  <div className="flex items-center justify-between text-[9px] font-bold text-red-400">
                    <span>SELL / SHORT</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">▼</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {ticker.bid.toFixed(ticker.digits)}
                  </div>
                </button>

                <button
                  onClick={() => onFastExecute(ticker.symbol, 'BUY', fastLot)}
                  className="py-1.5 px-2 rounded bg-gradient-to-r from-emerald-950 to-green-900/80 hover:from-green-900 hover:to-green-800 text-green-200 border border-green-700/60 hover:border-green-500 font-mono text-left transition cursor-pointer active:scale-95 group"
                >
                  <div className="flex items-center justify-between text-[9px] font-bold text-green-400">
                    <span>BUY / LONG</span>
                    <span className="group-hover:-translate-y-0.5 transition-transform">▲</span>
                  </div>
                  <div className="text-xs font-bold text-white mt-0.5">
                    {ticker.ask.toFixed(ticker.digits)}
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
