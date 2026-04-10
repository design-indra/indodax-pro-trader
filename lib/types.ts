export interface Position {
  entryPrice: number;
  amount: number;
  type: 'buy' | 'sell';
  tpLevels: Array<{
    price: number;
    percent: number;
    executed: boolean;
  }>;
  compounded: boolean;
}

export interface AIPrediction {
  probabilityUp: number;
  maxProfitProjected: number;
  suggestedTP1: number;
  suggestedTP2: number;
  suggestedTP3: number;
}

export interface TradeLog {
  id: string;
  timestamp: Date;
  type: 'BUY' | 'SELL';
  pair: string;
  price: number;
  amount: number;
  reason: string;
  profit?: number;
}

export interface BalanceHistory {
  time: string;
  balance: number;
}

export type TradingLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface LevelStrategy {
  level: TradingLevel;
  name: string;
  description: string;
  riskPercent: number;       // % modal per trade
  tpLevels: number[];        // TP dalam %
  slPercent: number;         // Stop loss %
  minProbability: number;    // Min AI probability untuk entry
  compoundRate: number;      // Rate compound profit
}

export const LEVEL_STRATEGIES: LevelStrategy[] = [
  { level: 1,  name: 'Ultra Safe',    description: 'Sangat konservatif, profit kecil tapi aman',      riskPercent: 5,  tpLevels: [1.5, 3.0, 5.0],   slPercent: 1.0, minProbability: 0.85, compoundRate: 0.5  },
  { level: 2,  name: 'Safe',          description: 'Konservatif, cocok untuk pemula',                  riskPercent: 8,  tpLevels: [2.0, 4.0, 6.0],   slPercent: 1.5, minProbability: 0.82, compoundRate: 0.55 },
  { level: 3,  name: 'Conservative',  description: 'Resiko rendah dengan target profit moderat',       riskPercent: 10, tpLevels: [2.5, 5.0, 8.0],   slPercent: 2.0, minProbability: 0.78, compoundRate: 0.6  },
  { level: 4,  name: 'Moderate Low',  description: 'Balance antara resiko dan profit',                 riskPercent: 12, tpLevels: [3.0, 6.0, 9.0],   slPercent: 2.5, minProbability: 0.75, compoundRate: 0.65 },
  { level: 5,  name: 'Moderate',      description: 'Strategi seimbang, default recommended',           riskPercent: 15, tpLevels: [3.0, 6.0, 10.0],  slPercent: 3.0, minProbability: 0.72, compoundRate: 0.7  },
  { level: 6,  name: 'Moderate High', description: 'Sedikit agresif dengan potensi profit lebih besar',riskPercent: 18, tpLevels: [4.0, 7.0, 12.0],  slPercent: 3.5, minProbability: 0.70, compoundRate: 0.72 },
  { level: 7,  name: 'Aggressive',    description: 'Agresif, potensi profit besar',                   riskPercent: 20, tpLevels: [5.0, 8.0, 14.0],  slPercent: 4.0, minProbability: 0.68, compoundRate: 0.75 },
  { level: 8,  name: 'High Risk',     description: 'Resiko tinggi, untuk trader berpengalaman',        riskPercent: 25, tpLevels: [5.0, 10.0, 16.0], slPercent: 5.0, minProbability: 0.65, compoundRate: 0.78 },
  { level: 9,  name: 'Very High Risk',description: 'Sangat agresif, resiko besar',                    riskPercent: 30, tpLevels: [6.0, 12.0, 20.0], slPercent: 6.0, minProbability: 0.62, compoundRate: 0.8  },
  { level: 10, name: 'Max Profit',    description: 'Maksimum profit, resiko sangat tinggi',            riskPercent: 40, tpLevels: [8.0, 15.0, 25.0], slPercent: 8.0, minProbability: 0.60, compoundRate: 0.85 },
];

export const TRADING_PAIRS = [
  { value: 'btc_idr',  label: 'BTC/IDR',  name: 'Bitcoin'  },
  { value: 'eth_idr',  label: 'ETH/IDR',  name: 'Ethereum' },
  { value: 'usdt_idr', label: 'USDT/IDR', name: 'Tether'   },
  { value: 'bnb_idr',  label: 'BNB/IDR',  name: 'BNB'      },
  { value: 'sol_idr',  label: 'SOL/IDR',  name: 'Solana'   },
  { value: 'doge_idr', label: 'DOGE/IDR', name: 'Dogecoin' },
  { value: 'xrp_idr',  label: 'XRP/IDR',  name: 'Ripple'   },
  { value: 'ada_idr',  label: 'ADA/IDR',  name: 'Cardano'  },
];
