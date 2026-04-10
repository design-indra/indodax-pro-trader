# Indodax Pro Trader

Dashboard trading bot untuk Indodax (demo & live mode) berbasis Next.js 14.

## Stack
- Next.js 14 (App Router)
- React 18
- Zustand (state management)
- Tailwind CSS
- TypeScript

## Deploy ke Railway

Lihat panduan lengkap di bawah atau ikuti **DEPLOY-GUIDE.md**.

## Environment Variables

Salin `.env.example` → `.env.local` untuk development lokal:

```bash
cp .env.example .env.local
```

Isi dengan API key Indodax kamu (hanya diperlukan untuk mode Live).

## Development Lokal

```bash
npm install
npm run dev
```

Buka http://localhost:3000
