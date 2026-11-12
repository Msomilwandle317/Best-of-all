export type OrderDirection = 'BUY' | 'SELL';
export type PlatformType = 'MT5' | 'MT4' | 'cTrader' | 'TradingView' | 'MetaApi' | 'Deriv';
export type ExecutionMode = 'AUTO_EA' | 'MANUAL_CODE' | 'CHART_SCANNER';

export interface AIBalanceOptimization {
  recommendedStrategy: string;
  symbol: string;
  direction: OrderDirection;
  optimalLotSize: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  riskAmountZAR: number;
  expectedProfitZAR: number;
  riskReward: string;
  reasoning: string;
  codeSnippet: string;
}

export interface Position {
  id: string;
  ticket: number;
  symbol: string;
  direction: OrderDirection;
  lotSize: number;
  openPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  pips: number;
  openTime: string;
  source: ExecutionMode;
  comment: string;
}

export interface TradeHistoryItem {
  id: string;
  ticket: number;
  symbol: string;
  direction: OrderDirection;
  lotSize: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  pips: number;
  openTime: string;
  closeTime: string;
  source: ExecutionMode;
  result: 'WIN' | 'LOSS';
}

export interface BrokerConfig {
  server: string;
  login: string;
  password: string;
  platform: PlatformType;
  accountType: 'REAL' | 'DEMO';
  connected: boolean;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: string;
  pingMs: number;
  currency: string;
  currencySymbol: string;
  lastConnectedAt?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'TRADE' | 'WARNING' | 'ALERT' | 'ERROR' | 'SUCCESS';
  message: string;
  details?: string;
}

export interface VisualOverlayMarker {
  type: 'ENTRY' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'ORDER_BLOCK' | 'LIQUIDITY_SWEEP' | 'BOS';
  label: string;
  yPercent: number; // 0% to 100% position on the chart
  price: string;
  color: string;
  description?: string;
}

export interface ChartScanResult {
  symbol: string;
  timeframe?: string;
  trend: 'UPTREND' | 'DOWNTREND' | 'RANGING';
  signal: 'BUY' | 'STRONG BUY' | 'SELL' | 'STRONG SELL' | 'WAIT';
  confidence: number;
  currentPrice: string;
  entryPrice: string;
  stopLoss: string;
  takeProfit1: string;
  takeProfit2?: string;
  riskReward: string;
  suggestedLotSize: number;
  marketSummary: string;
  reasons: string[];
  volatility?: string;
  candlestickPattern?: string;
  volumeDelta?: string;
  fvgZone?: string;
  orderBlockZone?: string;
  visualOverlays?: VisualOverlayMarker[];
  source?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionProposal?: {
    type: 'TRADE_EXECUTE' | 'LOAD_CODE' | 'APPLY_RISK';
    symbol?: string;
    direction?: OrderDirection;
    lotSize?: number;
    codeSnippet?: string;
    label: string;
  };
}

export interface MarketTicker {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  spread: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  digits: number;
}

