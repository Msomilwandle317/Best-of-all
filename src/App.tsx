import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { EACockpit } from './components/EACockpit';
import { CodeExecutionConsole } from './components/CodeExecutionConsole';
import { ChartScanner } from './components/ChartScanner';
import { ActivePositionsMonitor } from './components/ActivePositionsMonitor';
import { RealTimeTerminalLog } from './components/RealTimeTerminalLog';
import { TradeHistoryView } from './components/TradeHistoryView';
import { BrokerManagerModal } from './components/BrokerManagerModal';
import { AIHelperDrawer } from './components/AIHelperDrawer';
import {
  INITIAL_TICKERS,
  INITIAL_POSITIONS,
  INITIAL_HISTORY,
  INITIAL_LOGS,
  DEFAULT_BROKER
} from './data/mockMarket';
import {
  MarketTicker,
  Position,
  TradeHistoryItem,
  LogEntry,
  BrokerConfig,
  OrderDirection,
  ExecutionMode,
  ChartScanResult
} from './types/trading';
import {
  Activity,
  Code2,
  Scan,
  TrendingUp,
  History,
  Shield,
  Zap,
  Terminal,
  Server,
  Layers,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Play,
  Square,
  Bot
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cockpit' | 'code' | 'scanner' | 'positions' | 'history'>('cockpit');
  const [eaRunning, setEaRunning] = useState<boolean>(true);
  const [tickers, setTickers] = useState<MarketTicker[]>(INITIAL_TICKERS);
  const [positions, setPositions] = useState<Position[]>(INITIAL_POSITIONS);
  const [history, setHistory] = useState<TradeHistoryItem[]>(INITIAL_HISTORY);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [broker, setBroker] = useState<BrokerConfig>(DEFAULT_BROKER);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState<boolean>(false);
  const [isAIHelperOpen, setIsAIHelperOpen] = useState<boolean>(false);
  const [lastScanResult, setLastScanResult] = useState<ChartScanResult | null>(null);
  const [codeToLoad, setCodeToLoad] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ title: string; subtitle: string; type: 'SUCCESS' | 'ALERT' } | null>(null);


  // Show quick toast notification
  const showToast = (title: string, subtitle: string, type: 'SUCCESS' | 'ALERT' = 'SUCCESS') => {
    setToastMsg({ title, subtitle, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  // Add a log entry
  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-GB'),
      type,
      message,
      details
    };
    setLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // Toggle EA START / STOP
  const handleToggleEA = () => {
    const nextState = !eaRunning;
    setEaRunning(nextState);

    if (nextState) {
      addLog('SUCCESS', `KILL CHART EA Activated. High-frequency automated execution scanning ${tickers.length} markets.`);
      showToast('EA ALGORITHM ENGAGED', 'Automated trade execution is now active (12ms latency)', 'SUCCESS');
    } else {
      addLog('ALERT', 'KILL CHART EA Halted. Automated trade execution suspended by operator.');
      showToast('EA EXECUTION STOPPED', 'Automated algorithms paused. Manual execution remains operational.', 'ALERT');
    }
  };

  // Micro-fluctuation simulation of live market quotes and floating PnL
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers(prevTickers =>
        prevTickers.map(t => {
          const delta = (Math.random() - 0.49) * (t.digits > 2 ? 0.0003 : 0.4);
          const newBid = Math.max(0.001, Number((t.bid + delta).toFixed(t.digits)));
          const newAsk = Number((newBid + t.spread * (t.digits > 2 ? 0.0001 : 0.05)).toFixed(t.digits));
          return {
            ...t,
            bid: newBid,
            ask: newAsk
          };
        })
      );

      // Fluctuate positions' floating profit slightly (South African Rands)
      setPositions(prevPositions =>
        prevPositions.map(pos => {
          const deltaProfit = (Math.random() - 0.47) * 75.0 * pos.lotSize;
          const newProfit = Number((pos.profit + deltaProfit).toFixed(2));
          const newPips = Number((pos.pips + deltaProfit * 0.05).toFixed(1));
          return {
            ...pos,
            profit: newProfit,
            pips: newPips
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Periodic Automated Trade Trigger when EA is STARTed
  useEffect(() => {
    if (!eaRunning) return;

    const autoTradeTimer = setInterval(() => {
      // 35% chance to fire an automated algorithmic scalp
      if (Math.random() < 0.35 && positions.length < 5) {
        const symbols = ['XAUUSD', 'EURUSD', 'USDZAR', 'BTCUSD', 'NAS100'];
        const chosenSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const chosenDir: OrderDirection = Math.random() > 0.45 ? 'BUY' : 'SELL';
        const chosenLot = Number((0.20 + Math.random() * 0.40).toFixed(2));
        const ticket = Math.floor(88200000 + Math.random() * 99999);
        const ticker = tickers.find(t => t.symbol === chosenSymbol);
        const price = ticker ? (chosenDir === 'BUY' ? ticker.ask : ticker.bid) : 2380.0;

        const newPos: Position = {
          id: `pos-${Date.now()}`,
          ticket,
          symbol: chosenSymbol,
          direction: chosenDir,
          lotSize: chosenLot,
          openPrice: price,
          currentPrice: price,
          stopLoss: chosenDir === 'BUY' ? price * 0.99 : price * 1.01,
          takeProfit: chosenDir === 'BUY' ? price * 1.02 : price * 0.98,
          profit: 15.00,
          pips: 3.0,
          openTime: new Date().toLocaleTimeString('en-GB'),
          source: 'AUTO_EA',
          comment: 'KILL_ALGO_AUTO'
        };

        setPositions(prev => [newPos, ...prev]);
        addLog('TRADE', `[AUTO EA] Order #${ticket} Filled: ${chosenDir} ${chosenLot} ${chosenSymbol} @ ${price} via ${broker.platform} Bridge`);
      }
    }, 28000);

    return () => clearInterval(autoTradeTimer);
  }, [eaRunning, positions.length, tickers, broker.platform]);

  // Execute Code Order from the Manual Code Section
  const handleExecuteCodeOrder = (params: {
    symbol: string;
    direction: OrderDirection;
    lotSize: number;
    stopLoss?: number;
    takeProfit?: number;
    codeSnippet: string;
  }) => {
    const ticket = Math.floor(88300000 + Math.random() * 99999);
    const ticker = tickers.find(t => t.symbol === params.symbol);
    const price = ticker ? (params.direction === 'BUY' ? ticker.ask : ticker.bid) : 2380.00;

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      ticket,
      symbol: params.symbol,
      direction: params.direction,
      lotSize: params.lotSize,
      openPrice: price,
      currentPrice: price,
      stopLoss: params.stopLoss || (params.direction === 'BUY' ? price * 0.992 : price * 1.008),
      takeProfit: params.takeProfit || (params.direction === 'BUY' ? price * 1.018 : price * 0.982),
      profit: 0.00,
      pips: 0.0,
      openTime: new Date().toLocaleTimeString('en-GB'),
      source: 'MANUAL_CODE',
      comment: 'MQL_SCRIPT_EXEC'
    };

    setPositions(prev => [newPos, ...prev]);
    addLog('TRADE', `[CODE RUNNER] Order #${ticket} Executed: ${params.direction} ${params.lotSize} ${params.symbol} @ ${price} [${broker.platform} Bridge]`);
    showToast('CODE SCRIPT ORDER EXECUTED', `Ticket #${ticket}: ${params.direction} ${params.lotSize} ${params.symbol}`, 'SUCCESS');
  };

  // Fast Execute from Cockpit Tickers
  const handleFastExecute = (symbol: string, direction: OrderDirection, lotSize: number) => {
    const ticket = Math.floor(88400000 + Math.random() * 99999);
    const ticker = tickers.find(t => t.symbol === symbol);
    const price = ticker ? (direction === 'BUY' ? ticker.ask : ticker.bid) : 2380.00;

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      ticket,
      symbol,
      direction,
      lotSize,
      openPrice: price,
      currentPrice: price,
      stopLoss: direction === 'BUY' ? price * 0.994 : price * 1.006,
      takeProfit: direction === 'BUY' ? price * 1.015 : price * 0.985,
      profit: 0.00,
      pips: 0.0,
      openTime: new Date().toLocaleTimeString('en-GB'),
      source: 'AUTO_EA',
      comment: '1TAP_FAST_FIRE'
    };

    setPositions(prev => [newPos, ...prev]);
    addLog('TRADE', `[FAST FIRE] Ticket #${ticket}: ${direction} ${lotSize} ${symbol} @ ${price}`);
    showToast('FAST ORDER SENT', `Ticket #${ticket} ${direction} ${lotSize} ${symbol}`, 'SUCCESS');
  };

  // Execute Scanned Trade from Gemini Vision
  const handleExecuteScannedTrade = (params: {
    symbol: string;
    direction: OrderDirection;
    lotSize: number;
    stopLoss?: number;
    takeProfit?: number;
    source: 'CHART_SCANNER';
    summary: string;
  }) => {
    const ticket = Math.floor(88500000 + Math.random() * 99999);
    const ticker = tickers.find(t => t.symbol === params.symbol);
    const price = ticker ? (params.direction === 'BUY' ? ticker.ask : ticker.bid) : 2389.50;

    const newPos: Position = {
      id: `pos-${Date.now()}`,
      ticket,
      symbol: params.symbol,
      direction: params.direction,
      lotSize: params.lotSize,
      openPrice: price,
      currentPrice: price,
      stopLoss: params.stopLoss || price * 0.99,
      takeProfit: params.takeProfit || price * 1.02,
      profit: 10.00,
      pips: 2.0,
      openTime: new Date().toLocaleTimeString('en-GB'),
      source: 'CHART_SCANNER',
      comment: 'AI_VISION_FIRE'
    };

    setPositions(prev => [newPos, ...prev]);
    addLog('TRADE', `[CHART SCANNER] Signal Executed! Ticket #${ticket}: ${params.direction} ${params.lotSize} ${params.symbol} @ ${price}`);
    showToast('AI CHART SIGNAL EXECUTED', `Ticket #${ticket} fired based on Gemini Vision analysis`, 'SUCCESS');
    setActiveTab('positions');
  };

  // Close a single position
  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;

    const closePrice = pos.currentPrice;
    const isWin = pos.profit >= 0;

    const historyItem: TradeHistoryItem = {
      id: `hist-${Date.now()}`,
      ticket: pos.ticket,
      symbol: pos.symbol,
      direction: pos.direction,
      lotSize: pos.lotSize,
      openPrice: pos.openPrice,
      closePrice,
      profit: pos.profit,
      pips: pos.pips,
      openTime: pos.openTime,
      closeTime: new Date().toLocaleTimeString('en-GB'),
      source: pos.source,
      result: isWin ? 'WIN' : 'LOSS'
    };

    setPositions(prev => prev.filter(p => p.id !== id));
    setHistory(prev => [historyItem, ...prev]);

    // Update broker balance
    setBroker(prev => ({
      ...prev,
      balance: Number((prev.balance + pos.profit).toFixed(2)),
      equity: Number((prev.equity + pos.profit).toFixed(2))
    }));

    addLog(
      isWin ? 'SUCCESS' : 'WARNING',
      `Closed Ticket #${pos.ticket} (${pos.symbol} ${pos.direction}) PnL: ${pos.profit >= 0 ? '+' : '-'}R ${Math.abs(pos.profit).toLocaleString('en-ZA', { minimumFractionDigits: 2 })} (${pos.pips.toFixed(1)} pips)`
    );
    showToast('ORDER CLOSED', `Ticket #${pos.ticket} PnL: ${pos.profit >= 0 ? '+' : '-'}R ${Math.abs(pos.profit).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, isWin ? 'SUCCESS' : 'ALERT');
  };

  // Partial close 50%
  const handlePartialClose = (id: string, ratio: number = 0.5) => {
    setPositions(prev =>
      prev.map(p => {
        if (p.id === id) {
          const closedLots = Number((p.lotSize * ratio).toFixed(2));
          const realizedProfit = Number((p.profit * ratio).toFixed(2));
          const remainingLots = Number((p.lotSize - closedLots).toFixed(2));
          const remainingProfit = Number((p.profit - realizedProfit).toFixed(2));

          // Log and add to history
          addLog('SUCCESS', `Partial Close 50% on #${p.ticket}: Secured +R ${realizedProfit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} profit. Remaining: ${remainingLots} lots.`);
          showToast('PARTIAL CLOSE 50%', `Secured +R ${realizedProfit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })} profit into ZAR balance`, 'SUCCESS');

          setBroker(b => ({
            ...b,
            balance: Number((b.balance + realizedProfit).toFixed(2))
          }));

          return {
            ...p,
            lotSize: remainingLots,
            profit: remainingProfit
          };
        }
        return p;
      })
    );
  };

  // Panic Close All Positions
  const handleCloseAllPositions = () => {
    if (positions.length === 0) return;

    let totalPnL = 0;
    const closedItems: TradeHistoryItem[] = positions.map(pos => {
      totalPnL += pos.profit;
      return {
        id: `hist-${Date.now()}-${pos.id}`,
        ticket: pos.ticket,
        symbol: pos.symbol,
        direction: pos.direction,
        lotSize: pos.lotSize,
        openPrice: pos.openPrice,
        closePrice: pos.currentPrice,
        profit: pos.profit,
        pips: pos.pips,
        openTime: pos.openTime,
        closeTime: new Date().toLocaleTimeString('en-GB'),
        source: pos.source,
        result: pos.profit >= 0 ? 'WIN' : 'LOSS'
      };
    });

    setHistory(prev => [...closedItems, ...prev]);
    setPositions([]);
    setBroker(prev => ({
      ...prev,
      balance: Number((prev.balance + totalPnL).toFixed(2)),
      equity: Number((prev.equity + totalPnL).toFixed(2))
    }));

    addLog('ALERT', `PANIC CLOSE ALL EXECUTED: Liquidated ${positions.length} orders. Net PnL: ${totalPnL >= 0 ? '+' : '-'}R ${Math.abs(totalPnL).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`);
    showToast('ALL POSITIONS CLOSED', `Liquidated ${positions.length} positions. Net: ${totalPnL >= 0 ? '+' : '-'}R ${Math.abs(totalPnL).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`, 'ALERT');
  };

  // Save Broker Configuration
  const handleSaveBroker = async (newConfig: BrokerConfig): Promise<boolean> => {
    setBroker(newConfig);
    addLog('SUCCESS', `Broker link synchronized: ${newConfig.server} (${newConfig.platform} ${newConfig.accountType}). Ping: ${newConfig.pingMs}ms`);
    showToast('BROKER CONNECTED', `Logged into ${newConfig.server} securely`, 'SUCCESS');
    return true;
  };

  const totalFloatingPnL = positions.reduce((acc, p) => acc + p.profit, 0);

  return (
    <div className="min-h-screen bg-[#070709] text-gray-100 flex flex-col font-sans pb-20 sm:pb-6">
      {/* Top Navbar */}
      <Navbar
        eaRunning={eaRunning}
        onToggleEA={handleToggleEA}
        broker={broker}
        onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
        activePositionsCount={positions.length}
        totalFloatingPnL={totalFloatingPnL}
        onOpenAIHelper={() => setIsAIHelperOpen(true)}
      />

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 animate-in slide-in-from-top-3 duration-300">
          <div className={`px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 font-mono text-xs ${
            toastMsg.type === 'SUCCESS'
              ? 'bg-[#0f1712] border-emerald-600 text-emerald-200 shadow-emerald-950/80 glow-green-text'
              : 'bg-[#180a0e] border-red-600 text-red-200 shadow-red-950/80 glow-red'
          }`}>
            <span className={`w-2 h-2 rounded-full ${toastMsg.type === 'SUCCESS' ? 'bg-emerald-400' : 'bg-red-500'} animate-ping`} />
            <div>
              <div className="font-bold uppercase tracking-wider">{toastMsg.title}</div>
              <div className="text-[10px] text-gray-300 opacity-90">{toastMsg.subtitle}</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        {/* Desktop View Tab Selector */}
        <div className="hidden sm:flex items-center justify-between border-b border-red-950/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            {[
              { id: 'cockpit', label: 'EA Cockpit', icon: Layers },
              { id: 'code', label: 'Code Console & Lots', icon: Code2 },
              { id: 'scanner', label: 'AI Chart Scanner', icon: Scan },
              { id: 'positions', label: `Positions & Logs (${positions.length})`, icon: TrendingUp },
              { id: 'history', label: 'Trade History', icon: History }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-display text-xs font-bold uppercase tracking-wider transition cursor-pointer border ${
                    isActive
                      ? 'bg-red-950/80 text-white border-red-500 shadow-md shadow-red-950 glow-red'
                      : 'bg-[#0d0d14] text-gray-400 border-gray-900 hover:text-gray-200 hover:border-gray-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-gray-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Broker Connect Button */}
          <button
            onClick={() => setIsBrokerModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#14141e] hover:bg-[#1c1c2a] border border-red-900/40 text-[11px] font-mono text-gray-300 hover:text-white transition cursor-pointer"
          >
            <Server className="w-3.5 h-3.5 text-red-400" />
            <span>MT4/MT5 Config</span>
          </button>
        </div>

        {/* Tab 1: EA Cockpit */}
        {activeTab === 'cockpit' && (
          <div className="space-y-4">
            <EACockpit
              eaRunning={eaRunning}
              onToggleEA={handleToggleEA}
              tickers={tickers}
              positions={positions}
              broker={broker}
              onFastExecute={handleFastExecute}
              onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
            />

            {/* Quick Live Positions summary directly in Cockpit */}
            <ActivePositionsMonitor
              positions={positions}
              onClosePosition={handleClosePosition}
              onPartialClose={handlePartialClose}
              onCloseAll={handleCloseAllPositions}
            />

            {/* Real-time Position Log stream */}
            <RealTimeTerminalLog
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>
        )}

        {/* Tab 2: Manual Code Console */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <CodeExecutionConsole
              onExecuteCodeOrder={handleExecuteCodeOrder}
              brokerConnected={broker.connected}
              accountBalance={broker.balance}
              currencySymbol={broker.currencySymbol || 'R'}
              externalCodeSnippet={codeToLoad}
              onOpenAIHelper={() => setIsAIHelperOpen(true)}
            />

            {/* Also show live positions below code console so user immediately sees their orders */}
            <ActivePositionsMonitor
              positions={positions}
              onClosePosition={handleClosePosition}
              onPartialClose={handlePartialClose}
              onCloseAll={handleCloseAllPositions}
            />
          </div>
        )}

        {/* Tab 3: AI Candlestick Chart Scanner */}
        {activeTab === 'scanner' && (
          <div className="space-y-4">
            <ChartScanner
              onExecuteScannedTrade={(params) => {
                handleExecuteScannedTrade(params);
                setLastScanResult({
                  symbol: params.symbol,
                  trend: params.direction === 'BUY' ? 'UPTREND' : 'DOWNTREND',
                  signal: params.direction,
                  confidence: 96,
                  currentPrice: params.direction === 'BUY' ? '2389.50' : '2364.00',
                  entryPrice: params.direction === 'BUY' ? '2389.50' : '2364.00',
                  stopLoss: (params.stopLoss || 0).toString(),
                  takeProfit1: (params.takeProfit || 0).toString(),
                  riskReward: '1:2.8',
                  suggestedLotSize: params.lotSize,
                  marketSummary: params.summary,
                  reasons: ['High probability structural breakout confirmed', 'Order Block demand holding firmly']
                });
              }}
              brokerConnected={broker.connected}
              onOpenAIHelper={() => setIsAIHelperOpen(true)}
            />

            <ActivePositionsMonitor
              positions={positions}
              onClosePosition={handleClosePosition}
              onPartialClose={handlePartialClose}
              onCloseAll={handleCloseAllPositions}
            />
          </div>
        )}

        {/* Tab 4: Active Positions Monitor & Real-Time Terminal Log */}
        {activeTab === 'positions' && (
          <div className="space-y-4">
            <ActivePositionsMonitor
              positions={positions}
              onClosePosition={handleClosePosition}
              onPartialClose={handlePartialClose}
              onCloseAll={handleCloseAllPositions}
            />

            <RealTimeTerminalLog
              logs={logs}
              onClearLogs={() => setLogs([])}
            />
          </div>
        )}

        {/* Tab 5: Trade History View */}
        {activeTab === 'history' && (
          <TradeHistoryView history={history} />
        )}
      </main>

      {/* Floating Tactical AI Helper Trigger Button */}
      <button
        onClick={() => setIsAIHelperOpen(true)}
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-display text-xs font-bold uppercase tracking-wider shadow-2xl shadow-red-950 border border-red-400/60 transition cursor-pointer active:scale-95 glow-red group"
        title="Open KILL CHART AI Trading Copilot"
      >
        <div className="relative">
          <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1 animate-ping" />
        </div>
        <span className="hidden xs:inline">KILL AI HELPER</span>
      </button>

      {/* AI Helper Institutional Drawer */}
      <AIHelperDrawer
        isOpen={isAIHelperOpen}
        onClose={() => setIsAIHelperOpen(false)}
        broker={broker}
        positions={positions}
        lastScanResult={lastScanResult}
        onExecuteTrade={(params) => {
          handleFastExecute(params.symbol, params.direction, params.lotSize);
        }}
        onLoadCodeToConsole={(code) => {
          setCodeToLoad(code);
          setActiveTab('code');
          showToast('MQL5 CODE LOADED', 'Copied algorithm into Code Console', 'SUCCESS');
        }}
      />

      {/* Broker Server Connection Modal */}
      <BrokerManagerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        broker={broker}
        onSaveBroker={handleSaveBroker}
      />

      {/* Mobile Bottom Navigation Bar (Stick to bottom on small viewports) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#09090d]/95 backdrop-blur-lg border-t border-red-950/80 px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'cockpit', label: 'COCKPIT', icon: Layers },
          { id: 'code', label: 'CODE EA', icon: Code2 },
          { id: 'scanner', label: 'AI SCAN', icon: Scan },
          { id: 'positions', label: `POSITIONS (${positions.length})`, icon: TrendingUp },
          { id: 'history', label: 'HISTORY', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition cursor-pointer min-w-[58px] ${
                isActive
                  ? 'text-red-400 font-bold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-red-500 scale-110' : 'text-gray-500'}`} />
              <span className="text-[9px] font-display tracking-tight uppercase">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-red-500 mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
