'use client';

import { useBotStore } from '@/store/botStore';
import { useEffect, useState } from 'react';
import {
  Play, Square, RotateCcw, TrendingUp, TrendingDown,
  Bell, Settings, BarChart2, List, Zap, Shield
} from 'lucide-react';
import { tradingEngine } from '@/lib/tradingEngine';
import { LEVEL_STRATEGIES, TRADING_PAIRS } from '@/lib/types';

type Tab = 'dashboard' | 'strategy' | 'history' | 'chart';

export default function Dashboard() {
  const {
    isRunning, mode, level, demoBalance, currentPair,
    totalProfit, totalProfitPercent, totalTrades, winRate,
    tradeLogs, balanceHistory, notifications,
    startBot, stopBot, resetDemo,
    setLevel, setMode, setPair,
    syncState, dismissNotification,
  } = useBotStore();

  const [price, setPrice] = useState(0);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [position, setPosition] = useState<any>(null);

  const currentStrategy = LEVEL_STRATEGIES.find(s => s.level === level) || LEVEL_STRATEGIES[4];
  const currentPairInfo = TRADING_PAIRS.find(p => p.value === currentPair) || TRADING_PAIRS[0];

  // Fetch harga
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(`https://indodax.com/api/${currentPair}/ticker`);
        const data = await res.json();
        setPrice(parseFloat(data.last));
      } catch (_) {}
    };
    fetchPrice();
    const iv = setInterval(fetchPrice, 3000);
    return () => clearInterval(iv);
  }, [currentPair]);

  // Sync state dari engine
  useEffect(() => {
    if (!isRunning) return;
    const iv = setInterval(() => {
      syncState();
      setPosition(tradingEngine.getCurrentPosition());
    }, 3000);
    return () => clearInterval(iv);
  }, [isRunning, syncState]);

  const handleStart = () => startBot(level, mode, currentPair);
  const handleStop = () => stopBot();

  const profitColor = totalProfit >= 0 ? 'text-emerald-500' : 'text-red-500';
  const profitBg = totalProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-sky-600 text-white px-4 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">Indodax Pro Trader</h1>
              <p className="text-sky-200 text-xs">
                {isRunning ? '🟢 Bot Running' : '⛔ Bot Stopped'} · {mode.toUpperCase()} MODE
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-sky-200">{currentPairInfo.label}</p>
              <p className="text-lg font-bold">Rp {price.toLocaleString('id-ID')}</p>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="text-sky-200 text-xs mb-1">Demo Balance</p>
            <p className="text-3xl font-bold">Rp {demoBalance.toLocaleString('id-ID')}</p>
            <div className="flex items-center gap-2 mt-1">
              {totalProfit >= 0
                ? <TrendingUp className="w-4 h-4 text-emerald-300" />
                : <TrendingDown className="w-4 h-4 text-red-300" />}
              <span className={`text-sm font-medium ${totalProfit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                {totalProfit >= 0 ? '+' : ''}Rp {Math.round(totalProfit).toLocaleString('id-ID')}
                {' '}({totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => dismissNotification(n.id)}
            className={`px-4 py-3 rounded-xl shadow-lg text-white text-sm cursor-pointer animate-pulse
              ${n.type === 'buy' ? 'bg-emerald-600' : n.type === 'sell' ? 'bg-sky-700' : 'bg-gray-700'}`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span>{n.message}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-4">
          {([
            { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
            { id: 'strategy',  icon: Settings,  label: 'Strategi' },
            { id: 'history',   icon: List,       label: 'History' },
            { id: 'chart',     icon: TrendingUp, label: 'Grafik' },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-btn flex-1 flex items-center justify-center gap-1 ${tab === t.id ? 'active' : ''}`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Total Trade</p>
                <p className="text-2xl font-bold text-sky-600">{totalTrades}</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                <p className={`text-2xl font-bold ${winRate >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {winRate.toFixed(0)}%
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Level</p>
                <p className="text-2xl font-bold text-orange-500">{level}</p>
              </div>
            </div>

            {/* Posisi aktif */}
            {position && (
              <div className="card p-4 border-l-4 border-emerald-500">
                <p className="text-xs font-semibold text-emerald-600 mb-2">📍 POSISI AKTIF</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Entry Price</p>
                    <p className="font-bold">Rp {position.entryPrice.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Unrealized P&L</p>
                    <p className={`font-bold ${price >= position.entryPrice ? 'text-emerald-500' : 'text-red-500'}`}>
                      {(((price - position.entryPrice) / position.entryPrice) * 100).toFixed(2)}%
                    </p>
                  </div>
                  {position.tpLevels.map((tp: any, i: number) => (
                    <div key={i}>
                      <p className="text-gray-400 text-xs">TP{i+1} ({tp.percent}%)</p>
                      <p className={`font-medium text-xs ${price >= tp.price ? 'text-emerald-500 line-through' : 'text-gray-700'}`}>
                        Rp {tp.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Kontrol Bot */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-gray-600 mb-4">Kontrol Bot</p>

              {/* Pair selector */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Trading Pair</p>
                <div className="grid grid-cols-4 gap-2">
                  {TRADING_PAIRS.map(p => (
                    <button
                      key={p.value}
                      disabled={isRunning}
                      onClick={() => setPair(p.value)}
                      className={`py-2 px-2 rounded-xl text-xs font-medium transition border
                        ${currentPair === p.value
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode selector */}
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Mode Trading</p>
                <div className="flex gap-2">
                  {(['demo', 'live'] as const).map(m => (
                    <button
                      key={m}
                      disabled={isRunning}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition border
                        ${mode === m
                          ? m === 'demo' ? 'bg-sky-600 text-white border-sky-600' : 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      {m === 'demo' ? '🎮 Demo' : '💰 Live'}
                    </button>
                  ))}
                </div>
                {mode === 'live' && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Mode Live menggunakan uang nyata!</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  disabled={isRunning}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-bold transition"
                >
                  <Play className="w-5 h-5" /> START
                </button>
                <button
                  onClick={handleStop}
                  disabled={!isRunning}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3.5 rounded-2xl font-bold transition"
                >
                  <Square className="w-5 h-5" /> STOP
                </button>
                <button
                  onClick={resetDemo}
                  disabled={isRunning}
                  className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-600 p-3.5 rounded-2xl transition"
                  title="Reset Demo"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB STRATEGI ── */}
        {tab === 'strategy' && (
          <div className="space-y-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-gray-600 mb-1">Level Agresivitas</p>
              <p className="text-xs text-gray-400 mb-4">Semakin tinggi level = potensi profit lebih besar, resiko lebih tinggi</p>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xs text-gray-400">Safe</span>
                <input
                  type="range" min="1" max="10" step="1"
                  value={level}
                  disabled={isRunning}
                  onChange={e => setLevel(parseInt(e.target.value))}
                  className="flex-1 accent-sky-600"
                />
                <span className="text-xs text-gray-400">Max</span>
              </div>
            </div>

            {/* Detail strategi yang dipilih */}
            <div className={`card p-5 border-l-4 ${
              level <= 3 ? 'border-emerald-500' :
              level <= 6 ? 'border-yellow-500' :
              level <= 8 ? 'border-orange-500' : 'border-red-500'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {level <= 3 ? <Shield className="w-5 h-5 text-emerald-500" /> :
                 level <= 6 ? <Zap className="w-5 h-5 text-yellow-500" /> :
                 <TrendingUp className="w-5 h-5 text-red-500" />}
                <div>
                  <p className="font-bold text-gray-800">Level {currentStrategy.level} — {currentStrategy.name}</p>
                  <p className="text-xs text-gray-400">{currentStrategy.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Modal per Trade</p>
                  <p className="font-bold text-sky-600">{currentStrategy.riskPercent}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Stop Loss</p>
                  <p className="font-bold text-red-500">{currentStrategy.slPercent}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Min AI Prob</p>
                  <p className="font-bold text-purple-600">{(currentStrategy.minProbability * 100).toFixed(0)}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">Compound Rate</p>
                  <p className="font-bold text-orange-500">{(currentStrategy.compoundRate * 100).toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-3 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Take Profit Levels</p>
                <div className="flex gap-2">
                  {currentStrategy.tpLevels.map((tp, i) => (
                    <span key={i} className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-lg">
                      TP{i+1}: {tp}%
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Semua level */}
            <div className="card p-5">
              <p className="text-sm font-semibold text-gray-600 mb-3">Semua Level Strategi</p>
              <div className="space-y-2">
                {LEVEL_STRATEGIES.map(s => (
                  <button
                    key={s.level}
                    disabled={isRunning}
                    onClick={() => setLevel(s.level)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition text-left
                      ${level === s.level ? 'border-sky-500 bg-sky-50' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${s.level <= 3 ? 'bg-emerald-500' : s.level <= 6 ? 'bg-yellow-500' : s.level <= 8 ? 'bg-orange-500' : 'bg-red-500'}`}>
                        {s.level}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{s.name}</p>
                        <p className="text-xs text-gray-400">Modal {s.riskPercent}% · SL {s.slPercent}% · TP {s.tpLevels.join('/')}%</p>
                      </div>
                    </div>
                    {level === s.level && <span className="text-sky-600 text-xs font-bold">✓ Aktif</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB HISTORY ── */}
        {tab === 'history' && (
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-gray-700">Riwayat Trade</p>
              <span className="text-xs text-gray-400">{tradeLogs.length} transaksi</span>
            </div>
            {tradeLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <List className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada transaksi</p>
                <p className="text-xs">Jalankan bot untuk mulai trading</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                {tradeLogs.map(log => (
                  <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0
                        ${log.type === 'BUY' ? 'bg-emerald-500' : (log.profit || 0) >= 0 ? 'bg-sky-500' : 'bg-red-500'}`}>
                        {log.type === 'BUY' ? '↑' : '↓'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {log.type} {log.pair.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID')} · {log.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">
                        Rp {log.price.toLocaleString('id-ID')}
                      </p>
                      {log.profit !== undefined && (
                        <p className={`text-xs font-bold ${log.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {log.profit >= 0 ? '+' : ''}Rp {Math.round(log.profit).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB CHART ── */}
        {tab === 'chart' && (
          <div className="space-y-4">
            <div className="card p-5">
              <p className="font-semibold text-gray-700 mb-4">Grafik Balance</p>
              {balanceHistory.length < 2 ? (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  <div className="text-center">
                    <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Jalankan bot untuk melihat grafik</p>
                  </div>
                </div>
              ) : (
                <div className="relative h-40">
                  <svg viewBox={`0 0 ${balanceHistory.length * 40} 120`} className="w-full h-full" preserveAspectRatio="none">
                    {(() => {
                      const vals = balanceHistory.map(b => b.balance);
                      const min = Math.min(...vals);
                      const max = Math.max(...vals);
                      const range = max - min || 1;
                      const points = balanceHistory.map((b, i) => {
                        const x = i * 40 + 20;
                        const y = 110 - ((b.balance - min) / range) * 90;
                        return `${x},${y}`;
                      }).join(' ');
                      const firstY = 110 - ((vals[0] - min) / range) * 90;
                      const lastY = 110 - ((vals[vals.length-1] - min) / range) * 90;
                      const isUp = vals[vals.length-1] >= vals[0];
                      return (
                        <>
                          <polyline points={points} fill="none" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth="2.5" strokeLinejoin="round" />
                          <circle cx="20" cy={firstY} r="4" fill={isUp ? '#10b981' : '#ef4444'} />
                          <circle cx={(balanceHistory.length-1)*40+20} cy={lastY} r="5" fill={isUp ? '#10b981' : '#ef4444'} />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between mt-2">
                    {balanceHistory.filter((_, i) => i % Math.max(1, Math.floor(balanceHistory.length/5)) === 0).map((b, i) => (
                      <span key={i} className="text-xs text-gray-400">{b.time}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`card p-4 ${profitBg}`}>
                <p className="text-xs text-gray-400 mb-1">Total Profit/Loss</p>
                <p className={`text-lg font-bold ${profitColor}`}>
                  {totalProfit >= 0 ? '+' : ''}Rp {Math.round(totalProfit).toLocaleString('id-ID')}
                </p>
                <p className={`text-sm font-medium ${profitColor}`}>
                  {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%
                </p>
              </div>
              <div className="card p-4">
                <p className="text-xs text-gray-400 mb-1">Win Rate</p>
                <p className={`text-lg font-bold ${winRate >= 50 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {winRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-400">{totalTrades} total trade</p>
              </div>
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}
