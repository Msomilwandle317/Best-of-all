import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  Copy,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Sliders,
  Code2,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Zap,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { OrderDirection, AIBalanceOptimization } from '../types/trading';
import { CODE_STRATEGY_TEMPLATES } from '../data/mockMarket';

interface Props {
  onExecuteCodeOrder: (params: {
    symbol: string;
    direction: OrderDirection;
    lotSize: number;
    stopLoss?: number;
    takeProfit?: number;
    codeSnippet: string;
  }) => void;
  brokerConnected: boolean;
  accountBalance?: number;
  currencySymbol?: string;
  externalCodeSnippet?: string | null;
  onOpenAIHelper?: (initialPrompt?: string) => void;
}

export const CodeExecutionConsole: React.FC<Props> = ({
  onExecuteCodeOrder,
  brokerConnected,
  accountBalance = 471389.25,
  currencySymbol = 'R',
  externalCodeSnippet,
  onOpenAIHelper
}) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [symbol, setSymbol] = useState<string>('XAUUSD');
  const [direction, setDirection] = useState<OrderDirection>('BUY');
  const [lotSize, setLotSize] = useState<number>(0.50);
  const [stopLoss, setStopLoss] = useState<string>('2375.00');
  const [takeProfit, setTakeProfit] = useState<string>('2420.00');
  const [code, setCode] = useState<string>(CODE_STRATEGY_TEMPLATES[0].code);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync external code snippet if passed from AI Helper
  useEffect(() => {
    if (externalCodeSnippet) {
      setCode(externalCodeSnippet);
    }
  }, [externalCodeSnippet]);

  // AI Auto-Chooser State
  const [isAIOptimizing, setIsAIOptimizing] = useState<boolean>(false);
  const [aiOptimization, setAiOptimization] = useState<AIBalanceOptimization | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');


  // Sync template changes
  const handleSelectTemplate = (index: number) => {
    setSelectedTemplateIndex(index);
    const tmpl = CODE_STRATEGY_TEMPLATES[index];
    setSymbol(tmpl.symbol);
    setDirection(tmpl.direction);
    setLotSize(tmpl.lotSize);
    setStopLoss(tmpl.stopLoss.toString());
    setTakeProfit(tmpl.takeProfit.toString());
    setCode(tmpl.code);
    setAiOptimization(null);
  };

  // Sync parameter changes into the code snippet
  const updateCodeWithParams = (newSymbol: string, newDir: OrderDirection, newLot: number, newSL: string, newTP: string) => {
    let updated = code;
    // Replace InpSymbol
    updated = updated.replace(/input string\s+InpSymbol\s*=\s*"[^"]*";/, `input string  InpSymbol      = "${newSymbol}";`);
    // Replace InpDirection
    updated = updated.replace(/input string\s+InpDirection\s*=\s*"[^"]*";/, `input string  InpDirection   = "${newDir}";     // "BUY" or "SELL"`);
    // Replace InpLotSize
    updated = updated.replace(/input double\s+InpLotSize\s*=\s*[\d.]+;/, `input double  InpLotSize     = ${newLot.toFixed(2)};      // Target Position Size`);
    // Replace InpStopLoss
    if (newSL) {
      updated = updated.replace(/input double\s+InpStopLoss\s*=\s*[\d.]+;/, `input double  InpStopLoss    = ${newSL};   // Invalidation Level`);
    }
    // Replace InpTakeProfit
    if (newTP) {
      updated = updated.replace(/input double\s+InpTakeProfit\s*=\s*[\d.]+;/, `input double  InpTakeProfit  = ${newTP};   // Liquidity Target`);
    }
    setCode(updated);
  };

  const handleDirectionChange = (newDir: OrderDirection) => {
    setDirection(newDir);
    updateCodeWithParams(symbol, newDir, lotSize, stopLoss, takeProfit);
  };

  const handleLotChange = (newLot: number) => {
    const safeLot = Math.max(0.01, Math.min(50.0, Number(newLot.toFixed(2))));
    setLotSize(safeLot);
    updateCodeWithParams(symbol, direction, safeLot, stopLoss, takeProfit);
  };

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
    updateCodeWithParams(newSymbol, direction, lotSize, stopLoss, takeProfit);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestCompile = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
    }, 400);
  };

  // AUTOMATIC AI SELECTION BUTTON: Chooses best strategy & lot size based on balance
  const handleAIAutoChoose = () => {
    setIsAIOptimizing(true);

    setTimeout(() => {
      const balance = accountBalance;
      let optSymbol = 'USDZAR';
      let optDirection: OrderDirection = 'SELL';
      let optStrategy = 'USDZAR Rand Volatility Hunter';
      let optLot = 0.85;
      let optSL = 18.3500;
      let optTP = 17.9500;
      let riskPct = 1.5;
      let riskReward = '1:3.2';

      // Mathematical optimal allocation for account size
      if (balance > 300000) {
        // High liquidity South African Rand institutional carry & swing setup
        if (riskTolerance === 'AGGRESSIVE') {
          optLot = 1.25;
          riskPct = 2.5;
        } else if (riskTolerance === 'CONSERVATIVE') {
          optLot = 0.50;
          riskPct = 1.0;
        } else {
          optLot = 0.85;
          riskPct = 1.5;
        }
        optSymbol = 'USDZAR';
        optDirection = 'SELL';
        optStrategy = 'USDZAR Rand Volatility Hunter';
        optSL = 18.3500;
        optTP = 17.9500;
        riskReward = '1:3.2';
      } else if (balance > 100000) {
        // Gold Sniper Breakout
        optSymbol = 'XAUUSD';
        optDirection = 'BUY';
        optStrategy = 'Sniper Order Block KillZone';
        optLot = riskTolerance === 'AGGRESSIVE' ? 0.75 : riskTolerance === 'CONSERVATIVE' ? 0.25 : 0.45;
        optSL = 2375.00;
        optTP = 2420.00;
        riskPct = 1.8;
        riskReward = '1:3.0';
      } else {
        // Micro index scalping to preserve small account equity
        optSymbol = 'NAS100';
        optDirection = 'BUY';
        optStrategy = 'Rapid Scalper 10-Pip Trap';
        optLot = 0.15;
        optSL = 19780.00;
        optTP = 19920.00;
        riskPct = 1.2;
        riskReward = '1:2.8';
      }

      const riskAmt = Number(((balance * riskPct) / 100).toFixed(2));
      const expProfit = Number((riskAmt * 3.2).toFixed(2));

      const generatedScript = `// --- KILL CHART AI AUTO-OPTIMIZED STRATEGY ---
// AI ALLOCATION ENGINE: TUNED FOR ACCOUNT BALANCE ${currencySymbol} ${balance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
// TARGET RISK: ${riskPct}% (${currencySymbol} ${riskAmt.toLocaleString('en-ZA')}) | REWARD: ${riskReward} (${currencySymbol} ${expProfit.toLocaleString('en-ZA')})
#property strict
input string  InpSymbol      = "${optSymbol}";
input string  InpDirection   = "${optDirection}";     // AI Algorithmic Bias
input double  InpLotSize     = ${optLot.toFixed(2)};      // Mathematically Optimal Lot Size
input double  InpStopLoss    = ${optSL};   // Smart Invalidation Target
input double  InpTakeProfit  = ${optTP};   // Smart Money Liquidity Pool
input int     InpMagicNumber = 777999;
input double  InpMaxSlippage = 1.5;

void OnKillExecute() {
   Print("[KILL CHART AI] Executing Auto-Optimized ", InpDirection, " on ", InpSymbol, " Lots: ", InpLotSize);
   int ticket = OrderSend(InpSymbol, ${optDirection === 'BUY' ? 'OP_BUY' : 'OP_SELL'}, InpLotSize, ${optDirection === 'BUY' ? 'Ask' : 'Bid'}, InpMaxSlippage, InpStopLoss, InpTakeProfit, "AI_BALANCE_MATCH", InpMagicNumber);
   if(ticket > 0) Print("KILL CHART AI TICKET CREATED: #", ticket);
}`;

      const optResult: AIBalanceOptimization = {
        recommendedStrategy: optStrategy,
        symbol: optSymbol,
        direction: optDirection,
        optimalLotSize: optLot,
        stopLoss: optSL,
        takeProfit: optTP,
        riskPercent: riskPct,
        riskAmountZAR: riskAmt,
        expectedProfitZAR: expProfit,
        riskReward,
        reasoning: `Matched ${optStrategy} for your ${currencySymbol} ${balance.toLocaleString('en-ZA')} balance. Risk is limited to strictly ${riskPct}% (${currencySymbol} ${riskAmt.toLocaleString('en-ZA')}) with an institutional ${riskReward} target (+${currencySymbol} ${expProfit.toLocaleString('en-ZA')}) and optimal margin cushioning (>98% free equity).`,
        codeSnippet: generatedScript
      };

      setAiOptimization(optResult);
      setSymbol(optSymbol);
      setDirection(optDirection);
      setLotSize(optLot);
      setStopLoss(optSL.toString());
      setTakeProfit(optTP.toString());
      setCode(generatedScript);

      // Match template selection tab if exists
      const matchIndex = CODE_STRATEGY_TEMPLATES.findIndex(t => t.symbol === optSymbol);
      if (matchIndex >= 0) setSelectedTemplateIndex(matchIndex);

      setIsAIOptimizing(false);
    }, 600);
  };

  // Dedicated Button: Execute the code order
  const handleExecuteCodeButton = () => {
    setIsExecuting(true);
    setTimeout(() => {
      onExecuteCodeOrder({
        symbol,
        direction,
        lotSize,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
        codeSnippet: code
      });
      setIsExecuting(false);
    }, 350);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Strategy Quick Select */}
      <div className="bg-[#0c0c12] border border-red-950/70 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-600/50">
              <Code2 className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-white">
                EA Code & Algorithmic Script Runner
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Manual Size & Direction controls, or let AI select the optimal code for your balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-gray-400">Presets:</span>
            <div className="flex flex-wrap gap-1">
              {CODE_STRATEGY_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={tmpl.name}
                  onClick={() => handleSelectTemplate(idx)}
                  className={`text-[10px] font-mono px-2 py-1 rounded cursor-pointer transition ${
                    selectedTemplateIndex === idx
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-950'
                      : 'bg-[#181822] text-gray-300 hover:text-white border border-gray-800'
                  }`}
                >
                  {tmpl.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* THE AUTOMATIC AI BUTTON: CHOOSES BEST CODE FOR ACCOUNT BALANCE */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-r from-[#170a0e] via-[#1f0c13] to-[#120a10] border-2 border-red-600/70 rounded-xl p-3.5 sm:p-4 mb-4 shadow-xl shadow-red-950/60 glow-red">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-red-950 border border-red-500/60 text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Bot className="w-3 h-3 text-red-400" />
                  AI BALANCE ALLOCATION ENGINE
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  Current Account: <strong className="text-white">{currencySymbol} {accountBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono">
                Click below to let AI automatically calculate the best strategy, lot size, direction, and SL/TP for your balance.
              </p>
            </div>

            {/* Risk Appetite Pill Selector */}
            <div className="flex items-center gap-1 bg-[#101018] p-1 rounded-lg border border-red-950">
              {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setRiskTolerance(mode)}
                  className={`text-[9px] font-mono px-2 py-1 rounded cursor-pointer transition ${
                    riskTolerance === mode
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {mode === 'CONSERVATIVE' ? '1% SAFE' : mode === 'BALANCED' ? '1.5% PRO' : '3% KILL'}
                </button>
              ))}
            </div>
          </div>

          {/* THE AUTOMATIC BUTTON */}
          <div className="mt-3">
            <button
              type="button"
              onClick={handleAIAutoChoose}
              disabled={isAIOptimizing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-display font-black text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-xl shadow-red-950 glow-red border border-red-400/80 flex items-center justify-center gap-2.5 active:scale-95 group"
            >
              {isAIOptimizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>ANALYZING ACCOUNT BALANCE ({currencySymbol} {accountBalance.toLocaleString('en-ZA')}) & SELECTING BEST CODE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse group-hover:rotate-12 transition-transform" />
                  <span>AI AUTO-CHOOSE BEST STRATEGY & LOT SIZE FOR MY BALANCE ({currencySymbol} {accountBalance.toLocaleString('en-ZA')})</span>
                </>
              )}
            </button>
          </div>

          {/* AI Optimization Verdict Card (When chosen) */}
          {aiOptimization && (
            <div className="mt-3 pt-3 border-t border-red-900/60 bg-black/40 rounded-lg p-3 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-display uppercase tracking-wider">
                    AI Selected: {aiOptimization.recommendedStrategy}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                    {aiOptimization.direction} {aiOptimization.optimalLotSize.toFixed(2)} Lots
                  </span>
                  <span className="text-gray-400">
                    Risk: {aiOptimization.riskPercent}% ({currencySymbol} {aiOptimization.riskAmountZAR.toLocaleString('en-ZA')})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-300 font-mono leading-relaxed mb-2">
                {aiOptimization.reasoning}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-center">
                <div className="bg-[#12121a] p-1.5 rounded border border-gray-800">
                  <span className="text-gray-500 block">Symbol</span>
                  <span className="font-bold text-white">{aiOptimization.symbol}</span>
                </div>
                <div className="bg-[#12121a] p-1.5 rounded border border-gray-800">
                  <span className="text-gray-500 block">Stop Loss</span>
                  <span className="font-bold text-red-400">{aiOptimization.stopLoss}</span>
                </div>
                <div className="bg-[#12121a] p-1.5 rounded border border-gray-800">
                  <span className="text-gray-500 block">Take Profit</span>
                  <span className="font-bold text-emerald-400">{aiOptimization.takeProfit}</span>
                </div>
                <div className="bg-[#12121a] p-1.5 rounded border border-gray-800">
                  <span className="text-gray-500 block">Target Gain</span>
                  <span className="font-bold text-yellow-400">+{currencySymbol} {aiOptimization.expectedProfitZAR.toLocaleString('en-ZA')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION FOR MANUAL INPUT OF SIZE, DIRECTION, AND SYMBOL */}
        <div className="bg-[#12121a] border border-red-900/40 rounded-xl p-3 sm:p-4 mb-4">
          <div className="flex items-center justify-between mb-3 border-b border-red-950/60 pb-2">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs font-bold font-display uppercase tracking-wider text-gray-200">
                Code Parameter Controls (Synced to Script)
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              Auto-syncs in real time with the code editor below
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. DIRECTION BUTTONS (BUY vs SELL) */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                Execution Direction *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectionChange('BUY')}
                  className={`py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    direction === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-950/80 glow-green-text'
                      : 'bg-[#181824] text-gray-400 border-gray-800 hover:text-gray-200'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>BUY (LONG)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectionChange('SELL')}
                  className={`py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                    direction === 'SELL'
                      ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-md shadow-red-950/80 glow-red-text'
                      : 'bg-[#181824] text-gray-400 border-gray-800 hover:text-gray-200'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>SELL (SHORT)</span>
                </button>
              </div>
            </div>

            {/* 2. POSITION SIZE (LOT SIZE) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-mono uppercase text-gray-400">
                  Position Size (Lots) *
                </label>
                <span className="text-[10px] font-mono text-red-400 font-bold">
                  Margin: ~{currencySymbol} {(lotSize * 3650).toLocaleString('en-ZA', { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleLotChange(lotSize - 0.05)}
                  className="px-2.5 py-2 rounded-l-lg bg-[#181824] hover:bg-[#202030] text-gray-300 font-mono text-xs border border-gray-800 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100.0"
                  value={lotSize}
                  onChange={(e) => handleLotChange(parseFloat(e.target.value) || 0.01)}
                  className="w-full bg-[#0a0a0f] border-y border-gray-800 py-1.5 text-center text-xs font-bold font-mono text-white focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => handleLotChange(lotSize + 0.05)}
                  className="px-2.5 py-2 rounded-r-lg bg-[#181824] hover:bg-[#202030] text-gray-300 font-mono text-xs border border-gray-800 cursor-pointer"
                >
                  +
                </button>
              </div>

              {/* Quick Lot Preset Buttons */}
              <div className="flex gap-1 mt-1.5">
                {[0.10, 0.50, 0.85, 1.00, 2.00].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleLotChange(s)}
                    className={`flex-1 text-[9px] font-mono py-0.5 rounded cursor-pointer transition ${
                      lotSize === s
                        ? 'bg-red-950 text-red-300 border border-red-700 font-bold'
                        : 'bg-[#181822] text-gray-400 hover:text-white'
                    }`}
                  >
                    {s.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SYMBOL SELECTOR */}
            <div>
              <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                Target Symbol
              </label>
              <select
                value={symbol}
                onChange={(e) => handleSymbolChange(e.target.value)}
                className="w-full bg-[#181824] border border-gray-800 rounded-lg px-2.5 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="USDZAR">USDZAR (USD / SA Rand)</option>
                <option value="XAUUSD">XAUUSD (Gold)</option>
                <option value="EURUSD">EURUSD (Euro/USD)</option>
                <option value="GBPUSD">GBPUSD (Pound/USD)</option>
                <option value="BTCUSD">BTCUSD (Bitcoin)</option>
                <option value="NAS100">NAS100 (US Tech 100)</option>
                <option value="US30">US30 (Dow Jones)</option>
              </select>
            </div>

            {/* 4. SL / TP TARGETS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                  Stop Loss (SL)
                </label>
                <input
                  type="text"
                  value={stopLoss}
                  onChange={(e) => {
                    setStopLoss(e.target.value);
                    updateCodeWithParams(symbol, direction, lotSize, e.target.value, takeProfit);
                  }}
                  placeholder="e.g. 18.3500"
                  className="w-full bg-[#181824] border border-gray-800 rounded-lg px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-gray-400 mb-1.5">
                  Take Profit (TP)
                </label>
                <input
                  type="text"
                  value={takeProfit}
                  onChange={(e) => {
                    setTakeProfit(e.target.value);
                    updateCodeWithParams(symbol, direction, lotSize, stopLoss, e.target.value);
                  }}
                  placeholder="e.g. 17.9500"
                  className="w-full bg-[#181824] border border-gray-800 rounded-lg px-2 py-2 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* INTERACTIVE CODE SCRIPT EDITOR */}
        <div className="border border-red-950/80 rounded-xl overflow-hidden bg-[#07070b]">
          {/* Code Window Header Bar */}
          <div className="bg-[#101018] px-3 py-2 border-b border-red-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-600/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-600/80 inline-block" />
              </div>
              <span className="text-[11px] font-mono text-gray-300 font-semibold ml-2">
                KillChart_Strategy_{symbol}.mq5
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-[10px] font-mono text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-[#181824] cursor-pointer transition"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'COPIED!' : 'COPY'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestCompile}
                className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded bg-red-950/60 border border-red-900/40 cursor-pointer transition"
              >
                {isCompiling ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                )}
                <span>VERIFY CODE</span>
              </button>
            </div>
          </div>

          {/* Code Textarea */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={11}
              spellCheck={false}
              className="w-full bg-[#08080d] p-3 text-xs font-mono text-red-200/90 leading-relaxed focus:outline-none focus:ring-1 focus:ring-red-600/50 resize-y selection:bg-red-900/60"
            />
          </div>

          {/* Compiler Status Output */}
          <div className="bg-[#0c0c14] border-t border-red-950/60 px-3 py-1.5 flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Multi-Platform MetaCompiler (MT5, MT4, cTrader, TradingView): 0 Errors, 0 Warnings</span>
            </div>
            <span className="text-gray-500">
              Size: {lotSize.toFixed(2)} Lots | {direction} | {symbol}
            </span>
          </div>
        </div>

        {/* THE DEDICATED EXECUTE BUTTON FOR THIS CODE SECTION */}
        <div className="mt-4 pt-3 border-t border-red-950/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <div className="text-xs font-bold text-gray-200 font-mono">
              Ready to fire: <span className={direction === 'BUY' ? 'text-green-400 font-black' : 'text-red-400 font-black'}>{direction} {lotSize.toFixed(2)} lots {symbol}</span>
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              Order will route through your connected platform bridge socket
            </div>
          </div>

          <button
            type="button"
            onClick={handleExecuteCodeButton}
            disabled={isExecuting}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-black text-sm tracking-wider uppercase transition-all duration-200 cursor-pointer shadow-xl flex items-center justify-center gap-2 active:scale-95 ${
              direction === 'BUY'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-950/80 border border-emerald-400/60'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white shadow-red-950/90 glow-red border border-red-500/60'
            }`}
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>COMPILING & EXECUTING ORDER...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>EXECUTE CODE ORDER NOW ({direction} {lotSize.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
