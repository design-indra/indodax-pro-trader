'use client';
import { create } from 'zustand';
import { tradingEngine } from '@/lib/tradingEngine';
import { TradeLog, BalanceHistory } from '@/lib/types';

interface Notification {
  id: string;
  message: string;
  type: 'buy' | 'sell' | 'info';
  time: string;
}

interface BotState {
  isRunning: boolean;
  mode: 'demo' | 'live';
  level: number;
  maxProfitTarget: number;
  compoundRate: number;
  demoBalance: number;
  currentPair: string;
  totalProfit: number;
  totalProfitPercent: number;
  totalTrades: number;
  winRate: number;
  tradeLogs: TradeLog[];
  balanceHistory: BalanceHistory[];
  notifications: Notification[];

  startBot: (level?: number, mode?: 'demo' | 'live', pair?: string) => void;
  stopBot: () => void;
  resetDemo: () => void;
  setLevel: (level: number) => void;
  setMode: (mode: 'demo' | 'live') => void;
  setPair: (pair: string) => void;
  setMaxProfitTarget: (value: number) => void;
  syncState: () => void;
  dismissNotification: (id: string) => void;
}

export const useBotStore = create<BotState>((set, get) => {
  // Setup notifikasi dari engine
  tradingEngine.setNotifyCallback((message, type) => {
    const notif: Notification = {
      id: Date.now().toString(),
      message,
      type,
      time: new Date().toLocaleTimeString('id-ID'),
    };
    set(state => ({
      notifications: [notif, ...state.notifications].slice(0, 10),
    }));
    // Auto dismiss setelah 6 detik
    setTimeout(() => {
      get().dismissNotification(notif.id);
    }, 6000);
  });

  return {
    isRunning: false,
    mode: 'demo',
    level: 5,
    maxProfitTarget: 8.0,
    compoundRate: 0.75,
    demoBalance: 10000000,
    currentPair: 'btc_idr',
    totalProfit: 0,
    totalProfitPercent: 0,
    totalTrades: 0,
    winRate: 0,
    tradeLogs: [],
    balanceHistory: [],
    notifications: [],

    startBot: (level = 5, mode = 'demo', pair = 'btc_idr') => {
      tradingEngine.start(level, mode, pair);
      set({ isRunning: true, level, mode, currentPair: pair });
    },

    stopBot: () => {
      tradingEngine.stop();
      set({ isRunning: false });
    },

    resetDemo: () => {
      tradingEngine.resetDemo();
      set({
        demoBalance: 10000000,
        totalProfit: 0,
        totalProfitPercent: 0,
        totalTrades: 0,
        winRate: 0,
        tradeLogs: [],
        balanceHistory: [],
      });
    },

    setLevel: (level) => set({ level }),
    setMode: (mode) => set({ mode }),
    setPair: (pair) => set({ currentPair: pair }),
    setMaxProfitTarget: (value) => set({ maxProfitTarget: value }),

    syncState: () => {
      set({
        demoBalance: tradingEngine.getDemoBalance(),
        totalProfit: tradingEngine.getTotalProfit(),
        totalProfitPercent: tradingEngine.getTotalProfitPercent(),
        totalTrades: tradingEngine.getTotalTrades(),
        winRate: tradingEngine.getWinRate(),
        tradeLogs: [...tradingEngine.getTradeLogs()],
        balanceHistory: [...tradingEngine.getBalanceHistory()],
      });
    },

    dismissNotification: (id) => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    },
  };
});
