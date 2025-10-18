# 📊 Forex Trading Dashboard

A professional-grade forex trading application with real-time signals, technical analysis, and an intuitive dashboard built with the MERN stack.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## ✨ Features

- 📈 **Real-time Forex Signals** with multi-indicator analysis
- 💹 **10 Major Forex Pairs** (EUR/USD, GBP/USD, USD/JPY, etc.)
- 📊 **Professional Charting** with candlesticks and technical overlays
- ⏱️ **Multiple Timeframes** (15min, 1h, 4h, daily)
- ⭐ **Smart Watchlist** for favorite pairs
- 🔄 **Auto-Refresh** with 60-second intervals
- 💰 **Forex Metrics** (pips, margin, risk/reward)
- 🎨 **Two-Sidebar Layout** - no scrolling needed
- 🌓 **Dark/Light Theme** support
- 🎮 **Demo Mode** with simulated data fallback

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/MurbX/Trading-App.git
cd Trading-App

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Setup Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

### 3. Get Free API Key (2 minutes)
- Visit: https://twelvedata.com/
- Sign up (free, no credit card)
- Copy API key to `.env`

### 4. Start Servers
```bash
# Backend (terminal 1)
cd backend && node server.js

# Frontend (terminal 2)
cd frontend && PORT=3001 npm start
```

### 5. Open App
```
http://localhost:3001
```

## 📖 Documentation

- **[GET_API_KEY.md](GET_API_KEY.md)** - API setup guide
- **[USER_GUIDE.md](USER_GUIDE.md)** - How to use
- **[FEATURES.md](FEATURES.md)** - Complete features
- **[FOREX_GUIDE.md](FOREX_GUIDE.md)** - Trading concepts

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, Twelve Data API  
**Frontend:** React 18, Context API, Axios, lightweight-charts  
**Analysis:** EMA, RSI, MACD, Bollinger Bands

## 📊 API (Free Tier)

- ✅ 800 calls/day
- ✅ 12,000+ forex pairs
- ✅ All timeframes
- ✅ Lifetime free

## ⚠️ Disclaimer

**Educational purposes only. Not financial advice.**  
Trading carries risk. Only trade with money you can afford to lose.

## 👨‍💻 Author

**Brian Mutuku** - [@MurbX](https://github.com/MurbX)

## 📝 License

MIT License - see [LICENSE](LICENSE) file

---

⭐ **Star this repo if you find it helpful!**
