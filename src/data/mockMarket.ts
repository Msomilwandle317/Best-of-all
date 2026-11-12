import { MarketTicker, Position, TradeHistoryItem, LogEntry, BrokerConfig } from '../types/trading';

export const INITIAL_TICKERS: MarketTicker[] = [
  {
    symbol: 'XAUUSD',
    name: 'Gold vs US Dollar',
    bid: 2389.50,
    ask: 2389.75,
    spread: 2.5,
    changePercent: +1.42,
    high24h: 2398.20,
    low24h: 2355.10,
    digits: 2
  },
  {
    symbol: 'EURUSD',
    name: 'Euro vs US Dollar',
    bid: 1.06780,
    ask: 1.06792,
    spread: 1.2,
    changePercent: -0.68,
    high24h: 1.07450,
    low24h: 1.06620,
    digits: 5
  },
  {
    symbol: 'GBPUSD',
    name: 'British Pound vs US Dollar',
    bid: 1.28420,
    ask: 1.28435,
    spread: 1.5,
    changePercent: +0.31,
    high24h: 1.28900,
    low24h: 1.28110,
    digits: 5
  },
  {
    symbol: 'BTCUSD',
    name: 'Bitcoin vs US Dollar',
    bid: 88450.00,
    ask: 88475.00,
    spread: 25.0,
    changePercent: +3.85,
    high24h: 89900.00,
    low24h: 85200.00,
    digits: 2
  },
  {
    symbol: 'NAS100',
    name: 'US Tech 100 Index',
    bid: 19840.20,
    ask: 19842.00,
    spread: 1.8,
    changePercent: +0.94,
    high24h: 19910.00,
    low24h: 19680.00,
    digits: 2
  },
  {
    symbol: 'US30',
    name: 'Wall Street 30 Index',
    bid: 43210.50,
    ask: 43213.00,
    spread: 2.5,
    changePercent: -0.15,
    high24h: 43450.00,
    low24h: 43050.00,
    digits: 2
  },
  {
    symbol: 'USDZAR',
    name: 'US Dollar vs SA Rand',
    bid: 18.2450,
    ask: 18.2485,
    spread: 3.5,
    changePercent: +0.48,
    high24h: 18.3520,
    low24h: 18.1510,
    digits: 4
  }
];

export const INITIAL_POSITIONS: Position[] = [
  {
    id: 'pos-1',
    ticket: 88204911,
    symbol: 'XAUUSD',
    direction: 'BUY',
    lotSize: 0.50,
    openPrice: 2378.40,
    currentPrice: 2389.50,
    stopLoss: 2365.00,
    takeProfit: 2410.00,
    profit: 10267.50,
    pips: 111.0,
    openTime: '14:22:05',
    source: 'AUTO_EA',
    comment: 'KILL_CHART_SNIPER'
  },
  {
    id: 'pos-2',
    ticket: 88204945,
    symbol: 'EURUSD',
    direction: 'SELL',
    lotSize: 1.00,
    openPrice: 1.07150,
    currentPrice: 1.06780,
    stopLoss: 1.07600,
    takeProfit: 1.06200,
    profit: 6845.00,
    pips: 37.0,
    openTime: '13:50:18',
    source: 'MANUAL_CODE',
    comment: 'SCRIPT_EXEC_MQL'
  },
  {
    id: 'pos-3',
    ticket: 88205012,
    symbol: 'BTCUSD',
    direction: 'BUY',
    lotSize: 0.10,
    openPrice: 87100.00,
    currentPrice: 88450.00,
    stopLoss: 85500.00,
    takeProfit: 91000.00,
    profit: 2497.50,
    pips: 135.0,
    openTime: '15:10:42',
    source: 'CHART_SCANNER',
    comment: 'AI_SCAN_TRIGGER'
  }
];

export const INITIAL_HISTORY: TradeHistoryItem[] = [
  {
    id: 'hist-1',
    ticket: 88193201,
    symbol: 'XAUUSD',
    direction: 'BUY',
    lotSize: 0.50,
    openPrice: 2355.20,
    closePrice: 2374.80,
    profit: 18130.00,
    pips: 196.0,
    openTime: '09:12:15',
    closeTime: '11:45:30',
    source: 'AUTO_EA',
    result: 'WIN'
  },
  {
    id: 'hist-2',
    ticket: 88192844,
    symbol: 'NAS100',
    direction: 'BUY',
    lotSize: 0.80,
    openPrice: 19650.00,
    closePrice: 19780.00,
    profit: 19240.00,
    pips: 130.0,
    openTime: '08:05:10',
    closeTime: '10:14:22',
    source: 'MANUAL_CODE',
    result: 'WIN'
  },
  {
    id: 'hist-3',
    ticket: 88191950,
    symbol: 'GBPUSD',
    direction: 'SELL',
    lotSize: 0.60,
    openPrice: 1.28850,
    closePrice: 1.28410,
    profit: 4884.00,
    pips: 44.0,
    openTime: '06:30:00',
    closeTime: '08:15:40',
    source: 'AUTO_EA',
    result: 'WIN'
  },
  {
    id: 'hist-4',
    ticket: 88190772,
    symbol: 'US30',
    direction: 'BUY',
    lotSize: 0.40,
    openPrice: 43350.00,
    closePrice: 43280.00,
    profit: -5180.00,
    pips: -70.0,
    openTime: '05:40:12',
    closeTime: '06:12:05',
    source: 'AUTO_EA',
    result: 'LOSS'
  },
  {
    id: 'hist-5',
    ticket: 88189420,
    symbol: 'EURUSD',
    direction: 'SELL',
    lotSize: 1.20,
    openPrice: 1.07420,
    closePrice: 1.06910,
    profit: 11322.00,
    pips: 51.0,
    openTime: '03:15:00',
    closeTime: '05:01:25',
    source: 'CHART_SCANNER',
    result: 'WIN'
  }
];

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'log-1',
    timestamp: '15:31:00',
    type: 'INFO',
    message: 'KILL CHART Engine initialized in high-frequency tactical mode (Base Currency: ZAR / R).'
  },
  {
    id: 'log-2',
    timestamp: '15:31:04',
    type: 'SUCCESS',
    message: 'MT5 Bridge link confirmed. Latency: 12ms. Server: Exness-ZA-Real1 (ZAR Account).'
  },
  {
    id: 'log-3',
    timestamp: '15:31:08',
    type: 'INFO',
    message: 'Risk perimeter loaded: Max Drawdown 5.0%, Max Daily Spread 3.0 pips.'
  },
  {
    id: 'log-4',
    timestamp: '15:31:12',
    type: 'TRADE',
    message: 'Ticket #88204911: BUY XAUUSD 0.50 lots @ 2378.40 [KILL_CHART_SNIPER]'
  },
  {
    id: 'log-5',
    timestamp: '15:31:18',
    type: 'ALERT',
    message: 'AI Chart Scanner model loaded: gemini-3.8-flash vision ready.'
  }
];

export const DEFAULT_BROKER: BrokerConfig = {
  server: 'Exness-ZA-Real1',
  login: '88492015',
  password: '••••••••••••',
  platform: 'MT5',
  accountType: 'REAL',
  connected: true,
  currency: 'ZAR',
  currencySymbol: 'R',
  balance: 471389.25,
  equity: 490999.25,
  margin: 20720.00,
  freeMargin: 470279.25,
  leverage: '1:500',
  pingMs: 12,
  lastConnectedAt: 'Today 15:30 UTC'
};

export const CODE_STRATEGY_TEMPLATES = [
  {
    name: 'Sniper Order Block KillZone',
    description: 'High-speed institutional liquidity sweep trigger with tight SL and 1:3 RR target.',
    symbol: 'XAUUSD',
    direction: 'BUY' as const,
    lotSize: 0.50,
    stopLoss: 2375.00,
    takeProfit: 2420.00,
    code: `// --- KILL CHART EA v4.2 ---
// STRATEGY: SNIPER ORDER BLOCK KILLZONE
#property strict
input string  InpSymbol      = "XAUUSD";
input string  InpDirection   = "BUY";     // "BUY" or "SELL"
input double  InpLotSize     = 0.50;      // Target Position Size
input double  InpStopLoss    = 2375.00;   // Invalidation Level
input double  InpTakeProfit  = 2420.00;   // Liquidity Target
input int     InpMagicNumber = 777901;    // EA Identification
input double  InpMaxSlippage = 1.5;       // Max Pips Slippage

void OnKillExecute() {
   Print("[KILL CHART] Executing ", InpDirection, " on ", InpSymbol, " Lots: ", InpLotSize);
   int ticket = OrderSend(InpSymbol, OP_BUY, InpLotSize, Ask, InpMaxSlippage, InpStopLoss, InpTakeProfit, "KILL_ORDER", InpMagicNumber);
   if(ticket > 0) Print("KILL TICKET CREATED: #", ticket);
}`
  },
  {
    name: 'Bearish Breakdown Hunter',
    description: 'Aggressive trend continuation short on support break with expanding volume.',
    symbol: 'EURUSD',
    direction: 'SELL' as const,
    lotSize: 1.00,
    stopLoss: 1.0740,
    takeProfit: 1.0600,
    code: `// --- KILL CHART EA v4.2 ---
// STRATEGY: BEARISH BREAKDOWN HUNTER
#property strict
input string  InpSymbol      = "EURUSD";
input string  InpDirection   = "SELL";    // "BUY" or "SELL"
input double  InpLotSize     = 1.00;      // Target Position Size
input double  InpStopLoss    = 1.0740;    // Resistance Invalidation
input double  InpTakeProfit  = 1.0600;    // Support Run Target
input int     InpMagicNumber = 888204;
input bool    InpTrailingStop= true;

void OnKillExecute() {
   Print("[KILL CHART] Firing SHORT breakout on ", InpSymbol);
   int ticket = OrderSend(InpSymbol, OP_SELL, InpLotSize, Bid, 2.0, InpStopLoss, InpTakeProfit, "KILL_SHORT", InpMagicNumber);
}`
  },
  {
    name: 'Rapid Scalper 10-Pip Trap',
    description: 'Ultra-low latency micro scalping on high volatility index surges.',
    symbol: 'NAS100',
    direction: 'BUY' as const,
    lotSize: 0.75,
    stopLoss: 19780.00,
    takeProfit: 19920.00,
    code: `// --- KILL CHART EA v4.2 ---
// STRATEGY: RAPID SCALPER 10-PIP TRAP
#property strict
input string  InpSymbol      = "NAS100";
input string  InpDirection   = "BUY";
input double  InpLotSize     = 0.75;
input double  InpStopLoss    = 19780.00;
input double  InpTakeProfit  = 19920.00;
input int     InpMagicNumber = 999333;

void OnTick() {
   ExecuteMicroScalp(InpSymbol, InpDirection, InpLotSize, InpStopLoss, InpTakeProfit);
}`
  },
  {
    name: 'USDZAR Rand Volatility Hunter',
    description: 'Institutional South African Rand breakout strategy on London/Johannesburg overlap with 1:3 RR.',
    symbol: 'USDZAR',
    direction: 'SELL' as const,
    lotSize: 0.80,
    stopLoss: 18.3500,
    takeProfit: 17.9500,
    code: `// --- KILL CHART EA v4.2 ---
// STRATEGY: USDZAR RAND VOLATILITY HUNTER (SOUTH AFRICA)
#property strict
input string  InpSymbol      = "USDZAR";
input string  InpDirection   = "SELL";     // Rand Strengthening Setup
input double  InpLotSize     = 0.80;       // Optimal for Account Balance
input double  InpStopLoss    = 18.3500;    // Resistance Invalidation
input double  InpTakeProfit  = 17.9500;    // Institutional Target
input int     InpMagicNumber = 777321;
input double  InpMaxSlippage = 2.0;

void OnKillExecute() {
   Print("[KILL CHART] Firing South African Rand Volatility Setup on ", InpSymbol);
   int ticket = OrderSend(InpSymbol, OP_SELL, InpLotSize, Bid, InpMaxSlippage, InpStopLoss, InpTakeProfit, "KILL_USDZAR", InpMagicNumber);
   if(ticket > 0) Print("ZAR KILL TICKET CREATED: #", ticket);
}`
  }
];
