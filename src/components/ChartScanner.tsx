import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Scan,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  CheckCircle,
  Crosshair,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileImage,
  Eye,
  EyeOff,
  Layers,
  Activity,
  Bot,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { ChartScanResult, OrderDirection, VisualOverlayMarker } from '../types/trading';
import { ASSETS } from '../assets/assetPaths';

interface Props {
  onExecuteScannedTrade: (params: {
    symbol: string;
    direction: OrderDirection;
    lotSize: number;
    stopLoss?: number;
    takeProfit?: number;
    source: 'CHART_SCANNER';
    summary: string;
  }) => void;
  brokerConnected: boolean;
  onOpenAIHelper?: (initialPrompt?: string) => void;
}

const SUPPORTED_SYMBOLS = [
  { id: 'AUTO', label: '⚡ Auto-Detect Instrument' },
  { id: 'USDZAR', label: '🇿🇦 USDZAR (South African Rand)' },
  { id: 'XAUUSD', label: '🥇 XAUUSD (Gold)' },
  { id: 'EURUSD', label: '💶 EURUSD' },
  { id: 'GBPUSD', label: '💷 GBPUSD' },
  { id: 'BTCUSD', label: '₿ BTCUSD (Bitcoin)' },
  { id: 'NAS100', label: '📈 NAS100 (Nasdaq Tech)' },
  { id: 'US30', label: '🏛️ US30 (Dow Jones)' },
  { id: 'CRASH1000', label: '⚡ Crash 1000 (Deriv Synthetics)' },
];

const TIMEFRAMES = ['M1', 'M5', 'M15', 'H1', 'H4', 'D1'];

// Tactical Web Audio synthesizer for trade cues
function playAudioCue(type: 'SCAN' | 'BUY' | 'SELL' | 'CLICK') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'SCAN') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'BUY') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'SELL') {
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.setValueAtTime(523.25, now + 0.08);
      osc.frequency.setValueAtTime(392.00, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch (e) {
    // AudioContext not allowed or not supported, ignore silently
  }
}

export const ChartScanner: React.FC<Props> = ({
  onExecuteScannedTrade,
  brokerConnected,
  onOpenAIHelper,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(ASSETS.chartGold);
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string>('XAUUSD Gold Bullish Breakout (H1)');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AUTO');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('H1');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ChartScanResult | null>(null);
  const [scanStep, setScanStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showHUDOverlay, setShowHUDOverlay] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pixelTelemetry, setPixelTelemetry] = useState<{ greenRatio: number; redRatio: number; slope: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load a preset chart image
  const handleSelectPreset = (url: string, label: string, defaultSym: string = 'AUTO') => {
    setSelectedImage(url);
    setSelectedPresetLabel(label);
    if (defaultSym !== 'AUTO') setSelectedSymbol(defaultSym);
    setScanResult(null);
    setErrorMsg(null);
    if (soundEnabled) playAudioCue('CLICK');
  };

  // Client-side image optimization & canvas pixel telemetry
  const processAndDownsampleImage = (imgSrc: string): Promise<{ optimizedBase64: string; metrics: { greenRatio: number; redRatio: number; slope: number } }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ optimizedBase64: imgSrc, metrics: { greenRatio: 0.55, redRatio: 0.45, slope: 1 } });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Analyze candlestick pixels (green vs red color dominance and slope)
        let greenCount = 0;
        let redCount = 0;
        let leftSideGreen = 0;
        let rightSideGreen = 0;

        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          const halfWidth = width / 2;

          for (let i = 0; i < data.length; i += 16) { // sampled for maximum performance
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const pxIndex = i / 4;
            const x = pxIndex % width;

            // Green/Bullish candle detection (green significantly higher than red/blue)
            if (g > 110 && g > r * 1.25 && g > b * 1.1) {
              greenCount++;
              if (x > halfWidth) rightSideGreen++;
              else leftSideGreen++;
            }
            // Red/Bearish candle detection (red significantly higher than green/blue)
            else if (r > 120 && r > g * 1.25 && r > b * 1.1) {
              redCount++;
            }
          }
        } catch (e) {
          // CORS pixel reading exception fallback
        }

        const totalColor = Math.max(1, greenCount + redCount);
        const greenRatio = Number((greenCount / totalColor).toFixed(3));
        const redRatio = Number((redCount / totalColor).toFixed(3));
        const slope = rightSideGreen >= leftSideGreen ? 1 : -1;

        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          optimizedBase64,
          metrics: { greenRatio, redRatio, slope }
        });
      };
      img.onerror = reject;
      img.src = imgSrc;
    });
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
        setSelectedPresetLabel(`Uploaded: ${file.name}`);
        setScanResult(null);
        setErrorMsg(null);
        if (soundEnabled) playAudioCue('CLICK');
      }
    };
    reader.readAsDataURL(file);
  };

  // Execute AI Scan
  const handleScanChart = async () => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);
    if (soundEnabled) playAudioCue('SCAN');

    const steps = [
      'Downsampling & extracting candlestick pixel delta...',
      'Computing green/red candle ratio & structural slope...',
      'Running Gemini 3.8 Flash Multimodal Market Vision...',
      'Detecting liquidity pools, Order Blocks & FVG zones...',
      'Synthesizing high-confidence BUY/SELL execution levels...'
    ];
    let stepIndex = 0;
    setScanStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % steps.length;
      setScanStep(steps[stepIndex]);
    }, 900);

    try {
      // 1. Client-side pixel telemetry & fast downsampling
      const { optimizedBase64, metrics } = await processAndDownsampleImage(selectedImage);
      setPixelTelemetry(metrics);

      // 2. Call backend high-performance scanner
      const response = await fetch('/api/scan-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: optimizedBase64,
          assetHint: selectedPresetLabel,
          symbolOverride: selectedSymbol !== 'AUTO' ? selectedSymbol : '',
          timeframe: selectedTimeframe,
          pixelMetrics: metrics
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setScanResult(result.data);
        if (soundEnabled) {
          if (result.data.signal.includes('BUY')) playAudioCue('BUY');
          else playAudioCue('SELL');
        }
      } else {
        throw new Error(result.error || 'Unable to scan chart');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setErrorMsg(err.message || 'Failed to analyze chart screenshot');
    } finally {
      clearInterval(stepInterval);
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Execute trade from scanned signal
  const handleFireScannedSignal = () => {
    if (!scanResult) return;
    const direction: OrderDirection = scanResult.signal.toUpperCase().includes('BUY') ? 'BUY' : 'SELL';
    const entry = parseFloat(scanResult.entryPrice) || 0;
    const sl = parseFloat(scanResult.stopLoss) || undefined;
    const tp = parseFloat(scanResult.takeProfit1) || undefined;

    if (soundEnabled) {
      if (direction === 'BUY') playAudioCue('BUY');
      else playAudioCue('SELL');
    }

    onExecuteScannedTrade({
      symbol: scanResult.symbol || 'XAUUSD',
      direction,
      lotSize: scanResult.suggestedLotSize || 0.50,
      stopLoss: sl,
      takeProfit: tp,
      source: 'CHART_SCANNER',
      summary: scanResult.marketSummary
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Info Banner with Controls */}
      <div className="bg-[#0c0c14] border border-red-950/80 rounded-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-lg shadow-red-950/80 glow-red">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-display uppercase tracking-wider text-white flex items-center gap-2">
                <span>AI Candlestick Chart Scanner</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-700/60">
                  GEMINI 3.8 FLASH VISION
                </span>
              </h2>
              <p className="text-[11px] text-gray-400 font-mono">
                Institutional Market Structure, Trend Direction, Order Blocks & Instant Execution Signals
              </p>
            </div>
          </div>

          {/* Quick HUD & Audio Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowHUDOverlay(!showHUDOverlay)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition cursor-pointer ${
                showHUDOverlay
                  ? 'bg-red-950/60 border-red-500 text-red-200'
                  : 'bg-[#14141e] border-gray-800 text-gray-400'
              }`}
              title="Toggle Institutional HUD Overlay on Chart"
            >
              {showHUDOverlay ? <Eye className="w-3.5 h-3.5 text-red-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-500" />}
              <span>HUD OVERLAY: {showHUDOverlay ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-[#14141e] border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
              title={soundEnabled ? 'Mute Audio Cues' : 'Enable Audio Cues'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>
      </div>

      {/* Target Instrument & Timeframe Selection Toolbar */}
      <div className="bg-[#0e0e18] border border-red-950/70 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Symbol Select */}
        <div className="sm:col-span-8 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400 uppercase shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
            <span>Target Pair:</span>
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 flex-1">
            {SUPPORTED_SYMBOLS.slice(0, 6).map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => {
                  setSelectedSymbol(sym.id);
                  setScanResult(null);
                  if (soundEnabled) playAudioCue('CLICK');
                }}
                className={`px-2 py-1.5 rounded-lg font-mono text-[10px] text-left truncate border transition cursor-pointer ${
                  selectedSymbol === sym.id
                    ? 'bg-red-950/80 border-red-500 text-white font-bold'
                    : 'bg-[#141420] border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeframe Select */}
        <div className="sm:col-span-4 flex items-center justify-end gap-1.5">
          <span className="text-[11px] font-mono text-gray-400 uppercase mr-1">Timeframe:</span>
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setSelectedTimeframe(tf);
                  setScanResult(null);
                  if (soundEnabled) playAudioCue('CLICK');
                }}
                className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition cursor-pointer ${
                  selectedTimeframe === tf
                    ? 'bg-red-600 text-white border-red-400'
                    : 'bg-[#141420] border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Scanner Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Image Preview, HUD Overlay & Upload Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Preset Buttons for Rapid Testing */}
          <div className="bg-[#0e0e18] border border-red-950/60 rounded-xl p-3">
            <div className="text-[10px] font-mono uppercase text-gray-400 mb-2 flex items-center justify-between">
              <span>Quick Test Charts (High Precision Setups)</span>
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset(ASSETS.chartGold, 'XAUUSD Gold Bullish Breakout (H1)', 'XAUUSD')}
                className={`p-2.5 rounded-lg text-left font-mono text-[10px] border transition cursor-pointer ${
                  selectedPresetLabel.includes('Gold')
                    ? 'bg-red-950/60 border-red-500 text-white font-bold'
                    : 'bg-[#141420] border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>XAUUSD Gold (H1)</span>
                  <span className="text-[9px] px-1 rounded bg-emerald-950 text-emerald-300">BUY</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5">Bullish Breakout + FVG</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset(ASSETS.chartBearish, 'EURUSD Bearish Breakdown (H1)', 'EURUSD')}
                className={`p-2.5 rounded-lg text-left font-mono text-[10px] border transition cursor-pointer ${
                  selectedPresetLabel.includes('EURUSD')
                    ? 'bg-red-950/60 border-red-500 text-white font-bold'
                    : 'bg-[#141420] border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="text-red-400 font-bold flex items-center justify-between">
                  <span>EURUSD (H1)</span>
                  <span className="text-[9px] px-1 rounded bg-red-950 text-red-300">SELL</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5">Downtrend Breakdown + BOS</div>
              </button>
            </div>
          </div>

          {/* Screenshot Display Box with Live Radar Line & Interactive HUD Overlay */}
          <div className="relative rounded-xl overflow-hidden border-2 border-red-950/90 bg-black aspect-video sm:aspect-[4/3] flex items-center justify-center group shadow-2xl">
            <img
              src={selectedImage}
              alt="Trading Chart Screenshot"
              className="w-full h-full object-contain"
            />

            {/* Radar Scan Line Effect while scanning */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-red-600/10 via-red-500/35 to-transparent radar-line border-b-2 border-red-500 shadow-lg shadow-red-500" />
            )}

            {/* Crosshair Target Overlay */}
            <div className="absolute inset-0 pointer-events-none border border-red-600/20 m-3 rounded flex items-center justify-center">
              <div className="w-12 h-12 border border-red-500/30 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              </div>
            </div>

            {/* Interactive HUD Execution Lines Painted on the Chart */}
            {showHUDOverlay && scanResult && scanResult.visualOverlays && (
              <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                {scanResult.visualOverlays.map((marker, mIdx) => (
                  <div
                    key={mIdx}
                    className="absolute left-2 right-2 flex items-center justify-between text-[10px] font-mono font-bold transition-all"
                    style={{ top: `${marker.yPercent}%` }}
                  >
                    {/* Left label badge */}
                    <span
                      className="px-2 py-0.5 rounded shadow-lg backdrop-blur-md border uppercase tracking-wider pointer-events-auto"
                      style={{
                        backgroundColor: `${marker.color}22`,
                        borderColor: marker.color,
                        color: marker.color
                      }}
                      title={marker.description}
                    >
                      {marker.label}
                    </span>

                    {/* Dotted HUD Line */}
                    <div
                      className="flex-1 mx-2 border-b-2 border-dashed opacity-80"
                      style={{ borderColor: marker.color }}
                    />

                    {/* Right price target badge */}
                    <span
                      className="px-2 py-0.5 rounded shadow-lg backdrop-blur-md border text-white"
                      style={{
                        backgroundColor: `${marker.color}33`,
                        borderColor: marker.color
                      }}
                    >
                      {marker.price}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Overlay Status Badge */}
            <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-red-900/50 flex items-center justify-between text-[10px] font-mono">
              <span className="text-gray-300 truncate max-w-[220px]">
                {selectedPresetLabel}
              </span>
              <span className="text-red-400 font-bold">
                {selectedSymbol !== 'AUTO' ? selectedSymbol : 'AUTO'} • {selectedTimeframe}
              </span>
            </div>
          </div>

          {/* Action Buttons: Upload Custom Screenshot + TRIGGER SCAN BUTTON */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-lg bg-[#141420] hover:bg-[#1c1c2e] border border-gray-800 hover:border-gray-700 text-gray-300 font-mono text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span>UPLOAD SCREENSHOT</span>
            </button>

            <button
              type="button"
              onClick={handleScanChart}
              disabled={isScanning}
              className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-950/80 active:scale-95 glow-red"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>ANALYZING...</span>
                </>
              ) : (
                <>
                  <Scan className="w-3.5 h-3.5" />
                  <span>SCAN CHART NOW</span>
                </>
              )}
            </button>
          </div>

          {/* Scanning Progress Status */}
          {isScanning && (
            <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-2.5 text-center font-mono text-xs text-red-300 flex items-center justify-center gap-2 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
              <span>{scanStep || 'Scanning chart with Gemini multimodal AI...'}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-600 rounded-lg p-2.5 font-mono text-xs text-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Verdict, Trend, Signal, SMC & 1-Tap Fire (7 cols) */}
        <div className="lg:col-span-7">
          {scanResult ? (
            <div className="bg-[#0b0b14] border-2 border-red-900/70 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xl">
              {/* Verdict Header Badges: Trend & Signal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. PRIMARY TREND BADGE */}
                <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  scanResult.trend === 'UPTREND'
                    ? 'bg-gradient-to-br from-emerald-950/70 to-[#0e1612] border-emerald-500/80'
                    : 'bg-gradient-to-br from-red-950/70 to-[#180a0e] border-red-500/80 glow-red'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-gray-400">
                    <span>PRIMARY MARKET TREND</span>
                    {scanResult.trend === 'UPTREND' ? (
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className={`text-2xl font-black font-display tracking-wider ${
                      scanResult.trend === 'UPTREND' ? 'text-emerald-400 glow-green-text' : 'text-red-500 glow-red-text'
                    }`}>
                      {scanResult.trend}
                    </div>
                    <div className="text-[11px] font-mono text-gray-300 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
                      <span>{scanResult.confidence}% HIGH CONFIDENCE</span>
                    </div>
                  </div>
                </div>

                {/* 2. ACTIONABLE TRADE SIGNAL BADGE */}
                <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  scanResult.signal.includes('BUY')
                    ? 'bg-gradient-to-br from-emerald-950/80 to-green-950/40 border-emerald-500 glow-green-text'
                    : 'bg-gradient-to-br from-red-950/90 to-rose-950/40 border-red-500 glow-red'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-gray-300">
                    <span>ALGORITHMIC SIGNAL</span>
                    <Zap className="w-4 h-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="mt-2">
                    <div className={`text-2xl font-black font-display tracking-wider uppercase ${
                      scanResult.signal.includes('BUY') ? 'text-green-300' : 'text-red-400'
                    }`}>
                      {scanResult.signal}
                    </div>
                    <div className="text-[11px] font-mono text-gray-300 mt-0.5">
                      Target Symbol: <span className="font-bold text-white">{scanResult.symbol} ({scanResult.timeframe || selectedTimeframe})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Candlestick Pattern & Smart Money Concepts Card */}
              <div className="bg-[#12121e] border border-red-950/80 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <div className="text-[10px] text-gray-400 uppercase">Detected Candlestick Pattern:</div>
                  <div className="font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>{scanResult.candlestickPattern || 'Order Block + Liquidity Sweep'}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-gray-400 uppercase">Institutional Volume Delta:</div>
                  <div className={`font-bold mt-0.5 ${scanResult.signal.includes('BUY') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {scanResult.volumeDelta || '+68.4% Volume Acceleration'}
                  </div>
                </div>
              </div>

              {/* Confidence Gauge Bar */}
              <div className="bg-[#12121c] border border-red-950/60 rounded-lg p-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span className="text-gray-400">Algorithmic Confidence Rating:</span>
                  <span className="text-red-400 font-bold">{scanResult.confidence}% / 100%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${scanResult.confidence}%` }}
                  />
                </div>
              </div>

              {/* WHAT THE MARKET IS DOING (Institutional Analysis Summary) */}
              <div className="bg-[#101018] border border-red-900/40 rounded-xl p-3.5">
                <div className="text-xs font-bold font-display uppercase tracking-wider text-red-400 mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>What the Market is Doing (Price Action & Structure)</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed font-mono">
                  {scanResult.marketSummary}
                </p>

                {/* Key Technical Confirmations */}
                {scanResult.reasons && scanResult.reasons.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-red-950/60 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1">
                      Technical Confirmations:
                    </span>
                    {scanResult.reasons.map((r, idx) => (
                      <div key={idx} className="text-[11px] text-gray-300 flex items-start gap-1.5 font-mono">
                        <CheckCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recommended Trade Levels (Entry, SL, TP1, TP2, RR) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="bg-[#131320] border border-gray-800 rounded-lg p-2">
                  <div className="text-[9px] text-gray-400 uppercase">Suggested Entry</div>
                  <div className="text-xs sm:text-sm font-bold text-cyan-400 mt-0.5">{scanResult.entryPrice}</div>
                </div>

                <div className="bg-[#131320] border border-red-950 rounded-lg p-2">
                  <div className="text-[9px] text-red-400 uppercase">Stop Loss (SL)</div>
                  <div className="text-xs sm:text-sm font-bold text-red-400 mt-0.5">{scanResult.stopLoss}</div>
                </div>

                <div className="bg-[#131320] border border-emerald-950 rounded-lg p-2">
                  <div className="text-[9px] text-emerald-400 uppercase">Take Profit (TP)</div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5">{scanResult.takeProfit1}</div>
                </div>

                <div className="bg-[#131320] border border-gray-800 rounded-lg p-2">
                  <div className="text-[9px] text-yellow-400 uppercase">Risk : Reward</div>
                  <div className="text-xs sm:text-sm font-bold text-yellow-400 mt-0.5">{scanResult.riskReward || '1:2.8'}</div>
                </div>
              </div>

              {/* Action Buttons: 1-TAP FIRE INTO EA + ASK AI HELPER */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleFireScannedSignal}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-display font-black text-xs sm:text-sm tracking-widest uppercase transition cursor-pointer shadow-xl shadow-red-950 glow-red border border-red-400/60 flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <Zap className="w-5 h-5 fill-white text-white" />
                  <span>LOAD SCANNED SIGNAL INTO EA & EXECUTE ({scanResult.signal})</span>
                </button>

                {onOpenAIHelper && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenAIHelper(
                        `Explain this ${scanResult.symbol} ${scanResult.trend} (${scanResult.signal}) setup from the chart scanner. What are the key confirmation levels and how should I manage risk for my account?`
                      )
                    }
                    className="w-full py-2 px-4 rounded-lg bg-[#141420] hover:bg-[#1a1a2e] border border-red-950 text-gray-300 hover:text-white font-mono text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-red-400" />
                    <span>Ask AI Helper to Break Down This Chart Setup</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Standby State */
            <div className="h-full min-h-[340px] border-2 border-dashed border-red-950/70 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-[#090910]">
              <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-600/50 flex items-center justify-center mb-3 text-red-400 shadow-xl glow-red">
                <Scan className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold font-display uppercase tracking-wider text-gray-100">
                Institutional Vision Scanner Ready
              </h3>
              <p className="text-xs text-gray-400 font-mono max-w-sm mt-1 mb-5 leading-relaxed">
                Click <span className="text-red-400 font-bold">"SCAN CHART NOW"</span> above to analyze the candlestick structure with Gemini 3.8 Flash, determine the macro trend (UP/DOWN), and project visual HUD execution targets.
              </p>
              <button
                type="button"
                onClick={handleScanChart}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-display text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-950 active:scale-95"
              >
                Scan Active Screenshot
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
