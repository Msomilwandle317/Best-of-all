import React from 'react';
import { Position, OrderDirection } from '../types/trading';
import { X, ShieldAlert, ArrowUpRight, ArrowDownRight, Edit3, AlertOctagon, TrendingUp, DollarSign } from 'lucide-react';

interface Props {
  positions: Position[];
  onClosePosition: (id: string) => void;
  onPartialClose: (id: string, ratio: number) => void;
  onCloseAll: () => void;
}

export const ActivePositionsMonitor: React.FC<Props> = ({
  positions,
  onClosePosition,
  onPartialClose,
  onCloseAll
}) => {
  const totalFloating = positions.reduce((acc, p) => acc + p.profit, 0);
  const totalLots = positions.reduce((acc, p) => acc + p.lotSize, 0);

  return (
    <div className="bg-[#0b0b10] border border-red-950/70 rounded-xl p-3 sm:p-4 space-y-3">
      {/* Header and Panic Kill Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-red-950/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-600/50">
            <TrendingUp className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold font-display uppercase tracking-wider text-white">
                Active Open Positions Monitor
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                {positions.length} ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono">
              Live MT4/MT5 position stream • Total Volume: {totalLots.toFixed(2)} Lots
            </p>
          </div>
        </div>

        {/* Global Position Summary & Panic Kill */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right font-mono pr-2">
            <span className="text-[9px] uppercase text-gray-400 block">Total Floating (ZAR)</span>
            <span className={`text-xs sm:text-sm font-black ${totalFloating >= 0 ? 'text-green-400 glow-green-text' : 'text-red-400 glow-red-text'}`}>
              {totalFloating >= 0 
                ? `+R ${totalFloating.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : `-R ${Math.abs(totalFloating).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
          </div>

          {positions.length > 0 && (
            <button
              onClick={onCloseAll}
              className="py-1.5 px-3 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/80 text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition active:scale-95 glow-red"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span>PANIC CLOSE ALL</span>
            </button>
          )}
        </div>
      </div>

      {/* Positions List */}
      {positions.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-gray-800 rounded-lg">
          <p className="text-xs font-mono text-gray-500">
            NO ACTIVE OPEN POSITIONS.
          </p>
          <p className="text-[10px] font-mono text-gray-600 mt-0.5">
            Press START EA for automated algorithmic execution, run code manually, or scan a chart.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {positions.map((pos) => {
            const isBuy = pos.direction === 'BUY';
            const isProfitable = pos.profit >= 0;

            return (
              <div
                key={pos.id}
                className="bg-[#101018] border border-red-950/50 hover:border-red-800/60 rounded-xl p-3 transition"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  {/* Left: Direction + Symbol + Ticket */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs font-mono ${
                        isBuy
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/60'
                          : 'bg-red-950 text-red-400 border border-red-700/60'
                      }`}
                    >
                      {isBuy ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black font-mono text-white">
                          {pos.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded uppercase ${
                            isBuy
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                              : 'bg-red-950/80 text-red-300 border border-red-800/40'
                          }`}
                        >
                          {pos.direction} {pos.lotSize.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          #{pos.ticket}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>Open: <strong className="text-gray-200">{pos.openPrice}</strong></span>
                        <span>•</span>
                        <span>Now: <strong className="text-gray-200">{pos.currentPrice}</strong></span>
                        <span>•</span>
                        <span>SL: {pos.stopLoss || 'NONE'}</span>
                        <span>•</span>
                        <span>TP: {pos.takeProfit || 'NONE'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Profit & Action Buttons */}
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end mt-1 sm:mt-0">
                    <div className="text-right font-mono">
                      <div className={`text-sm sm:text-base font-black ${
                        isProfitable ? 'text-green-400 glow-green-text' : 'text-red-400 glow-red-text'
                      }`}>
                        {isProfitable 
                          ? `+R ${pos.profit.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                          : `-R ${Math.abs(pos.profit).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </div>
                      <div className="text-[9px] text-gray-400">
                        {pos.pips >= 0 ? `+${pos.pips.toFixed(1)}` : pos.pips.toFixed(1)} pips
                      </div>
                    </div>

                    {/* Actions: Partial 50% and Close */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onPartialClose(pos.id, 0.5)}
                        className="text-[9px] font-mono px-2 py-1 rounded bg-[#181824] hover:bg-[#202032] text-gray-300 border border-gray-800 cursor-pointer transition"
                        title="Close 50% volume and secure profit"
                      >
                        CLOSE 50%
                      </button>

                      <button
                        onClick={() => onClosePosition(pos.id)}
                        className="p-1.5 rounded-lg bg-red-950/70 hover:bg-red-800 text-red-300 hover:text-white border border-red-700/60 cursor-pointer transition active:scale-90"
                        title="Close order completely"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub-bar: Execution origin tag */}
                <div className="mt-2 pt-1.5 border-t border-red-950/40 flex items-center justify-between text-[9px] font-mono text-gray-500">
                  <span>Source: <span className="text-gray-400 font-bold">{pos.source}</span> ({pos.comment})</span>
                  <span>Filled @ {pos.openTime} UTC</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
