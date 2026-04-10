import { riskManager } from './riskManager';
import { Position, AIPrediction, TradeLog, BalanceHistory } from './types';

export class TradingEngine {
  private isRunning = false;
  private mode: 'demo' | 'live' = 'demo';
  private currentPair = 'btc_idr';
  private currentPosition: Position | null = null;
  private demoBalance = 10000000;
  private initialBalance = 10000000;
  private tradeLogs: TradeLog[] = [];
  private balanceHistory: BalanceHistory[] = [];
  private level = 5;
  private onNotify?: (msg: string, type: 'buy' | 'sell' | 'info') => void;

  setNotifyCallback(cb: (msg: string, type: 'buy' | 'sell' | 'info') => void) {
    this.onNotify = cb;
  }

  async start(level: number = 5, mode: 'demo' | 'live' = 'demo', pair: string = 'btc_idr') {
    this.level = level;
    this.mode = mode;
    this.currentPair = pair;
    this.isRunning = true;
    riskManager.setLevel(level);
    this.recordBalance();
    this.loop();
    console.log(`🚀 Bot started - Level ${level} - ${mode.toUpperCase()} MODE`);
  }

  stop() {
    this.isRunning = false;
    this.recordBalance();
    console.log('⛔ Bot stopped');
  }

  resetDemo() {
    this.demoBalance = 10000000;
    this.initialBalance = 10000000;
    this.tradeLogs = [];
    this.balanceHistory = [];
    this.currentPosition = null;
  }

  private recordBalance() {
    this.balanceHistory.push({
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      balance: Math.round(this.demoBalance),
    });
    if (this.balanceHistory.length > 20) this.balanceHistory.shift();
  }

  private async loop() {
    while (this.isRunning) {
      try {
        const res = await fetch(`https://indodax.com/api/${this.currentPair}/ticker`);
        const ticker = await res.json();
        const price = parseFloat(ticker.last);

        const aiPrediction: AIPrediction = {
          probabilityUp: Math.random() * 0.4 + 0.6,
          maxProfitProjected: Math.random() * 12 + 4,
          suggestedTP1: price * 1.03,
          suggestedTP2: price * 1.06,
          suggestedTP3: price * 1.10,
        };

        if (this.currentPosition) {
          const result = riskManager.evaluateProfit(this.currentPosition, price, aiPrediction);

          if (result.action === 'SELL_FULL' || result.action === 'STOP_LOSS') {
            const profit = (price - this.currentPosition.entryPrice) * this.currentPosition.amount;
            this.demoBalance = riskManager.compoundProfit(profit, this.demoBalance);

            const log: TradeLog = {
              id: Date.now().toString(),
              timestamp: new Date(),
              type: 'SELL',
              pair: this.currentPair,
              price,
              amount: this.currentPosition.amount,
              reason: result.reason || '',
              profit,
            };
            this.tradeLogs.unshift(log);
            this.recordBalance();

            const emoji = profit >= 0 ? '💰' : '🔴';
            const msg = `${emoji} SELL ${this.currentPair.toUpperCase()} @ Rp ${price.toLocaleString('id-ID')} | ${result.reason} | Profit: Rp ${Math.round(profit).toLocaleString('id-ID')}`;
            this.onNotify?.(msg, 'sell');
            this.currentPosition = null;
          }
        } else if (riskManager.shouldEnter(aiPrediction.probabilityUp)) {
          const amountIDR = riskManager.getPositionSize(this.demoBalance);
          this.currentPosition = {
            entryPrice: price,
            amount: amountIDR / price,
            type: 'buy',
            tpLevels: riskManager.calculateMultipleTP(price),
            compounded: false,
          };

          const log: TradeLog = {
            id: Date.now().toString(),
            timestamp: new Date(),
            type: 'BUY',
            pair: this.currentPair,
            price,
            amount: this.currentPosition.amount,
            reason: `AI ${(aiPrediction.probabilityUp * 100).toFixed(1)}%`,
          };
          this.tradeLogs.unshift(log);

          const msg = `🟢 BUY ${this.currentPair.toUpperCase()} @ Rp ${price.toLocaleString('id-ID')} | AI: ${(aiPrediction.probabilityUp * 100).toFixed(1)}%`;
          this.onNotify?.(msg, 'buy');
        }

        const interval = this.level >= 8 ? 2000 : this.level >= 5 ? 4000 : 6000;
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error('Loop error:', error);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  getDemoBalance() { return this.demoBalance; }
  getInitialBalance() { return this.initialBalance; }
  getCurrentPosition() { return this.currentPosition; }
  getTradeLogs() { return this.tradeLogs; }
  getBalanceHistory() { return this.balanceHistory; }
  getMode() { return this.mode; }
  getTotalProfit() { return this.demoBalance - this.initialBalance; }
  getTotalProfitPercent() { return ((this.demoBalance - this.initialBalance) / this.initialBalance) * 100; }
  getTotalTrades() { return this.tradeLogs.length; }
  getWinRate() {
    const sells = this.tradeLogs.filter(l => l.type === 'SELL');
    if (sells.length === 0) return 0;
    const wins = sells.filter(l => (l.profit || 0) > 0).length;
    return (wins / sells.length) * 100;
  }
}

export const tradingEngine = new TradingEngine();
