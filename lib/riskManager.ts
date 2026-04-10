import { Position, AIPrediction, LevelStrategy, LEVEL_STRATEGIES } from './types';

export class RiskManager {
  private strategy: LevelStrategy = LEVEL_STRATEGIES[4]; // default level 5

  setLevel(level: number) {
    const s = LEVEL_STRATEGIES.find(l => l.level === level);
    if (s) this.strategy = s;
  }

  getStrategy() { return this.strategy; }

  calculateMultipleTP(entryPrice: number) {
    return this.strategy.tpLevels.map(percent => ({
      price: entryPrice * (1 + percent / 100),
      percent,
      executed: false,
    }));
  }

  getPositionSize(balance: number) {
    return balance * (this.strategy.riskPercent / 100);
  }

  evaluateProfit(position: Position, currentPrice: number, aiPrediction?: AIPrediction) {
    const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
    const lossPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;

    // Stop Loss
    if (lossPercent >= this.strategy.slPercent) {
      return { action: 'STOP_LOSS' as const, reason: `SL ${this.strategy.slPercent}%` };
    }

    // TP levels
    for (let i = position.tpLevels.length - 1; i >= 0; i--) {
      const tp = position.tpLevels[i];
      if (!tp.executed && profitPercent >= tp.percent) {
        if (i === position.tpLevels.length - 1) {
          return { action: 'SELL_FULL' as const, reason: `TP${i+1} ${tp.percent}%` };
        }
        return {
          action: 'SELL_PARTIAL' as const,
          amount: position.amount * (i === 0 ? 0.4 : 0.35),
          reason: `TP${i+1} ${tp.percent}%`,
        };
      }
    }

    // AI override
    if (aiPrediction && aiPrediction.maxProfitProjected > 0 &&
        profitPercent >= aiPrediction.maxProfitProjected) {
      return { action: 'SELL_FULL' as const, reason: 'AI MAX PROFIT' };
    }

    return { action: 'HOLD' as const };
  }

  compoundProfit(profit: number, currentBalance: number) {
    return currentBalance + (profit * this.strategy.compoundRate);
  }

  shouldEnter(probabilityUp: number) {
    return probabilityUp >= this.strategy.minProbability;
  }
}

export const riskManager = new RiskManager();
