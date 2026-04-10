// lib/indodax.ts
// NOTE: Fungsi ini hanya boleh dipanggil dari server-side (API Routes / Server Actions)
// karena menggunakan crypto dan env variables rahasia.

const BASE_URL = 'https://indodax.com/tapi';

export class IndodaxAPI {
  private apiKey: string;
  private secret: string;

  constructor() {
    this.apiKey = process.env.INDODAX_API_KEY || '';
    this.secret = process.env.INDODAX_SECRET_KEY || '';
  }

  private async privateRequest(method: string, params: Record<string, string> = {}) {
    const { createHmac } = await import('crypto');

    const nonce = Date.now().toString();
    const bodyObj: Record<string, string> = { method, nonce, ...params };
    const body = new URLSearchParams(bodyObj).toString();

    const sign = createHmac('sha512', this.secret)
      .update(body)
      .digest('hex');

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Key': this.apiKey,
        'Sign': sign,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  async getBalance() {
    return this.privateRequest('getInfo');
  }

  async trade(pair: string, type: 'buy' | 'sell', price: string, amount: string) {
    const param: Record<string, string> = type === 'buy'
      ? { pair, type, price, idr: amount }
      : { pair, type, price, [pair.split('_')[0]]: amount };
    return this.privateRequest('trade', param);
  }
}

export const indodaxAPI = new IndodaxAPI();
