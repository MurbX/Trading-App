# 🔑 Get Your Free Twelve Data API Key

## Quick Setup (2 minutes)

### Step 1: Sign Up
1. Go to: https://twelvedata.com/
2. Click **"Get Free API Key"** button
3. Enter your email and create password
4. Verify your email

### Step 2: Get API Key
1. Login to dashboard: https://twelvedata.com/account
2. Copy your API key (looks like: `a1b2c3d4e5f6g7h8i9j0`)

### Step 3: Update .env File
Open `/backend/.env` and replace the Alpha Vantage key:

```bash
# Replace this:
ALPHA_VANTAGE_API_KEY=7M14DHDZSC8Y32PY

# With this:
TWELVE_DATA_API_KEY=your_new_key_here
```

### Step 4: Restart Backend
```bash
cd /Users/brianmutuku/Development/TradingBot/backend
node server.js
```

---

## 📊 Why Twelve Data is Better

| Feature | Alpha Vantage (Free) | Twelve Data (Free) |
|---------|---------------------|-------------------|
| **Daily API Calls** | 25 | 800 |
| **Rate Limit** | 5/min | 8/min |
| **Forex Pairs** | Limited | 12,000+ pairs |
| **Timeframes** | 5 | 9+ timeframes |
| **Real-time** | No | Yes (WebSocket) |
| **Support** | Email only | Email + Community |
| **Reliability** | Medium | High |

---

## 🎯 Free Tier Limits

**Twelve Data Free Plan:**
- ✅ 800 API requests per day
- ✅ 8 requests per minute
- ✅ All forex pairs included
- ✅ Historical data up to 1 year
- ✅ Technical indicators built-in
- ✅ WebSocket for real-time (future feature)

**Perfect for:**
- Development and testing
- Personal trading apps
- Learning and education
- Small-scale trading

---

## 💰 Upgrade Options (Optional)

If you need more:

### Basic Plan ($79/month)
- 3,000 calls/day
- 60 calls/minute
- 5 years historical data

### Pro Plan ($129/month)
- 10,000 calls/day
- 120 calls/minute
- Unlimited history

### Enterprise (Custom)
- Unlimited calls
- Dedicated support
- Custom features

---

## 🚀 What I've Already Done

I've updated your backend code to use Twelve Data:
1. ✅ New `fetchForexDataFromTwelveData()` function
2. ✅ Better error handling
3. ✅ Demo mode as fallback
4. ✅ Support for all timeframes
5. ✅ More forex pairs (12,000+)

---

## 📝 Next Steps

1. **Get your free API key** from twelvedata.com
2. **Update .env file** with new key
3. **Restart backend** server
4. **Test the app** - Should work perfectly!

---

## 🆘 Having Issues?

**API Key Not Working?**
- Check you verified your email
- Make sure key has no spaces
- Restart backend after updating .env

**Still See Demo Mode?**
- Check backend console for error messages
- Verify .env file saved properly
- Try demo key first: `demo` (limited pairs)

**Rate Limit Errors?**
- You hit 800 calls today
- Wait for daily reset (midnight UTC)
- Or upgrade to paid plan

---

## 🎓 API Documentation

Twelve Data Docs: https://twelvedata.com/docs
- Forex endpoints
- Technical indicators
- WebSocket streaming
- API reference

---

Your app will be **much more reliable** with Twelve Data! 🎉
